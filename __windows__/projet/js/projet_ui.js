/*

  Class ProjetUI
  --------------
  Elle gère l'interface en général
  C'est elle par exemple qui s'occupe de l'indicateur de sauvegarde.

  Elle s'obtient par projet.ui

*/
class ProjetUI
{
  constructor ( projet )
  {
    this.projet = projet
  }

  /**
   * Trois méthodes pour indiquer l'état de sauvegarde du projet dans
   * l'interface grâce au save-state-indicator.
   * La méthode est appelée par les propriétés modified et saving de la
   * class Projet.
   */
  setProjetModifed    () { this.indicateurSauvegarde.className = 'unsaved'  }
  setProjetUnmodified () { this.indicateurSauvegarde.className = 'saved'    }
  setProjetSaving     () { this.indicateurSauvegarde.className = 'saving'   }

  get indicateurSauvegarde () {
    this._indSave || ( this._indSave = document.getElementById('save-state-indicator'))
    return this._indSave
  }
}


module.exports = ProjetUI
