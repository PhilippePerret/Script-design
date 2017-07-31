/** ---------------------------------------------------------------------
  *   class PanProjet
  *   ---------------
  *   Un panneau est bien plus qu'un panneau. Il gère aussi un élément
  *   complet du projet comme le scénier, le synopsis ou le manuscrit.
  *   C'est par lui que passe la sauvegarde, il est associé à un fichier
  *   JSON qui contient toutes ses données, même ses préférences.
  *
*** --------------------------------------------------------------------- */

class PanProjet
{
  // Pour donner un identifiant unique au panneau
  static newID () {
    if ( !this._newid ) { this._newid = 0 }
    this._newid ++
    return this._newid
  }

  /**
  * @return {String} La lettre correspondant au panneau +pan_id+
  *
  * @param {String} pan_id ID du panneau (p.e. 'scenier' ou 'notes')
  **/
  static oneLetterOf ( pan_id )
  {
    return Projet.PANNEAUX_DATA[pan_id].oneLetter
  }


  /** ---------------------------------------------------------------------
    *
    *   INSTANCES
    *
  *** --------------------------------------------------------------------- */

  constructor (name, projet)
  {
    if(!name){throw(new Error("Il faut fournir l'identifiant du panneau à initialiser."))}
    if(Projet.PANNEAU_LIST.indexOf(name) < 0){throw(new Error(`'${name}' n'est pas un identifiant de panneau valide.`))}
    if(!projet){throw(new Error("Un panneau doit obligatoirement être initialisé avec son projet."))}
    this.__ID     = PanProjet.newID()
    this.id       = name // p.e. 'data', ou 'scenier'
    this.name     = name // idem que id
    this.projet   = projet
    this.reset()
  }

  /**
  * Réinitialisation complète du panneau
  *
  * La méthode est appelée à l'instanciation mais aussi au cours des
  * tests
  **/
  reset ()
  {
    // Mis à true quand le panneau est le panneau courant. Sert notamment à
    // savoir si des actualisations se font "par derrière" et donc ne doivent
    // pas être reflétées dans le panneau.
    this.actif      = false

    // Mis à true quand les données des PARAGS du panneau ont été chargées
    this.loading    = false

    // Mis à true quand les paragraphes ont été affichés
    this.displayed  = false
    this.built      = false

    /*  Réinitialisation complète de sa donnée Parags */

    this.parags.reset()

    /*  Destruction de certaines propriétés volatiles */

    delete this._loaded
    delete this._container
    delete this._section
    delete this._dom_id
    delete this._prefs
    delete this._parags
    delete this._store

    this._modified = false

  }

  /* --- Public --- */

  isCurrent () {
    return this.projet.current_panneau.id == this.id
  }

  /**
  * @return true si les données du panneau (et seulement ses données, pas
  * ses parags) sont chargées.
  **/
  get loaded ()
  {
    this._loaded || ( this._loaded = (this.pids !== undefined) )
    return this._loaded
  }

  /**
  * @return {Objet} Les données absolues du panneau (dans Projet.PANNEAUX_DATA)
  **/
  get absData () {
    this._absdata || ( this._absdata = Projet.PANNEAUX_DATA[this.id] )
    return this._absdata
  }
  /**
  * Ajouter un parag au panneau, comme la méthode parags.add, mais
  * marque le panneau modifié.
  *
  * @param {Parag|Array} aparags Une instance Parag ou une liste
  *                              d'instances.
  * @param {Object|Null} options  Options pour l'ajout. Cf. Parags.add
  **/
  add (aparags, options) {
    if ( !Array.isArray(aparags) ) { aparags = [aparags]}
    if ( !aparags[0] || aparags[0].constructor.name != 'Parag'){
      throw new Error("Il faut fournir un Parag en premier argument de `add`.")
    }
    this.parags.add(aparags, options)
    this.modified = true
  }

  /** ---------------------------------------------------------------------
    *
    *  MÉTHODES PROMESSES POUR L'ACTIVATION
    *
  *** --------------------------------------------------------------------- */

  /**
  * Méthode principale d'activation du panneau.
  *
  * Elle fonctionne à base de promises
  *
  **/
  PRactivate ()
  {
    const my = this

    return my.PRloadData()
      .then(  my.PRloadAllParags.bind(my)     )
      .then(  my.PRdisplayAllParags.bind(my)  )
      .then(  my.PRhideCurrent.bind(my)       )
      .then(  my.PRshow.bind(my)              )
      .catch( (err) => { throw err } )
  }

  PRdesactivate () {

    this.parags.selection.reset()
    // Avant de désactiver le panneau, on déselectionne les sélections
    // et la marque de paragraphe courant.

    return this.PRhideCurrent()
    // Comme le panneau est le panneau courant, il suffit de le
    // rendre non courant.

  }

  /**
  * Méthode asynchrone téléchargeant les données du panneau si nécessaire
  *
  * @return {Promise}
  **/
  PRloadData ()
  {
    const my = this

    if ( true === my.loaded )
    {
      return Promise.resolve()
    }
    else if ( ! fs.existsSync(my.store.path) )
    {
      my.setDefaultData()
      return Promise.resolve()
    }
    else
    {
      return new Promise( (ok, notok) => {
        my.store.loadSync()
        my.prepareData()
        ok(true)
      })
    }
  }

  /**
  * Méthode qui prépare les données après les avoir chargées
  *
  * Noter qu'elles ont déjà été dispatchées dans la méthode `loadAndTreatSync`
  **/
  prepareData ()
  {
    const my    = this
    const proj  = my.projet
    const panid = my.id

    let instances = my.pids.map( pid => {
      return new Parag( {id: pid, projet: proj, panneau_id: panid })
    })

    /*  Ajoute les parags au panneau (sans les afficher)
        Note : même s'il n'y a pas de parags, on le fait, pour le reset */

    my.parags.addNotNew( instances, {reset: true, display: false} )

  }

  /**
  * Méthode asynchrone téléchargeant toutes les données des parags
  * du panneau (contenues dans pids dans les data)
  *
  * @return {Promise}
  **/
  PRloadAllParags ()
  {
    const my = this
    return Promise.all( my.parags.map( p => p.PRload.bind(p).call() ) )
  }

  /**
  * Méthode asynchrone affichant tous les paragraphes
  *
  * @return {Promise}
  *
  **/
  PRdisplayAllParags ()
  {
    const my = this
    let promises = my.parags.map( p => p.PRdisplay.bind(p).call() )
    promises.push( my.PRsetDisplayed.bind(my).call() )
    return Promise.all( promises )
  }
  /**
   * Méthode appelée par la précédente permettant de mettre la propriété
   * `displayed` du panneau à true si tous les parags ont bien pu être
   * affichés.
   */
  PRsetDisplayed ()
  {
    this.displayed = true
    return Promise.resolve()
  }

  /**
  * Méthode asynchrone qui masque le panneau courant
  *
  * @return {Promise}
  *
  * Noter que cette méthode est aussi bien appelée lorsque l'on
  * désactive un autre panneau que le panneau présent.
  **/
  PRhideCurrent ()
  {
    const my      = this

    const curPan  = my.projet.current_panneau
    // C'est l'instance présence si le panneau est le panneau courant

    return new Promise(function(ok, notok){
      if ( curPan )
      {
        curPan.section.className = 'panneau'
        curPan.actif = false
        my.projet.current_panneau  = undefined // donc 'data'
        my.projet.cancelableMethod = undefined
      }
      ok(true)
    })
  }

  /**
  * Méthode asynchrone affichant finalement le panneau (section)
  **/
  PRshow ()
  {
    const my = this
    return new Promise(function(ok, pasok){
      my.section.className = 'panneau actif'
      my.actif      = true
      my.displayed  = true
      my.projet.current_panneau = my
      ok(true)
    })
  }

  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES APPELÉES PAR LES COMMANDES
    *
  *** --------------------------------------------------------------------- */

  defaultCommandMethod ( arg )
  {
    if ('function' === typeof this[arg]) {
      this[arg].call(this)
    } else {
      throw new Error(`La commande '${arg}' est inconnue. Il faut l'implémenter dans la classe PanProjet.`)
    }
  }
  print ()
  {
    alert("Pour le moment, je ne sais pas encore imprimer un panneau.")
  }

  export ()
  {
    alert("Pour le moment, je ne sais pas encore exporter un panneau.")
  }

  // On synchronise les paragraphes du panneau
  synchronize ()
  {
    this.parags.items.forEach( (iparag) => iparag.sync() )
    UILog("Synchronisation de tous les parags de ce panneau effectuée.")
  }

  cutParagByReturn ()
  {
    return alert("Pour le moment, on ne peut pas découper les parags suivant les retours chariot")
    if(!confirm("Voulez-vous vraiment découper les parags suivant les retours-chariot.\n\nDès qu'un parag contient un retour-chariot, on le découpe en plusieurs Parags séparés (mais héritant des mêmes propriétés)"))
    {return false}
  }
  // Pour ouvrir le dossier du projet
  folderprojet ()
  {
    let exec = require('child_process').exec
    exec(`open "${this.projet.folder}"`, (error, stdout, stderr) => {console.log(error, stdout)})
  }
  /** ---------------------------------------------------------------------
    *
    *   DATA
    *
  *** --------------------------------------------------------------------- */


  /**
  * Élément principal du pan-projet contenant tous les éléments {Parag}
  *
  * @return {HTMLElement} Le container dans le DOM des éléments du pan-projet
  **/
  get container () {
    this._container || (this._container = DOM.get(`${this.dom_id}-contents`))
    return this._container
  }
  /**
  * @return {HTML} La section complète du panneau
  **/
  get section ()
  {
    this._section || ( this._section = DOM.get(this.dom_id) )
    return this._section
  }

  get dom_id () {
    this._dom_id || ( this._dom_id = `panneau-${this.id}` )
    return this._dom_id
  }


  /** ---------------------------------------------------------------------
    *
    *   Méthodes interface
    *
  *** --------------------------------------------------------------------- */
  get modified () { return this._modified || false }
  set modified (v)
  {
    console.log("-> PanProjet#modified (panneau %s) avec la valeur %s", this.id, v)
    // if ( v == true )
    // {
    //   try{throw new Error("Pour voir quand on met modified à true")}
    //   catch(err){
    //     console.log(err)
    //   }
    // }
    this._modified = !!v
    this.projet.modified = !!v
  }

  setModeDouble (cote)
  {
    DOM.addClass(this.section, `modedbl${cote}`)
  }
  unsetModeDouble ()
  {
    DOM.removeClass(this.section, `modedblleft`)
    DOM.removeClass(this.section, `modedblright`)
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes préférences
    *
  *** --------------------------------------------------------------------- */

  // Les préférences. Pour le moment, rien
  get prefs () { return this._prefs }
  set prefs (v){ this._prefs = v    }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes DATA
    *
  *** --------------------------------------------------------------------- */

  /**
  * Procède à la sauvegarde des données actuelles du panneau
  **/
  save ( callback )
  {
    const my = this
    // console.log("-> save")
    if ( ! my.modified ) { return UILog(`Panneau ${my.projet.id}/${my.id} non modifié.`)}

    // La sauvegarde est asynchrone, on doit donc attendre qu'elle soit
    // faite pour poursuivre.
    // console.log(`-> PanProjet#save sauvegarde du panneau '${this.id}'`, this.data2save)
    // console.log("<- save"))
    return my.store.save()
      .then( my.projet.relatives.save.bind(my.projet.relatives) )
      .then( my.onFinishSave.bind(my) )
      .catch((err) => { throw err })
  }

  // Utiliser par Store pour envoyer les données
  set data (h) {
    if ( h ){
      for( let k in h ) {
        if ( h.hasOwnProperty(k) ) { this[k] = h[k] }
      }
    }
  }
  get data () {
    return this.data2save
  }

  /**
  * Méthode appelée lorsque la sauvegarde s'est terminée avec succès
  *
  * Elle est appelée par la class Store, dans Store#save
  **/
  onFinishSave ()
  {
    const my = this

    return new Promise( (ok, ko) => {
      // console.log('-> Promise de PanProjet#onFinishSave (panneau %s)', my.id)
      my.setAllParagsUnmodified.bind(my).call()
      my.projet.checkModifiedState.bind(my.projet).call()
      ok()
    })
  }

  /**
  * @return {Object} La table des données à sauver
  *
  * Note : updated_at sera actualisé par Store.
  *
  * (1) Remplacé dans l'instance Store
  **/
  get data2save ()
  {
    return {
        name        : this.id
      , prefs       : this.prefs
      , pids        : this.parags._ids || this.pids
      , created_at  : this.created_at || moment().format()
      , updated_at  : true // (1)
    }
  }

  /**
   * On définit les données par défaut du panneau.
   *
   * Note : pour le moment, ça se fait même pour le panneau des données
   * générales.
   *
   */
  setDefaultData ()
  {
    const my = this
    my.pids = []

  }

  /**
  * @property Instance des parags du panneau
  **/
  get parags ()
  {
    this._parags || ( this._parags = new Parags(this) )
    return this._parags
  }

  /**
  * @property {String} le panneau courant en version 1-lettre
  *
  * Cette valeur est utile pour les relatives et pour l'enregistrement du
  * paragraphe.
  **/
  get oneLetter ()
  {
    this._oneletter || ( this._oneletter = PanProjet.oneLetterOf(this.id))
    return this._oneletter
  }



  /** ---------------------------------------------------------------------
    *
    *   Raccourcis pour les paragraphes
    *
  *** --------------------------------------------------------------------- */
  select          (e) { return this.parags.select(e)            }
  deselect        (e) { return this.parags.deselect(e)          }
  deselectAll     ()  { return this.parags.deselectAll()        }
  selectNext      (e) { return this.parags.selectNext(e)        }
  selectPrevious  (e) { return this.parags.selectPrevious(e)    }
  moveCurrentUp   (e) { return this.parags.moveCurrentUp(e)     }
  moveCurrentDown (e) { return this.parags.moveCurrentDown(e)   }
  hasCurrent      (e) { return this.parags.hasCurrent()         }
  removeCurrent   ()  { return this.parags.removeCurrent()      }
  editCurrent     ()  { return this.parags.editCurrent()        }

  /**
  * Marque tous les paragraphes comme non modifiés.
  * Cette méthode sert après l'enregistrement du panneau.
  **/
  setAllParagsUnmodified () { this.parags.setUnmodified('all') }


  /**
  * @return {Store} L'instance store qui va permettre d'enregistrer les
  * données du panneau.
  **/
  get store ()
  {
    this._store || (this._store = new Store(this.store_path, this))
    return this._store
  }

  /**
  * @return {String} Le path du fichier JSON contenant les données du panneau
  * SAUF les paragraphes depuis l'enregistrement en longueurs fixes
  **/
  get store_path ()
  {
    this._store_path || (this._store_path = path.join('projets',this.projet.id,this.name))
    return this._store_path
  }



}// /fin class PanProjet


module.exports = PanProjet
