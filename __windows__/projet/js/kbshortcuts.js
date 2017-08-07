/*

  Définition des raccourcis clavier pour la page des PROJET


*/
const KBShortcuts = class {

  static onEnter (evt) {}

  static onkeydown (evt)
  {
    // console.log('-> onkeydown')
    // console.log(evt)
    // if ( 'Meta' === evt.key ) { this.metaIsOn = true }
    // console.log('<- onkeydown')
    const curProj = Projet.current
    const curPan  = curProj.current_panneau

    switch (evt.key)
    {
      case 'k':
      case 'ArrowDown':
        // Les flèches avec la touche CMD, sur Mac, sont captés avant le
        // onkeyup, donc sont inutilisables telles quelles. Il faut donc
        // les capter avant pour les faire agir.
        if ( evt.metaKey )
        {
          curPan.moveCurrentDown(evt)
          curPan.moveCurrentDown(evt)
          return DOM.stopEvent(evt)
        }
        break
      case 'i':
      case 'ArrowUp':
        if ( evt.metaKey )
        {
          curPan.moveCurrentUp(evt)
          curPan.moveCurrentUp(evt)
          return DOM.stopEvent(evt)
        }
        break

      case 's':
        evt.metaKey && !curProj.mode_edition && curProj.saveAll()
        return DOM.stopEvent(evt)

      case 'Q':
      case 'q':
      case 'R':
      case 'r':
        if (evt.metaKey) // CMD Q ou CMD R
        if (curProj.modified)
        {
          if(!confirm("Le projet est modifié. Si vous quittez maintenant, les nouveautés seront perdues.\n\nConfirmez-vous la fin ?")){ return DOM.stopEvent(evt) }
        }
        return true
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
          let curParag = curPan.parags.selection.current
          curParag.endEdit.call(curParag, evt)
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
        , curPano = curProj.current_panneau

    // console.log("[kbshortcuts] Projet.current.mode_edition = ",Projet.current.mode_edition)
    // console.log('[kbshortcuts] selection courante', curPano.parags.selection.current)
    // On ne passe à la suite que si l'on n'est plus en mode Édition
    if ( curProj.mode_edition ){ return 'poursuivre' }
    switch ( evt.key )
    {

      // case 'D':
      //   return Projet.loadPanneau('data')
      case 'e':
        // <=> Enter
        curPano.hasCurrent() && curPano.editCurrent.bind(curPano)()
        return true
      case 'Enter':
        // Suivant le mode, on fait quelque chose de différent
        // Si un paragraphe est sélectionné, ou courant, et qu'on est en
        // mode non édition, on édite le paragraphe en question
        switch (true)
        {
          case curProj.mode_double_panneaux :
            return Parags.setSelectedsAsRelatives()
          case curPano.hasCurrent() :
            return curPano.editCurrent.bind(curPano)()
        }
        break

      case 'I':
      case 'i':
      case 'ArrowUp':
        curPano.selectPrevious.bind(curPano)(evt)
        return DOM.stopEvent(evt)

      case 'k':
      case 'K':
      case 'ArrowDown':
        curPano.selectNext.bind(curPano)(evt)
        return DOM.stopEvent(evt)

      case 'l':
      case 'L':
      case 'ArrowRight':
        const curSel = curPano.parags.selection.current ;
        curSel && curSel.toggleRectoVerso.call(curSel)
        return DOM.stopEvent(evt)
      case 'Escape':
        curPano.deselectAll.bind(curPano)()
        return DOM.stopEvent(evt)
      case 'Backspace':
        curPano.removeCurrent.bind(curPano)()
        return DOM.stopEvent(evt)
      case 'n': // en dehors du mode édition, 'n' provoque la création d'un paragraphe
        // return Parags.create()
        return curPano.parags.createAndEdit()
      case 'o':
        alert("La fenêtre des outils n'est pas encore implémentée")
        break
      case 'B':
        currentProjet.brins.showPanneau()
        return DOM.stopEvent(evt)
      case 'b':
        currentProjet.brins.showForm()
        return DOM.stopEvent(evt)
      default:
        // Pour voir la touche :
        // console.log(evt.key)
    }
    return 'poursuivre' // pour dire de poursuivre le test keyUp
  }// /fin de onkeyup
}

module.exports = KBShortcuts
