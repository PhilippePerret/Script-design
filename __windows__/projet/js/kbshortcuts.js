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
        case 'k':
        case 'ArrowDown':
          // Les flèches avec la touche CMD, sur Mac, sont captés avant le
          // onkeyup, donc sont inutilisables telles quelles. Il faut donc
          // les capter avant pour les faire agir.
          if ( evt.metaKey )
          {
            Projet.current_panneau.moveCurrentDown(evt)
            return DOM.stopEvent(evt)
          }
          break
        case 'i':
        case 'ArrowUp':
          if ( evt.metaKey )
          {
            Projet.current_panneau.moveCurrentUp(evt)
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

        case 'z':
          if ( evt.metaKey ) // CMD Z
          {
            if ( 'function' === typeof Projet.current.cancelableMethod )
            {
              Projet.current.cancelableMethod.call()
              delete Projet.current.cancelableMethod
            }
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
      let curpan = Projet.current_panneau

      // console.log("[kbshortcuts] Projet.mode_edition = ",Projet.mode_edition)
      // console.log('[kbshortcuts] selection courante', curpan.parags.selection.current)
      // On ne passe à la suite que si l'on n'est plus en mode Édition
      if ( Projet.mode_edition ){ return 'poursuivre' }
      switch ( evt.key )
      {

        // case 'D':
        //   return Projet.loadPanneau('data')
        case 'e':
          // <=> Enter
          curpan.hasCurrent() && curpan.editCurrent.bind(curpan)()
          return true
        case 'Enter':
          // Suivant le mode, on fait quelque chose de différent
          // Si un paragraphe est sélectionné, ou courant, et qu'on est en
          // mode non édition, on édite le paragraphe en question
          switch (true)
          {
            case Projet.mode_double_panneaux :
              return Parags.setSelectedsAsRelatives()
            case curpan.hasCurrent() :
              return curpan.editCurrent.bind(curpan)()
          }
          break

        case 'i':
        case 'ArrowUp':
          curpan.selectPrevious.bind(curpan)(evt)
          return DOM.stopEvent(evt)

        case 'k':
        case 'ArrowDown':
          curpan.selectNext.bind(curpan)(evt)
          return DOM.stopEvent(evt)
        case 'Escape':
          curpan.deselectAll.bind(curpan)()
          return DOM.stopEvent(evt)
        case 'Backspace':
          curpan.removeCurrent.bind(curpan)()
          return DOM.stopEvent(evt)
        case 'n': // en dehors du mode édition, 'n' provoque la création d'un paragraphe
          return Parags.create()
        case 'o':
          alert("La fenêtre des outils n'est pas encore implémentée")
          break
        default:
          // Pour voir la touche :
          // console.log(evt.key)
      }
      return 'poursuivre' // pour dire de poursuivre le test keyUp
    }// /fin de onkeyup
  }

  return KBShortcuts
})
