/** ---------------------------------------------------------------------
  *   API Projet
  *
*** --------------------------------------------------------------------- */
/*

  Projet API
  ----------

*/
let
      ipc     = require('electron').ipcRenderer
    , moment  = require('moment')

moment.locale('fr')

// log, DOM et Select sont utiles

  //   C.LOG_MODULE_PATH
  // , C.DOM_MODULE_PATH     // => DOM
  // , C.SELECT_MODULE_PATH  // => Select

/** ---------------------------------------------------------------------
  *
  *   class Projet
  *   ------------
  *   Gestion générale du projet.
  *
*** --------------------------------------------------------------------- */
class Projet
{
  static get PANNEAU_LIST () {
    this._panneaulist || (this._panneaulist = ['data','personnages','notes','synopsis','scenier','treatment','manuscrit'])
    return this._panneaulist
  }
  // Liste des panneaux qui peuvent être synchronisés les uns avec les autres
  static get PANNEAUX_SYNC () {
    this._panneauxSync || (this._panneauxSync = ['notes','synopsis','scenier','treatment','manuscrit'])
    return this._panneauxSync
  }
  static get PANNEAUX_DATA ()
  {
    this._panneauData || (
      this._panneauData = {
          'data'        : {oneLetter: 'd'/* pour relatives*/ }
        , 'd' : 'data'
        , 'manuscrit'   : {oneLetter: 'm'}
        , 'm' : 'manuscrit'
        , 'notes'       : {oneLetter: 'n'}
        , 'n' : 'notes'
        , 'personnages' : {oneLetter: 'p'}
        , 'p' : 'personnages'
        , 'scenier'     : {oneLetter: 's'}
        , 's' : 'scenier'
        , 'treatment'   : {oneLetter: 't'}
        , 't' : 'treatment'
        , 'synopsis'    : {oneLetter: 'y'}
        , 'y' : 'synopsis'
      }
    )
    return this._panneauData
  }

  static UIprepare ()
  {

  }

  /**
  *   Chargement du projet data.projet_id
  *
  * La méthode regarde aussi s'il y a d'autres choses à faire, comme mettre
  * en route la boucle de sauvegarde en fonction des options.
  * TODO Plus tard, on pourra aussi avoir des notes à rappeler à l'ouverture,
  * par exemple.
  **/
  static load (data)
  {
    this.current = new Projet(data.projet_id)
    this.current.load.bind(this.current)()
  }

  /**
  * Méthode appelée par le tabulator des panneaux pour ouvrir un ou plusieurs
  * panneaux
  *
  * @param {Array} keys Liste des id-panneaux (un ou deux seulement) définissant
  *                     le ou les panneaux à ouvrir.
  **/
  static loadPanneauByTabulator ( keys )
  {
    if ( keys.length == 1 )
    {
      this.loadPanneau(keys[0])
    }
    else
    {
      this.loadDoublePanneaux(...keys)
    }
  }

  /**
  * Méthode fonction passant en mode double panneau
  **/
  static loadDoublePanneaux (pan1_id, pan2_id)
  {
    // Désactiver les panneaux courants (if any)
    this.desactiveAllCurrents()
    let cur = this.current

    cur._current_panneau = this.panneaux[pan2_id]
    cur.current_panneau.activate()
    cur.current_panneau.setModeDouble('right')

    cur.alt_panneau = this.panneaux[pan1_id]
    cur.alt_panneau.activate()
    cur.alt_panneau.setModeDouble('left')

    cur.mode_double_panneaux = true
  }

  /**
  * Méthode fonctionnelle chargeant le plateau voulu
  **/
  static loadPanneau (panneau_id, evt)
  {
    // Si on était en mode double panneau, il faut en sortir, même
    // si on va y revenir tout de suite
    this.desactiveAllCurrents()
    this.current._current_panneau = this.current.panneau(panneau_id)
    this.current.current_panneau.activate()
    this.current.mode_double_panneaux = false
  }


  /**
  * Désactive le ou les panneaux affichés, en les repassant dans leur
  * mode normal (en mode double panneaux, ils sont rétrécis et placés à
  * gauche et à droite)
  **/
  static desactiveAllCurrents ()
  {
    if ( this.current.mode_double_panneaux )
    {
      this.current.alt_panneau.desactivate()
      this.current.alt_panneau.unsetModeDouble()
      this.current.current_panneau.unsetModeDouble()
    }
    this.current.current_panneau || this.current.current_panneau.desactivate()
  }


  static newID ()
  {
    this._lastid || ( this._lastid = 0 )
    this._lastid ++
    return this._lastid
  }


  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor (projet_id)
  {
    this.id = projet_id
    this.__ID = Projet.newID()
  }

  /** ---------------------------------------------------------------------
    *
    *   Propriétés générales
    *
  *** --------------------------------------------------------------------- */

  // Détermine si on se trouve en mode édition, c'est-à-dire dans un contenu
  // éditable. Ce mode détermine surtout l'action des raccourcis-clavier
  // uno-touche.
  get mode_edition () { return !!this._mode_edition }
  set mode_edition (v){ this._mode_edition = !!v }

  /**
  * La méthode d'annulation courante du projet.
  *
  * C'est la méthode qui sera interrogée par la combinaison CMD+Z pour
  * savoir si une cancellisation doit être exécutée.
  * Pour le moment, elle n'est implémentée que pour la suppression de
  * paragraphes.
  **/
  get cancelableMethod () { return this._cancelableMethod }
  set cancelableMethod (v){ this._cancelableMethod = v    }

  /**
  * @return {PanProjet} Le panneau courant (qui est beaucoup plus qu'un panneau)
  * Par défaut, c'est le panneau des données générales du projet.
  **/
  get current_panneau () {
    this._current_panneau || ( this._current_panneau = this.panneaux['data'] )
    return this._current_panneau
  }

  get modified () { return this._modified || false }
  set modified (v)
  {
    this._modified = v
    if (v) { this.ui.setProjetModifed()     }
    else   { this.ui.setProjetUnmodified()  }
  }
  set saving (v) {
    this._saving = v
    if (v) { this.ui.setProjetSaving() }
  }

  panneau (pan_id) {
    this._panneaux || this.definePanneauxAsInstances()
    return this._panneaux[pan_id]
  }
  get panneaux () {
    this._panneaux || this.definePanneauxAsInstances()
    return this._panneaux
  }

  // Crée les instances panneaux pour le projet courant
  definePanneauxAsInstances ()
  {
    let my = this
    // my._panneaux = {}
    // Pour la transition de Projet.panneaux à projet.panneaux
    my._panneaux = {}
    Projet.PANNEAU_LIST.forEach( (panneau_id) => {
      // my._panneaux[panneau_id] = new PanProjet(panneau_id)
      // Pour la transition de Projet.panneaux à projet.panneaux (donc
      // de l'utilisation de la class à l'utilisation de l'instance)
      my._panneaux[panneau_id] = new PanProjet(panneau_id, my)
    })
  }
  /**
  * Méthode appelée après chaque sauvegarde de panneau (ou autre) qui
  * vérifie l'état de sauvegarde du projet en général.
  * C'est également la méthode qui est appelée par la boucle de sauvegarde
  * automatique.
  * Noter que cette méthode ne fait rien d'autre, en soi, que vérifier l'état
  * général et de régler l'indicateur de sauvegarde dans l'interface.
  **/
  checkModifiedState ()
  {
    let my  = this
      , mod = false // Sera mis à true si on trouve quelque chose modifié
    Projet.PANNEAU_LIST.forEach( (pan_id) => {
      my.panneau(pan_id).modified && ( mod = true )
    })
    this.modified = mod // changera l'indicateur de sauvegarde
  }

  /* --- publiques --- */

  afficherStatistiques ()
  {
    alert("Pour le moment, je ne sais pas encore afficher les statistiques du projet.")
  }

  /**
  * Chargement du projet
  * Note : ce sont les données qui s'affichent toujours en premier, pour
  * le moment.
  **/
  load ()
  {

    this.set_title()
    this.set_authors()
    this.set_summary()
    this.set_created_at()
    this.set_updated_at()

    this.observeEditableFields()
    this.prepareSuivantOptions()
  }


  /**
  * Place les observers pour les contenus éditables
  **/
  observeEditableFields ()
  {
    let
        editables = document.getElementsByClassName('editable')
      , len       = editables.length
      , i         = 0
      , my        = this
    for(;i<len;++i){
      editables[i].addEventListener('click', (evt) => {
        let o = evt.target
        o.contentEditable = 'true'
        o.focus()
        this.mode_edition = true
      })
      editables[i].addEventListener('blur', (evt) => {
        let o = evt.target
        my.onChangeData.bind(my)(o)
        o.contentEditable = 'false'
        this.mode_edition = false
      })
    }
  }

  /**
  * Méthode qui prépare l'interface et le programme en fonction des options
  * choisies par l'auteur. Par exemple, c'est cette méthode qui met en route
  * la sauvegarde automatique si nécessaire.
  **/
  prepareSuivantOptions ()
  {
    if ( this.option('autosave') )
    {
      this.options.activateAutosave()
    }
  }

  /**
   * Méthode appelée quand la sauvegarde automatique est enclenchée
   */
  doAutosave () {
    if ( this.mode_edition || this.busy ) { return false }
    this.checkModifiedState()
    this.modified && this.saveAll()
    return true
  }
  /**
  * Sauve tout
  * ----------
  * Pour le moment, ça ne sauve que les panneaux et les relatives.
  *
  * Noter que l'appel de la sauvegarde des relatives et le check du nouvel
  * état du projet est inutile puisque ces deux méthodes sont appelées à
  * chaque sauvegarde de panneau. Et ici, normalement, il ne doit pas y
  * avoir plus de deux panneaux modifiés en même temps, en tout cas en
  * mode de sauvegarde automatique.
  **/
  saveAll ()
  {
    let my = this
      , pan
    Projet.PANNEAU_LIST.forEach( (pan_id) => {
      pan = my.panneau(pan_id)
      pan.modified && pan.save.bind(pan)()
    })
  }

  onChangeData (o)
  {
    let
          prop = o.id // par exemple 'authors' ou 'title'
        , newValue = o.innerHTML.replace(/<br>/,"\n").trim()

    // Traitement des valeurs pour certains champs spéciaux
    switch(prop)
    {
      case 'authors':
        newValue = newValue.split(/[ ,]/).map(p =>{return p.trim()}).filter(p => {return p != ''})
        break
    }
    // On enregistre la donnée et on l'actualise dans l'affichage
    let d2u = {updated_at: moment().format()}
    d2u[prop] = newValue
    this.store_data.set(d2u)
    this[`set_${prop}`]()
    this.set_updated_at()
  }

  /**
  * @return {Relatives} L'instance gérant les relatives du projet
  * Les relatives, ce sont les relations entre les différents parags entre
  * les différents panneaux. Par exemple, ce sont les relatives qui permettent
  * de savoir que tels paragraphes du scénier correspondent à tel paragraphe
  * du synopsis
  **/
  get relatives ()
  {
    this._relatives || ( this._relatives = new Relatives(this) )
    return this._relatives
  }
  get options ()
  {
    this._options || ( this._options = new ProjetOptions(this) )
    return this._options
  }
  get ui ()
  {
    this._ui || ( this._ui = new ProjetUI(this) )
    return this._ui
  }
  // ----------------- OPTIONS ---------------------

  /**
  * Raccourci servant au tabulator (car on ne peut pas utiliser `projet.options`
  * dans le départ)
  **/
  define_options ( arg ) { this.options.define( arg ) }

  option ( prop, value )
  {
    if ( 'string' == typeof prop )
    {
      if ( undefined === value ) { return this.options.get(prop) }
      else {
        let h = {} ; h[prop] = value ; this.options.set(h)
      }
    }
    else if ( 'object' == typeof prop )
    {
      this.options.set(prop)
    }
    else
    {
      throw new Error('Mauvais argument pour projet#option')
    }
  }

  /**
  * Méthode qui enregistre et affiche le titre. Si @new_title est défini, elle
  * enregistre le nouveau titre. Sinon, elle l'affiche (dans la barre de titre et
  * dans le document)
  **/
  set_title (new_title) {
    DOM.setTitle(this.title)
    DOM.inner('title', this.title)
  }
  /**
  * Méthode qui enregistre et affiche les auteurs dans le document
  **/
  set_authors (new_authors)
  {
    DOM.inner('authors', this.authors.join(', '))
  }

  set_summary (new_summary)
  {
    DOM.inner('summary', this.summary.split("\n").join('<br>'))
  }
  set_created_at(){
    let c = moment(this.created_at)
    DOM.inner('created_at', `${c.format('LLL')} (${c.fromNow()})`)
  }
  set_updated_at(){
    let c = moment(this.updated_at)
    DOM.inner('updated_at', `${c.format('LLL')} (${c.fromNow()})`)
  }

  // Les différents stores du projet
  get store_data        () {
    if(!this.id){throw new Error("Impossible de récupérer le fichier data : id est indéfini")}
    return new Store(`projets/${this.id}/data`) }
  get store_personnages () {
    if(!this.id){throw new Error("Impossible de récupérer le fichier data des personnages : id est indéfini")}
    return new Store(`projets/${this.id}/personnages`)}
  get store_scenes      () {
    if(!this.id){throw new Error("Impossible de récupérer le fichier data des scènes : id est indéfini")}
    return new Store(`projets/${this.id}/scenes`)}

  /**
  * @return {String} Le dossier du projet dans les librairies.
  * Normalement, on ne doit pas y avoir accès, mais pour des raisons de
  * programmation, on permet de l'ouvrir avec une commande.
  **/
  get folder ()
  {
    this._folder || ( this._folder = this.store_data.folder )
    return this._folder
  }

  // Les données remontées des différents stores
  get data_generales    () { return this.store_data.data }
  get data_personnages  () { return this.store_personnages.data }
  get data_scenes       () { return this.store_scenes.data}

  get title       (){ return this.data_generales.title  || "Projet sans titre" }
  get authors     (){ return this.data_generales.authors || [] }
  get summary     (){ return this.data_generales.summary || '[Résumé à définir]'}
  get created_at  (){ return this.data_generales.created_at}
  get updated_at  (){ return this.data_generales.updated_at}

}// fin class Projet

module.exports = Projet
