/*

  Class ProjetUI
  --------------
  Elle gère l'interface en général
  C'est elle par exemple qui s'occupe de l'indicateur de sauvegarde.

  Elle s'obtient par projet.ui

*/
class ProjetUI
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  /**
  * Méthode pour écrire un message dans le footer
  *
  * @param {String} message Le message à écrire
  * @param {String} type    Le type, parmi 'notice', 'error', 'caution'
  **/
  static log (message, type)
  {
    type || (type = 'notice')
    this.spanMessage.innerHTML = message
    type && (this.spanMessage.className = type)
    if ( type != 'error' )
    {
      this.logTimer = setTimeout(this.resetLog.bind(this), 20*1000)
    }
  }
  static resetLog ()
  {
    this.logTimer && clearTimeout(this.logTimer)
    this.spanMessage.innerHTML = ''
    this.spanMessage.className = ''
  }
  static get spanMessage () {
    this._span_message || ( this._span_message = document.getElementById('footer-log'))
    return this._span_message
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
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
  setProjetModifed    () { this.indicateurSauvegarde && (this.indicateurSauvegarde.className = 'unsaved')  }
  setProjetUnmodified () { this.indicateurSauvegarde && (this.indicateurSauvegarde.className = 'saved')    }
  setProjetSaving     () { this.indicateurSauvegarde && (this.indicateurSauvegarde.className = 'saving')   }

  get indicateurSauvegarde () {
    this._indSave || ( this._indSave = document.getElementById('save-state-indicator'))
    return this._indSave
  }

}


module.exports = ProjetUI
