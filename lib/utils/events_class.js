/** ---------------------------------------------------------------------
  *
  *   KEYBOARD
  *
  *  Pour l'utiliser, charger Events et mettre :
  *   const KB = Events.Keyboard
  *
  *   KB.press('a') ou KB.press('a', {altKey: true})
  *
  *   KB.keyDown('b')
  *   KB.keyUp('b', {metaKey: true})
  *
*** --------------------------------------------------------------------- */

class Keyboard
{
  /**
  * Simule le pressage d'une touche, c'est-à-dire avec un
  * cycle complet keyDown, keyPress et keyUp
  **/
  static press ( key, params )
  {
    if(!params){params={}}
    params.key = key
    params.eventType = 'keydown'
    this.pressKey(params)
    params.eventType = 'keypress'
    this.pressKey(params)
    params.eventType = 'keyup'
    this.pressKey(params)
  }

  static keyUp ( key, params ) {
    if(!params){params={}}
    params.key = key
    params.eventType = 'keyup'
    this.pressKey(params)
  }
  static keyDown ( key, params ) {
    if(!params){params={}}
    params.key = key
    params.eventType = 'keydown'
    this.pressKey(params)
  }
  static keyPress ( key, params ) {
    if(!params){params={}}
    params.key = key
    params.eventType = 'keypress'
    this.pressKey(params)
  }


  /**
    * Simule le pressage d'une touche clavier
    *
    * exemple
    * -------
    *     Event.pressKey({key:'q', target:'tabulator#panneaux', altKey: true})
    *
    * @param {Object} args Paramètres et notamment :
    *
    *   eventType:  {String} 'keyup', 'keydown' ou 'keypressed'
    *               Défaut : 'keyup'
    *   key:        {String} La touche pressée. Mettre en majuscule si la
    *               touche majuscule est pressée.
    *               Défaut : 'A'
    *   shiftKey    {Boolean} Mettre à true si la touche MAJ est appuyée
    *   altKey      {Boolean} Mettre à true si la touche ALT est pressée
    *               Défaut : false
    *   ctrlKey     {Boolean} Mettre à true si la touche CTRL est pressée
    *               Défaut : false
    *   metaKey     {Boolean} Mettre à true si la touche MÉTA est pressée
    *               (c'est la touche COMMAND sur Mac)
    *               Défaut : false
    *   target:     {String} {HTMLElement} La cible / document par défaut.
    *               Soit un HTMLElement, soit un SELECTOR Css qui permettra
    *               de trouver l'élément
    *
  **/
  static pressKey ( args )
  {
    let target = args.target || document
    if ( 'string' === typeof target ) { target = document.querySelector(target)}
    target.dispatchEvent( this.keyEvent( args ) )
  }

  /* = Private = */

  /**
  * Pour produire un évènement keyboard à dispatcher.
  *
  * Exemple
  * -------
  *
  *   kE = Event.keyEvent({key:'a', alttKey:true})
  *   document.dispatchEvent(kE)
  *   // produit un keyUp sur la touche 'a' avec la touche Alt pressée
  *
  **/
  static keyEvent (options)
  {
    if ( undefined === options ) { options = {} }
    let kEv = new KeyboardEvent(
      options.eventType || 'keyup',
      {
          bubbles     : options.bubbles     || true
        , cancelable  : options.cancelable  || true
        , key         : options.key         || "A"
        , shiftKey    : options.shiftKey    || false
        , altKey      : options.altKey      || false
        , metaKey     : options.metaKey     || false
        , ctrlKey     : options.ctrlKey     || false
        , char        : options.char || options.key || "A"
      })

    if (options.keyCode) {
      delete kEv.keyCode
      Object.defineProperty(kEv, 'keyCode', {'value' : options.keyCode})
    }
    if (options.charCode) {
      delete kEv.charCode
      Object.defineProperty(kEv, 'charCode', { 'value': options.charCode})
    }
    return kEv
  }
} // /Keyboard

/** ---------------------------------------------------------------------
  *
  *   EVENTS
  *
*** --------------------------------------------------------------------- */
class Events
{
  static stop (evt)
  {
    evt.stopPropagation()
    evt.preventDefault()
    return false
  }

  static get Keyboard () { return Keyboard }

  /**
  * Déclenche un évènement focusin sur l'élément target
  **/
  static focusIn ( target, params ) {
    if('string' === typeof target ){target = document.querySelector(target)}
    // let e = new FocusEvent('focus', {originalTarget:target})
    // let e = document.createEvent('focus')
    // target.dispatchEvent(e)
    target.focus()
    let range     = document.createRange()
    let selection = window.getSelection()
    range.selectNodeContents(target)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }

}

module.exports = Events
