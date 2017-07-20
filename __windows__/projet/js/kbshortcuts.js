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
      const curProj = Projet.current

      switch (evt.key)
      {
        case 'k':
        case 'ArrowDown':
          // Les flèches avec la touche CMD, sur Mac, sont captés avant le
          // onkeyup, donc sont inutilisables telles quelles. Il faut donc
          // les capter avant pour les faire agir.
          if ( evt.metaKey )
          {
            curProj.current_panneau.moveCurrentDown(evt)
            curProj.current_panneau.moveCurrentDown(evt)
            return DOM.stopEvent(evt)
          }
          break
        case 'i':
        case 'ArrowUp':
          if ( evt.metaKey )
          {
            curProj.current_panneau.moveCurrentUp(evt)
            curProj.current_panneau.moveCurrentUp(evt)
            return DOM.stopEvent(evt)
          }
          break

        case 's':
          if( ! curProj.mode_edition )
          if( ! curProj.mode_edition )
          {
            evt.metaKey && curProj.saveAll()
            evt.metaKey && curProj.saveAll()
            return DOM.stopEvent(evt)
          }

        case 'z':
          if ( evt.metaKey ) // CMD Z
          {
            if ( 'function' === typeof curProj.cancelableMethod )
            if ( 'function' === typeof curProj.cancelableMethod )
            {
              curProj.cancelableMethod.call()
              curProj.cancelableMethod.call()
              delete curProj.cancelableMethod
              delete curProj.cancelableMethod
            }
          }
          break
        case 'Escape':
          if ( curProj.mode_edition )
          {
            console.log("ESCAPE EN MODE D'ÉDITION")
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
      const curProj = Projet.current
          , curpan  = curProj.current_panneau

      // console.log("[kbshortcuts] Projet.current.mode_edition = ",Projet.current.mode_edition)
      // console.log('[kbshortcuts] selection courante', curpan.parags.selection.current)
      // On ne passe à la suite que si l'on n'est plus en mode Édition
      if ( curProj.mode_edition ){ return 'poursuivre' }
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
            case curProj.mode_double_panneaux :
              return Parags.setSelectedsAsRelatives()
            case curpan.hasCurrent() :
              return curpan.editCurrent.bind(curpan)()
          }
          break

        case 'I':
        case 'i':
        case 'ArrowUp':
          curpan.selectPrevious.bind(curpan)(evt)
          return DOM.stopEvent(evt)

        case 'k':
        case 'K':
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
          // return Parags.create()
          return curProj.current_panneau.parags.create()
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
