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
  * Place les observateurs sur les éléments éditables de +o+
  *
  * Rappel : les éditables se reconnaissent à leur class="editable"
  *
  * @param {HTMLElement|String|Selector} o Désignation de l'élément contenant
  *                                         les éditables.
  **/
  observeEditablesIn ( o )
  {
    const my = this
    o = DOM.get(o)
    let
        editables = o.getElementsByClassName('editable')
      , len       = editables.length
      , i         = 0
    for(;i<len;++i){
      editables[i].addEventListener('click', (evt) => {
        my.activateEditableField(evt.target)
      })
      editables[i].addEventListener('blur', (evt) => {
        my.desactivateEditableField(evt.target)
      })
    }

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

  activateEditableField ( o, options )
  {
    const my = this
    const proj = this.projet
    options || ( options = {} )

    o.contentEditable = 'true'
    UI.setSelectionPerOption(o, proj.option('seloneditpar') ? 'all' : false)

    let enableReturn = options.enableReturn || (o.getAttribute('enable-return') == 'true')
    enableReturn && console.log("Les retours chariots sont autorisés dans ce champ.")

    /*- Valeur initiale (sera remise si Escape) -*/

    const initValue = String(o.innerHTML)

    /*- Désactivation du gestion de clavier actuel, obligatoire
        par exemple si on utilise Tabulator pour passer en édition */

    my.currentOnKeyUp = window.onkeyup
    window.onkeyup = undefined
    my.currentOnKeyDown = window.onkeydown
    window.onkeydown = function(evt) {
      switch(evt.key)
      {
        case 'Enter':
          if ( enableReturn ) { break }
          // Sinon on passe ci-dessous
        case 'Tab':
          o.blur.call(o)
          return DOM.stopEvent(evt)
        case 'Escape':
          o.innerHTML = initValue
          o.blur.call(o)
          return DOM.stopEvent(evt)
      }
    }

    /*- On indique au projet qu'on est en édition -*/

    proj.mode_edition = true
  }
  desactivateEditableField ( o, options )
  {
    const proj  = this.projet
    const my    = this

    proj.onChangeData.bind(proj)(o)
    o.contentEditable = 'false'

    /*- Ré-activation du gestion de clavier actuel, obligatoire
        par exemple si on utilise Tabulator pour passer en édition */
    window.onkeyup = my.currentOnKeyUp
    my.currentOnKeyUp = undefined
    window.onkeydown = my.currentOnKeyDown
    my.currentOnKeyDown = undefined

    /*- On indique au projet qu'on n'est plus en édition -*/

    proj.mode_edition = false
  }

}


module.exports = ProjetUI
