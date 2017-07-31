/** ---------------------------------------------------------------------
  *   class PanData
  *   ---------------
  *   Pour la gestion du panneau Data du projet, et les data elles-mêmes
  *
*** --------------------------------------------------------------------- */

class PanData
{

  /** ---------------------------------------------------------------------
    *
    *   INSTANCES
    *
  *** --------------------------------------------------------------------- */

  constructor (projet)
  {
    if(!projet){throw(new Error("Le panneau Data doit être initialisé avec son projet."))}
    this.id       = 'data'
    this.name     = 'data'
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

    /*  Destruction de certaines propriétés volatiles */

    delete this._loaded
    delete this._container
    delete this._section
    delete this._dom_id
    delete this._prefs
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
    this._loaded || ( this._loaded = ('string' === typeof this.summary) )
    return this._loaded
  }

  /** ---------------------------------------------------------------------
    *
    *   PROPRIÉTÉS DU PROJET
    *
  *** --------------------------------------------------------------------- */

  get data          () {
    if ( undefined === this._data )
    {
      if ( this.store.exists() ) {
        this.store.loadSync()
      } else {
        this.setDefaultData()
      }
    }
    return this._data
  }
  get title         () { return this.data.title         }
  get summary       () { return this.data.summary       }
  get authors       () { return this.data.authors       }
  get created_at    () { return this.data.created_at    }
  get updated_at    () { return this.data.updated_at    }
  get last_parag_id () { return this.data.last_parag_id }

  set data          (v){ this._data = v }
  set title         (v){ this.data.title = v        ; this.setModified()  }
  set summary       (v){ this.data.summary = v      ; this.setModified()  }
  set authors       (v){ this.data.authors = v      ; this.setModified()  }
  set created_at    (v){ this.data.created_at = v   ; this.setModified()  }
  set updated_at    (v){ this.data.updated_at = v /* surtout pas de setModified !*/}
  set last_parag_id (v){this.data.last_parag_id = v ; this.setModified()  }

  setModified ()
  {
    this.modified = true
  }

  /**
  * @return {Objet} Les données absolues du panneau (dans Projet.PANNEAUX_DATA)
  **/
  get absData () {
    this._absdata || ( this._absdata = Projet.PANNEAUX_DATA[this.id] )
    return this._absdata
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
      .then( my.PRafficheData.bind(my)  )
      .then( my.PRhideCurrent.bind(my)  )
      .then( my.PRshow.bind(my)         )
      .then( my.PRsetDisplayed.bind(my) )
      .catch( (err) => { throw err } )
  }

  /**
  * Désactiver le panneau
  **/
  PRdesactivate () {
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
        ok(true)
      })
    }
  }

  /**
  * Méthode faussement synchrone affichant toutes les données dans le
  * panneau au moment de son activation.
  **/
  PRafficheData ()
  {
    const my = this
    let prop, selector, value
    for(let prop in my.data)
    {
      if ( ! my.data.hasOwnProperty(prop) ) { continue }
      if ( selector = my.container.querySelector(`span#${prop}`))
      {
        switch(prop)
        {
          case 'created_at':
          case 'updated_at':
            let c = moment(my[prop])
            value = `${c.format('LLL')} (${c.fromNow()})`
            break
          default:
            value = my[prop]
        }
        selector.innerHTML = value
      }
    }
    return Promise.resolve()
  }

  /**
   * Méthode appelée par la précédente permettant de mettre la propriété
   * `displayed` du panneau à true si toutes les données ont bien pu être
   * affichées.
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
    alert("Pour le moment, je ne sais pas encore imprimer le panneau Data.")
  }

  export ()
  {
    alert("Pour le moment, je ne sais pas encore exporter le panneau Data.")
  }

  // On synchronise les paragraphes du panneau
  synchronize ()
  {
    alert("Le panneau Data ne peut pas être synchronisé.")
  }

  cutParagByReturn ()
  {
    if(!confirm("Voulez-vous vraiment découper les parags DE TOUS LES PANNEAUX suivant les retours-chariot.\n\nDès qu'un parag contient un retour-chariot, on le découpe en plusieurs Parags séparés (mais héritant des mêmes propriétés)"))
    {return false}
    return alert("Pour le moment, on ne peut pas découper les parags suivant les retours chariot")
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
    this._modified = !!v
    this.projet.modified = true
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
  * Procède à la sauvegarde des données actuelles
  *
  * @return {Promise} Une promise pour pouvoir être appelé comme les
  * autres panneaux modifiés par Promise.all
  **/
  save ( callback )
  {
    const my = this
    if ( ! my.modified ) { return UILog("Data générales non modifiées…")}
    my.store.saveSync()
    my.projet.checkModifiedState()
    return Promise.resolve()
  }

  /**
   * On définit les données par défaut
   *
   */
  setDefaultData ()
  {
    this.data = {
        title         : 'Projet indéfini'
      , summary       : 'Résumé non défini du projet'
      , last_parag_id : 0
      , created_at    : moment().format()
      , updated_at    : moment().format()
    }
  }

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


module.exports = PanData
