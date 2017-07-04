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
      // log ('-> Projet::onEnter')
    }

    static onkeydown (evt)
    {
      // console.log('-> onkeydown')
      // console.log(evt)
      // if ( 'Meta' === evt.key ) { this.metaIsOn = true }
      // console.log('<- onkeydown')
      switch (evt.key)
      {
        case 'ArrowDown':
          // Les flèches avec la touche CMD, sur Mac, sont captés avant le
          // onkeyup, donc sont inutilisables telles quelles. Il faut donc
          // les capter avant pour les faire agir.
          if ( evt.metaKey )
          {
            Parags.moveCurrentDown(evt)
            return DOM.stopEvent(evt)
          }
          break
        case 'ArrowUp':
          if ( evt.metaKey )
          {
            Parags.moveCurrentUp(evt)
            return DOM.stopEvent(evt)
          }
          break

        case 's':
          if( ! Projet.mode_edition )
          {
            if ( evt.metaKey )
            {
              Projet.current_panneau.save()
            }
            return DOM.stopEvent(evt)
          }
      }
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
      // Les touches ci-dessous sont considérées même si l'on est en
      // mode édition, dans un champ de texte.
      switch ( evt.key )
      {

      }
      // On ne passe à la suite que si l'on n'est plus en mode Édition
      if ( Projet.mode_edition ){ return 'poursuivre' }

      switch ( evt.key )
      {

        case 'D':
          return Projet.loadPanneau('data')
        case 'Enter':
          // Suivant le mode, on fait quelque chose de différent
          // Si un paragraphe est sélectionné, ou courant, et qu'on est en
          // mode non édition, on édite le paragraphe en question
          if ( Projet.mode_double_panneaux )
          {
            return Parags.setSelectedsAsRelatives()
          }
          else if ( Parag.current )
          {
            Parag.current.edit()
          }
          break

        case 'ArrowUp':
          Parags.selectPrevious(evt)
          return DOM.stopEvent(evt)

        case 'ArrowDown':
          Parags.selectNext(evt)
          return DOM.stopEvent(evt)

        case 'n': // en dehors du mode édition, 'n' provoque la création d'un paragraphe
          return Parags.create()
        case 'o':
          alert("La fenêtre des outils n'est pas encore implémentée")
          break
        // Activation des panneaux
        case 'M':
          return Projet.loadPanneau('manuscrit', evt)
        case 'N':
          return Projet.loadPanneau('notes', evt)
        case 'P':
          return Projet.loadPanneau('personnages')
        case 'S':
          return Projet.loadPanneau('scenier')
        case 'T':
          return Projet.loadPanneau('treatment')
        case 'Y':
          return Projet.loadPanneau('synopsis')
        default:
          // Pour voir la touche :
          // console.log(evt.key)
      }
      return 'poursuivre' // pour dire de poursuivre le test keyUp
    }// /fin de onkeyup
  }

  return KBShortcuts
})
