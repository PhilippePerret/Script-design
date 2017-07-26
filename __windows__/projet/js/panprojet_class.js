let moment  = require('moment')
  , fs      = require('fs')
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

  constructor (name, projet)
  {
    if(!name){throw(new Error("Il faut fournir l'identifiant du panneau à initialiser."))}
    if(Projet.PANNEAU_LIST.indexOf(name) < 0){throw(new Error(`'${name}' n'est pas un identifiant de panneau valide.`))}
    if(!projet){throw(new Error("Un panneau doit obligatoirement être initialisé avec son projet."))}
    this.__ID   = PanProjet.newID()
    this.id     = name
    this.name   = name // p.e. 'data', ou 'scenier'
    // Mis à true quand le panneau est le panneau courant. Sert notamment à
    // savoir si des actualisations se font "par derrière" et donc ne doivent
    // pas être reflétées dans le panneau.
    this.actif  = false
    // Mis à true quand les données du panneau ont été chargées (qu'elles
    // existent ou non)
    this.loaded   = false
    this.loading  = false
    this.projet   = projet
  }

  /* --- Public --- */

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
    // console.log("-> activate panneau")
    this.loaded || this.load( (err) => {
      if (err) { throw err }
      DOM.addClass(this.section,'actif')
      this.actif = true
      callback && callback.call()
    })
  }
  desactivate () {
    // Avant de désactiver le panneau, on déselectionne les sélections
    // et la marque de paragraphe courant.
    this.parags.selection.reset()
    DOM.removeClass(this.section,'actif')
    // On supprime aussi l'annulation possible
    delete this.projet.cancelableMethod
    // Puis on marque que le panneau n'est plus actif.
    this.actif = false
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
  * Procède au chargement des données de ce panneau/élément narratif
  **/
  load ( callback_method )
  {
    // console.log("-> PanProjet#load", this.id)
    let my = this
    my.data = ''
    my.afterLoadingCallback = callback_method
    my.store.getData( my.loadWithStream.bind(my), my.onEndStreaming.bind(my) )
  }
  loadWithStream ( chunk )
  {
    this.data += chunk
  }
  onEndStreaming ()
  {
    const my    = this
    // console.log(`-> onEndStreaming du panneau#${my.id}`)
    this.loaded = true
    // console.log('[onEndStreaming] my.data =', my.data)
    if (my.data && my.data != '')
    {
      my.data = JSON.parse(my.data)
    }
    else
    {
      my.data = my.defaultData
    }
    // console.log(my.data)
    for( let prop in my.data ) {
      my[prop] = my.data[prop]
    }
    // S'il y a des paragraphes, il faut les afficher
    this.data.pids && this.data.pids.length && this.displayParags()

    // S'il faut appeler une méthode après le chargement (ce qui arrive par
    // exemple pour la synchronisation des paragraphes)
    if ( my.afterLoadingCallback )
    {
      // console.log('[onEndStreaming] my.afterLoadingCallback est défini')
    }
    if( 'function' === typeof my.afterLoadingCallback ) {
      // console.log("Je joue la méthode afterLoadingCallback")
      my.afterLoadingCallback.call(my)
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
    // console.log(`PanProjet#${this.id} -> instancieAllParags()`)
    const my = this
    if ( undefined === my.parags2add_list )
    {
      my.parags.reset()
      // Noter que maintenant, ci-dessous, le paragraphe est seulement initialisé
      // avec son identifiant et le projet (note on pourrait ajouter le panneau, aussi)
      my.parags2display_list  = my.data.pids.map( pid => { return new Parag({id: pid, projet: my.projet}) } )
    }
    if ( is_panneau_courant && my.parags2display_list.length )
    {
      // Pour la boucle asynchrone
      this.parags.add(my.parags2display_list.shift(), undefined, my.displayAllParags.bind(my, true))
    }
    else
    {
      // console.log("[displayParags] Fin de l'affichage de tous les paragraphes")
      delete my.parags2display_list
      if ( callback ) { callback.call() }
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
