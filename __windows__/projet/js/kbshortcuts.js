/*

  Définition des raccourcis clavier pour la page des PROJET


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
        case 'D':
          return Projet.loadPanneau('data')
        case 'N':
          return Projet.loadPanneau('notes')
        case 'P':
          return Projet.loadPanneau('personnages')
        case 'S':
          return Projet.loadPanneau('scenier')
        case 'Y':
          return Projet.loadPanneau('synopsis')
      }
      return 'poursuivre' // pour dire de poursuivre le test keyUp
    }// /fin de onkeyup
  }

  return KBShortcuts
})
