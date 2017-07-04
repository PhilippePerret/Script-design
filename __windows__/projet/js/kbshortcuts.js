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
          if ( evt.metaKey )
          {
            Projet.current_panneau.save()
          }
          return DOM.stopEvent(evt)

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
      switch ( evt.key )
      {

        // case 'Escape'://en mode édition, sort de l'édition
        //   return UI.stop_edit()
        case 'D':
          return Projet.loadPanneau('data')
        case 'Enter':
          // Suivant le mode, on fait quelque chose de différent
          // Si un paragraphe est sélectionné, ou courant, et qu'on est en
          // mode non édition, on édite le paragraphe en question
          if (!Projet.mode_edition&&Parag.current){Parag.current.edit()}
          break

        case 'ArrowUp':
          if ( evt.metaKey )
          {
            // Ne fonctionne pas, car la combinaison CMD+Arrow est captée
            // par le système. On utilise onkeydown pour contourner le
            // problème.
            Parags.moveCurrentUp(evt)
          }
          else if ( Projet.mode_edition )
          {
            return true
          }
          else
          {
            Parags.selectPrevious(evt)
            return DOM.stopEvent(evt)
          }

        case 'ArrowDown':
          if ( evt.metaKey )
          {
            // Cf. la note ci-dessus pour ArrowUp. Même chose ici, donc on ne
            // passe pas.
            Parags.moveCurrentDown(evt)
          }
          else if ( Projet.mode_edition )
          {
            return true
          }
          else
          {
            Parags.selectNext(evt)
            return DOM.stopEvent(evt)
          }

        case 'n': // en dehors du mode édition, 'n' provoque la création d'un paragraphe
          if(!Projet.mode_edition){return Parags.new()}
          else{return true /* dans un champ d'édition */}
          break

        // Activation des panneaux
        case 'M':
          return Projet.loadPanneau('manuscrit')
        case 'N':
          return Projet.loadPanneau('notes')
        case 'P':
          return Projet.loadPanneau('personnages')
        case 'S':
          return Projet.loadPanneau('scenier')
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
