/*

  Définition des raccourcis clavier pour la page des PROJETS

  Cette page permet de choisir un projet ou d'en définir un
  nouveau. Elle est appelée tout de suite avec le screensplash de
  démarrage, ou lorsqu'on joue la touche 'p' dans un contexte général.

*/
define(
  [
      C.LOG_MODULE_PATH // => log
    , C.DOM_MODULE_PATH // => DOM
    , PROJET_API_PATH   // => Projet
  ]
, function(
      log
    , DOM
    , Projet
  ){


  const KBShortcuts = class {

    static onEnter (evt)
    {
      log ('-> Projet::onEnter')
    }

    /**
    *   Gestionnaire de l'évènement KeyUP
    *
    *   Noter qu'il n'y a ici que les raccourcis propres à la vue projet
    *   Les raccourcis généraux, comme `@` ou `Enter` sont traités par le
    *   module ./__windows__/_common_/js/ui.js commun à toutes les vues
    *
    **/
    static onkeyup (evt)
    {
      switch ( evt.key )
      {
        case 'l':
          // log('Liste des projets demandée')
          return Projet.activeSectionList()
        case 'n':
          // log('-> Nouveau projet demandé')
          return Projet.activeSectionForm()
      }
      return 'poursuivre' // pour dire de poursuivre le test keyUp
    }// /fin de onkeyup
  }

  return KBShortcuts
})
