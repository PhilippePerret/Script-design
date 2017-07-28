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
    this.loaded     = false
    this.loading    = false

    // Mis à true quand les données du panneau ont été chargées, qu'elles
    // existent ou non.
    this.dataLoaded = false

    // Mis à true quand les paragraphes ont été affichés
    this.paragsDisplayed = false

    /*  Réinitialisation complète de sa donnée Parags */

    this.parags.reset()

    /*  Destruction de certaines propriétés volatiles */

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

  /**
  * Racourci
  * @return {Array} Liste des identifiants du panneau
  **/
  get parags_ids () { return this.parags._ids }
  set parags_ids (v) {
    throw new Error("PanProjet#parags_ids ne doit pas être atteint directement. Utiliser `add`.")
  }

  /**
  * Les méthodes appelées par le menu des commandes
  **/
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
  * Pour activer/désactiver le panneau, c'est-à-dire le mettre en panneau
  * courant, affiché dans l'interface.
  **/
  activate ( callback ) {
    const my = this

    // console.log("-> activate panneau '%s'", my.id)

    // Dans tous les cas, on active le panneau
    my.section.className = 'panneau actif'
    my.actif = true

    // console.log("-> activate panneau")
    if ( my.dataLoaded && my.loaded ) {
      if ( ! my.paragsDisplayed )
      {
        // <= Toutes les données ont été chargées, mais les parags n'ont
        //    pas été affichés.
        // => Il faut afficher les parags
        my.displayParags( callback )
      }
      else
      {
        // <= Toutes les données ont été chargées et les parags ont déjà
        //    été affichés.
        // => Il suffit d'activer le panneau. Peut-être que plus tard il y
        //    aura des actualisations à faire.
      }
    }
    else
    {
      // <= Les données ou les parags n'ont pas été chargées
      // => Il faut tout charger et réappeler cette méthode
      my.load( my.activate.bind(my, callback) )
    }

    // console.log("<- activate panneau '%s'", my.id)

  }
  desactivate () {
    // console.log("-> desactivate panneau#%s", this.id)

    this.parags.selection.reset()
    // Avant de désactiver le panneau, on déselectionne les sélections
    // et la marque de paragraphe courant.

    this.section.className = 'panneau'
    // Ici, avant, j'utilisais DOM.removeClass, mais ça ne retirait pas la
    // class 'actif', en tout cas pas à tous les coups.

    // On supprime aussi l'annulation possible
    delete this.projet.cancelableMethod

    /* - le panneau n'est plus actif - */

    this.actif = false

    // console.log("<- desactivate panneau#%s", this.id)
  }

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
    this._modified = !!v
    this.projet.modified = true
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
    *   Raccourcis
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
  * Procède au chargement des paragraphes et des données si nécessaire
  *
  **/
  load ( callback )
  {
    const my = this

    if ( false === my.dataLoaded ) {
      return my.loadData( my.load.bind(my, callback) )
    }

    // S'il y a des paragraphes, et que ce panneau est le panneau
    // courant, alors il faut afficher les paragraphes
    if (  my.projet.current_panneau.id == my.id
          && my.data.pids
          && my.data.pids.length )
    {

      my.loaded = true
      my.displayParags( callback )

    } else if ( 'function' === typeof callback ) {

      my.loaded = true
      callback.call()

    }

  }


  /**
  * Procède au chargement des données de ce panneau/élément narratif
  **/
  loadData ( callback )
  {
    if ( this.dataLoaded )
    {
      /*  Si les données ont déjà été chargée, on ne fait rien */

      if ( 'function'==typeof callback ) { callback.call() }
    }
    else
    {
      // console.log("-> PanProjet#loadData de panneau '%s'", this.id)
      let my = this
      my.data = ''
      my.afterLoadingCallback = callback
      my.store.getData( my.loadWithStream.bind(my), my.onEndStreaming.bind(my) )
    }
  }
  loadWithStream ( chunk )
  {
    this.data += chunk
  }
  onEndStreaming ()
  {
    // console.log('-> PanProjet#onEndStreaming du panneau "%s"', this.id)
    const my    = this

    if (my.data && my.data != '')
    {
      my.data = JSON.parse(my.data)
    }
    else
    {
      my.data = my.defaultData
    }
    // console.log('[PanProjet#onEndStreaming] Panneau "%s" / my.data définies', this.id)

    /*  On dispatche toutes les données du panneau */

    for( let prop in my.data ) { my[prop] = my.data[prop] }
    // console.log('[PanProjet#onEndStreaming] Panneau "%s" / my.data dispatchées', this.id)

    /*  On crée les instances de parags

        (mais sans les ajouter encore au panneau, ce qui sera
         fait uniquement si c'est nécessaire)
    */
    // console.log('[PanProjet#onEndStreaming] Panneau "%s" / pids', my.id, my.data.pids)

    const projet  = my.projet
    const panid   = my.id

    if ( my.data.pids )
    {
      // <= Si ce n'est pas le panneau des données générales
      let instances = my.data.pids.map( pid => {
        return new Parag( {id: pid, projet: projet, panneau_id: panid })
      })
      // console.log('[PanProjet#onEndStreaming] Panneau "%s" / instances créées', this.id)

      /*  Ajoute les parags au panneau (sans les afficher)
          Note : même s'il n'y a pas de parags, on le fait, pour le reset */

      my.parags.addNotNew( instances, {reset: true, display: false} )
      // console.log('[PanProjet#onEndStreaming] Panneau "%s" / Instances introduites dans le panneau', this.id)
    }

    /*  Pour indiquer que les données ont été chargées  */

    this.dataLoaded = true

    /*  Fonction de callback si elle est définie  */

    // console.log('<- PanProjet#onEndStreaming du panneau "%s" (avant appel callback)', this.id)

    if( 'function' === typeof my.afterLoadingCallback ) {
      // console.log('[PanProjet#onEndStreaming] Appel de la méthode callback')
      my.afterLoadingCallback.call()
    }


  }

  /**
  * Procède à la sauvegarde des données actuelles
  **/
  save ( callback )
  {
    const my = this
    // console.log("-> save")
    if ( ! my.modified )
    {
      alert(`Le panneau ${my.projet.id}/${my.name} n'est pas marqué modifié, normalement, je ne devrais pas avoir à le sauver.`)
    }
    // La sauvegarde est asynchrone, on doit donc attendre qu'elle soit
    // faite pour poursuivre.
    // console.log(`-> PanProjet#save sauvegarde du panneau '${this.id}'`, this.data2save)
    // console.log("<- save"))
    my.store._data = my.data2save
    my.store.save(false, my.onFinishSave.bind(my, callback) )
    // console.log("<- PanProjet#save")
  }
  /**
  * Méthode appelée lorsque la sauvegarde est terminée, avec succès
  *
  * Elle est appelée par la class Store, dans Store#save
  **/
  onFinishSave (callback)
  {
    // console.log("-> onFinishSave")
    // Si nécessaire, on procède à la sauvegarde des relatives
    this.projet.relatives.modified && this.projet.relatives.save()
    this.setAllParagsUnmodified()
    this.modified = false
    this.projet.checkModifiedState()
    if ( callback ) { callback.call() }
    // console.log("<- onFinishSave")
  }

  /**
  * @return {Object} La table des données à sauver
  **/
  get data2save ()
  {
    let now = moment().format()
    return {
        name        : this.id
      , prefs       : this.prefs
      , pids        : this.parags._ids
      , updated_at  : now
      , created_at  : this.created_at || now
    }
  }


  /**
  * @return {Object} Les données par défaut pour le panneau. C'est celle qui
  * sont transmises à l'instanciation du store du panneau.
  **/
  get defaultData () {
    return {
        name    : this.id
      , id      : this.id
      , prefs   : this.prefs
      , pids    : []
    }
  }


  /**
  * Nouvelle propriété `parags' d'instance Parags
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

  /**
  * Marque tous les paragraphes comme non modifiés.
  * Cette méthode sert après l'enregistrement du panneau.
  **/
  setAllParagsUnmodified () { this.parags.setUnmodified('all') }

  /**
  * Méthode appelée après le load, permettant d'afficher les paragraphes
  * courants.
  **/
  displayParags ( callback )
  {
    // console.log(`PanProjet#${this.id} -> displayParags()`)
    this.displayAllParags(this.id == this.projet.current_panneau.id, callback)
  }

  /**
  * Méthode en boucle qui procède à l'affichage de tous les paragraphes,
  * les uns après les autres.
  **/
  displayAllParags ( is_panneau_courant, callback )
  {
    const my = this
    // console.log(`PanProjet#${this.id} -> instancieAllParags()`)
    if ( undefined === my.parags2add_list )
    {
      my.parags2display_list = my.parags.items.slice(0,-1) // pour faire une copie
    }
    if ( is_panneau_courant && my.parags2display_list.length )
    {
      // Pour la boucle asynchrone
      my.parags.add(my.parags2display_list.shift())
    }
    else
    {

      // Quand tous les parags ont été affichés

      my.paragsDisplayed = true

      // console.log("[displayParags] Fin de l'affichage de tous les paragraphes")
      delete my.parags2display_list
      callback && callback.call()
    }

  }

  /**
  * @return {Store} L'instance store qui va permettre d'enregistrer les
  * données du panneau.
  **/
  get store ()
  {
    this._store || (this._store = new Store(this.store_path, this.defaultData, this))
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

  /**
  * @return {String} Le path du fichier TEXT contenant tous les paragraphes
  * en longueur fixe (appartient à tout le projet).
  **/
  get parags_file_path () { return this.projet.parags_file_path }

}// /fin class PanProjet


module.exports = PanProjet
