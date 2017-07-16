/*

  Projet API
  ----------

*/
let ipc = require('electron').ipcRenderer

define([
    C.LOG_MODULE_PATH
  , C.DOM_MODULE_PATH    // => DOM
  , C.SELECT_MODULE_PATH // => Select
], function(
    log
  , DOM
  , Select
){

  if ( PTEST_IT /* Pour savoir s'il faut tester l'application */ )
  {
    log("Il faut tester l'application")
  }
  else
  {
    log("Il ne faut pas tester l'application")
  }

  class ProjetsAPI {

    /** ---------------------------------------------------------------------
      *
      *   INSTANCE
      *
    *** --------------------------------------------------------------------- */
    constructor (data)
    {
      this.data = data
    }

    /** ---------------------------------------------------------------------
      *
      *   CLASSE
      *
    *** --------------------------------------------------------------------- */

    /**
    * Préparation de la fenêtre à l'ouverture de l'application
    **/
    static UISetUp ()
    {
      log('-> Projet::UISetUp')
      // Le menu des projets
      let data_liste_projets = {
          id:         'projet_id'
        , in:         'container-project-list'
        , opened:     true
        , maxHeight:  300
        , width:      '100%'
        , options:[
              {inner: 'Projets personnels', class: 'titre'}
            , {inner: 'Un projet exemple',  value: 'exemple'}
            , {inner: 'Start-up',           value: 'start-up'}
            , {inner: 'Tueuses vertes',     value: 'tueuses_vertes'}
            , {inner: 'Projets partagés',   class: 'titre'}
          ]
      }
      new Select(data_liste_projets)

      // Le menu des types de projets
      let data_types_projets = {
          id:     'projet_type'
        , in:     'container-type-projet'
        , width:  140
        , options:[
              {inner: 'Film',   value:'movie'}
            , {inner: 'Roman',  value:'novel'}
            , {inner: 'BD',     value:'comics'}
            , {inner: 'Jeu',    value:'game'}
            , {inner: 'Autre',  value:'autre'}
          ]
      }
      new Select(data_types_projets)

      // Le bouton pour choisir un film
      DOM.listen('btn-choose-project','click', this.choose.bind(this))
      DOM.listen('btn-create-project','click', this.create.bind(this))

      log('<- Projet::UISetUp')
    }

    /**
    * La méthode par défaut, donc appelée par la touche Enter
    **/
    static get defaultEnter () {
      if ( undefined === this._defaultEnter ) { this._defaultEnter = this.create }
      return this._defaultEnter
    }

    /**
    * Active la section Liste
    **/
    static activeSectionList ()
    {
      if ( 'projects-list' === this.currentSection ) { return }
      this.desactiveSectionForm()
      DOM.addClass('section-projets-list', 'active')
      this._defaultEnter    = this.choose
      this._currentSection  = 'projects-list'
    }
    static desactiveSectionList ()
    {
      DOM.removeClass('section-projets-list', 'active')
      this._currentSection = null
    }
    /**
    * Active le formulaire de création d'un nouveau projet
    **/
    static activeSectionForm ()
    {
      if ( 'project-form' === this.currentSection ) { return }
      this.desactiveSectionList()
      DOM.addClass('section-projet-form','active')
      DOM.focus('projet_titre')
      this._defaultEnter    = this.create
      this._currentSection  = 'project-form'
    }
    static desactiveSectionForm ()
    {
      DOM.removeClass('section-projet-form','active')
      this._currentSection = null
    }

    static get currentSection ()
    {
      if ( undefined === this._currentSection ) { this._currentSection = 'project-form' }
      return this._currentSection
    }
    /**
    * Méthode appelée lorsque l'auteur clique sur le bouton pour créer le
    * nouveau projet.
    * La méthode prend les données, les checkes et crée le projet si tout
    * est OK.
    **/
    static create ()
    {
      log('Demande de création du film')
      if ( false === this.isValidData() ) { return }
      // Sinon, on crée le projet
    }

    /**
    * Méthode appelée pour choisir un projet, soit par le bouton "Choisir le projet"
    * soit par la touche Entrée si la liste est active.
    **/
    static choose ()
    {
      ipc.send('open-projet',{projet_id: DOM.value('projet_id')})
    }

    /**
    * @return true si les données @data sont valides
    * @return false dans le cas contraire et affiche les messages d'erreur
    **/
    static isValidData( data )
    {
      if ( undefined === data ) { data = this.getFormData() }
      try
      {
        if ( '' == data.titre ) { throw({message: 'Il faut définir le titre', property:'titre'})}
        if ( '' == data.resume ){ throw({message: 'Il faut définir le résumé', property:'resume'})}

        return true
      }
      catch(erreur)
      {
        alert(erreur.message)
        DOM.focus(`projet_${erreur.property}`)
        return false
      }
    }

    /**
    * @return les données du formulaire (sous forme d'un object)
    **/
    static getFormData ()
    {
      return {
          titre:      DOM.get('projet_titre').value.trim()
        , resume:     DOM.get('projet_resume').value.trim()
        , type:       DOM.get('projet_type').value
        , coauteurs:  DOM.get('projet_coauteurs').value.trim()
      }

    }

  }
  return ProjetsAPI
})
