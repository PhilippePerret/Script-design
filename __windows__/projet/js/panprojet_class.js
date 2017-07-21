let moment = require('moment')
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
    if(!projet){throw(new Error("Un panneau doit obligatoirement être initialisé avec son projet, maintenant."))}
    this.__ID   = PanProjet.newID()
    this.id     = name
    this.name   = name // p.e. 'data', ou 'scenier'
    // Mis à true quand le panneau est le panneau courant. Sert notamment à
    // savoir si des actualisations se font "par derrière" et donc ne doivent
    // pas être reflétées dans le panneau.
    this.actif  = false
    // Mis à true quand les données du panneau ont été chargées (qu'elles
    // existent ou non)
    this.loaded = false
    this.projet = projet
  }

  /* --- Public --- */

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
  activate () {
    // console.log("-> activate panneau")
    this.loaded || this.load()
    DOM.addClass(`panneau-${this.id}`,'actif')
    // Le panneau pouvant être enregistré alors qu'un autre est activé,
    // il faut vérifier sa marque à son activation.
    this.setupLight()
    this.actif = true
  }
  desactivate () {
    // Avant de désactiver le panneau, on déselectionne les sélections
    // et la marque de paragraphe courant.
    this.parags.selection.reset()
    DOM.removeClass(`panneau-${this.id}`,'actif')
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
    this._container || (this._container=DOM.get(`panneau-${this.id}-contents`))
    return this._container
  }
  /**
  * @return {HTML} La section complète du panneau
  **/
  get section ()
  {
    this._section || (this._section = DOM.get(`panneau-${this.name}`))
    return this._section
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
    // Noter que dans les tests unitaires the.light se sera pas défini,
    // par défaut.
    this.section && this.setupLight()
    this.projet.modified = true
  }
  setupLight () {
    this.light.innerHTML = this._modified ? '🔴' : '🔵'
  }
  get light () {
    this._light || (this._light = this.section.getElementsByClassName('statelight')[0])
    return this._light
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
    console.log("-> PanProjet#load", this.id)
    let my = this
    my.data = ''
    my.afterLoadingCallback = callback_method
    my.store.getData(my.loadWithStream.bind(my), my.onEndStreaming.bind(my))
    if ( callback_method ) {
      console.log("Une fonction callback sera à jouer.", callback_method)
    }
    console.log("<- PanProjet#load (async)", this.id)
  }
  loadWithStream ( chunk )
  {
    this.data += chunk
  }
  onEndStreaming ()
  {
    const my = this
    console.log(`-> onEndStreaming du panneau#${this.id}`)
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
    // Attention, ici, on ne peut pas faire `this.parags`, car cette méthode
    // relève les parags dans l'interface (pour enregistrement) et, pour le
    // moment, il n'y en a pas.
    this.data.parags && this.displayParags()
    this.loaded = true

    // S'il faut appeler une méthode après le chargement (ce qui arrive par
    // exemple pour la synchronisation des paragraphes)
    if ( my.afterLoadingCallback )
    {
      console.log('[onEndStreaming] my.afterLoadingCallback est défini')
    }
    if( 'function' === typeof my.afterLoadingCallback ) {
      console.log("Je joue la méthode afterLoadingCallback")
      my.afterLoadingCallback.call(my)
    }

  }


  /**
  * Procède à la sauvegarde des données actuelles
  **/
  save ()
  {
    // console.log("-> save")
    if ( ! this.modified )
    {
      alert(`Le panneau ${this.projet.id}/${this.name} n'est pas marqué modifié, normalement, je ne devrais pas avoir à le sauver.`)
    }
    // La sauvegarde est asynchrone, on doit donc attendre qu'elle soit
    // faite pour poursuivre.
    console.log(`-> PanProjet#save sauvegarde du panneau '${this.id}'`, this.data2save)
    // console.log("<- save"))
    this.store._data = this.data2save
    this.store.save(false)
    console.log("<- PanProjet#save")
  }
  /**
  * Méthode appelée lorsque la sauvegarde est terminée, avec succès
  *
  * Elle est appelée par la class Store, dans Store#save
  **/
  onFinishSave ()
  {
    // console.log("-> onFinishSave")
    // Si nécessaire, on procède à la sauvegarde des relatives
    this.projet.relatives.modified && this.projet.relatives.save()
    this.setAllParagsUnmodified()
    this.modified = false
    this.projet.checkModifiedState()
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
      , parags      : this.parags_as_data
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
      , parags  : []
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

  // Attention, les deux méthodes parags et parags= ne sont pas du tout les
  // même. La méthode `parags=` ci-dessous permet de répondre au chargement
  // lorsque les données sont dispatchées dans le panneau alors que la méthode
  // `parags` retourne une instance Parags qui permet de gérer les parags.
  // Cette méthode ne sert plus nom plus à ajouter les paragraphes à
  // parags
  set parags ( hparags ) {
    // this.parags.items = hparags
  }

  /**
  * Marque tous les paragraphes comme non modifiés.
  * Cette méthode sert après l'enregistrement du panneau.
  **/
  setAllParagsUnmodified () { this.parags.setUnmodified('all') }

  /**
  * @return {Array} les données du paragraphe du panneau.
  **/
  get parags_as_data () { return this.parags.as_data }

  /**
  * Méthode appelée après le load, permettant d'afficher les paragraphes
  * courants.
  **/
  displayParags ()
  {
    this.parags.add(
      this.data.parags.map(hparag=>{return new Parag( hparag )}),
      {reset: true}
    )
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
  **/
  get store_path ()
  {
    this._store_path || (this._store_path = path.join('projets',this.projet.id,this.name))
    return this._store_path
  }

}// /fin class PanProjet


module.exports = PanProjet
