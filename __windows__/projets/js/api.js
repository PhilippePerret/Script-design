/*

  Projet API
  ----------

*/
define([
    path.join(APP_PATH,'lib','required.js')     // => Rq
  , path.join(APP_PATH,'lib','utils','dom.js')  // => DOM
], function(
    Rq
  , DOM
){


  class Projet {

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
      if ( false === this.isValidData() ) { return }
      // Sinon, on crée le projet
    }

    /**
    * Méthode appelée pour choisir un projet, soit par le bouton "Choisir le projet"
    * soit par la touche Entrée si la liste est active.
    **/
    static choose ()
    {
      Rq.log('Vous voulez choisir un film.')
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

  return Projet
})
