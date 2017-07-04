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

define([
    C.LOG_MODULE_PATH
  , C.DOM_MODULE_PATH     // => DOM
  , C.SELECT_MODULE_PATH  // => Select
], function(
    log
  , DOM
  , Select
){



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
    if(undefined===this._panneaulist){
      this._panneaulist = ['data','personnages','notes','synopsis','scenier','treatment','manuscrit']
    }
    return this._panneaulist
  }
  // Détermine si on se trouve en mode édition, c'est-à-dire dans un contenu
  // éditable. Ce mode détermine surtout l'action des raccourcis-clavier
  // uno-touche.
  get mode_edition () { return !!this._mode_edition }
  set mode_edition (v){ this._mode_edition = !!v }

  static UIprepare ()
  {
    this.PANNEAU_LIST.forEach( (btn_id) => {
      DOM.get(`btn-${btn_id}`)
        .addEventListener('click', Projet.loadPanneau.bind(Projet, btn_id))
    })
  }

  /**
  *   Chargement du projet data.projet_id
  **/
  static load (data)
  {
    this.current = new Projet(data.projet_id)
    this.current.load.bind(this.current)()
  }

  /**
  * @return {PanProjet} Le panneau courant (qui est beaucoup plus qu'un panneau)
  **/
  static get current_panneau () {
    if ( undefined === this._current_panneau){this._current_panneau = this.panneaux['data']}
    return this._current_panneau
  }

  /**
  * Propriété définissant les panneaux du projet, c'est-à-dire les instances
  * de {PanProjet} correspondant à chaque panneau ('data','scenier', 'synopsis',
  * etc.)
  **/
  static get panneaux () {
    if ( undefined === this._panneaux )
    {
      this._panneaux = {}
      this.PANNEAU_LIST.forEach( (panneau_id) => {
        this._panneaux[panneau_id] = new PanProjet(panneau_id)
      })
    }
    return this._panneaux
  }

  /**
  * Méthode fonctionnelle chargeant le plateau voulant
  **/
  static loadPanneau (panneau_id, evt)
  {
    // Si on était en mode double panneau, il faut en sortir, même
    // si on va y revenir tout de suite
    if (this.mode_double_panneaux)
    {
      this.alt_panneau.desactivate()
      this.alt_panneau.unsetModeDouble()
      this.current_panneau.unsetModeDouble()
    }
    // Pour savoir s'il faut passer en mode double
    let passerEnModeDouble  = !!evt.shiftKey
    let dejaEnModeDouble    = !!this.mode_double_panneaux
    this.mode_double_panneaux = !!passerEnModeDouble

    if ( passerEnModeDouble )
    {
      // Le mode double
      // Le panneau courant passe ne panneau_alt
      this.alt_panneau = this.panneaux[this.current_panneau.id]
      this.alt_panneau.setModeDouble('left')
      this._current_panneau = this.panneaux[panneau_id]
      this.current_panneau.activate()
      this.current_panneau.setModeDouble('right')
    }
    else
    {
      // Le mode normal
      this.current_panneau.desactivate()
      this._current_panneau = this.panneaux[panneau_id]
      this.current_panneau.activate()
    }

  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor (projet_id)
  {
    this.id = projet_id
  }

  /**
  * Chargement du projet
  **/
  load ()
  {

    this.set_title()
    this.set_authors()
    this.set_summary()
    this.set_created_at()
    this.set_updated_at()

    this.observeEditableFields()
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
        Projet.mode_edition = true
      })
      editables[i].addEventListener('blur', (evt) => {
        let o = evt.target
        my.onChangeData.bind(my)(o)
        o.contentEditable = 'false'
        Projet.mode_edition = false
      })
    }
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
    if ( undefined === this._relatives )
    { this._relatives = new Relatives(this) }
    return this._relatives
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

return Projet
})// /fin define
