if('undefined'!==typeof(HTMLElement)){
  HTMLElement.prototype.inspect = function(){
    return this.outerHTML.replace(/</g,'&lt;')
  }
}

class DOM
{
  // Définit le titre
  static set_title (title)
  {
    document.getElementsByTagName('TITLE')[0].innerHTML = title
  }
  static setTitle (title) { return this.set_title(title) }

  static stopEvent (evt)
  {
    evt.stopPropagation()
    evt.preventDefault()
    return false
  }

  /**
  * Retourne le noeud DOM d'identifiant +id+ ou de selector +id+
  * @param {String} id Identifiant ou CSS selector
  * @return {HTMLElement} Le noeud ou null si non trouvé
  **/
  static get (id)
  {
    if ('string' !== typeof id) { return id }
    let n = document.getElementById(id)
    if ( ! n ) { n = document.querySelector(id) }
    return n
  }

  // @return la valeur du champ d'ID +id+
  // ou la place si +value+ est défini
  static value (id, value)
  {
    if ( undefined === value )
    {
      return this.get(id).value
    }
    else
    {
      this.get(id).value = value
    }
  }

  // @Return le contenu HTML du noeud d'identifiant +id+
  // ou le définit si +content+ est défini
  static inner (id, content)
  {
    if (undefined === content)
    {
      return this.get(id).innerHTML
    }
    else
    {
      this.get(id).innerHTML = content
    }
  }

  static getize(element)
  {
    if ( 'string' === typeof element  ) { return this.get(element)  }
    else { return element }
  }
  static add (cont, child)
  {
    cont  = this.getize(cont)
    child = this.getize(child)
    cont.appendChild(child)
  }

  static insertTop (cont, child)
  {
    cont  = this.getize(cont)
    this.insertBefore(cont, child, cont.firstChild)
  }

  static insertBefore(cont, child, refChild)
  {
    cont  = this.getize(cont)
    child = this.getize(child)
    cont.insertBefore(child, refChild)
  }

  static display (odom)
  {
    odom = this.getize(odom)
    odom.style.display = ''
  }
  static show (odom)
  {
    odom = this.getize(odom)
    odom.style.visibility = 'visible'
  }
  static undisplay (odom)
  {
    odom = this.getize(odom)
    odom.style.display = 'none'
  }
  static mask (odom) { this.undisplay(odom) }

  static hide (odom)
  {
    odom = this.getize(odom)
    odom.style.visibility = 'hidden'
  }

  static focus (id)
  {
    this.get(id).focus()
    this.get(id).select()
  }

  /**
  * Observe l'élément +id+ quand un évènement +evt+ est triggué sur lui
  * et appelle la méthode +callback+.
  **/
  static listen (oDom, evt, callback)
  {
    if ( 'string' === typeof oDom ) { oDom = this.get(oDom) }
    oDom.addEventListener(evt,callback)
  }

  static hasClass( o, expClass )
  {
    let e = this.get(o)
      , c = (e.className || '').split(' ')
    return c.indexOf( expClass ) > -1
  }

  static addClass (id, cname )
  {
    let e = this.get(id)
    let c = (e.className || '').split(' ')
    c.push(cname)
    e.className = c.join(' ').trim()
  }

  static removeClass (id, cname)
  {
    let e = this.get(id)
    if ( ! e.className ) { return }
    let c = e.className.split(' ')
    let d = c.indexOf(cname)
    if ( d > -1 ) { c.splice(d,1)}
    e.className = c.join(' ')
  }

  // Retourne une liste de tous les champs de texte de la fenêtre
  // courante. C'est-à-dire les input-text et les textarea s
  static get textFields ()
  {
    let a = []
    let el
    let tf = document.getElementsByTagName('TEXTAREA')
    for (var i = 0, len = tf.length; i < len ; ++i ) { a.push( tf[i] ) }
    tf = document.getElementsByTagName('INPUT')
    for (var i = 0, len = tf.length; i < len ; ++i )
    { if ( 'text' === tf[i].type ) { a.push( tf[i] ) } }
    return a
  }

  static create (typeElement, dataElement)
  {
    dataElement || ( dataElement = {} )
    let
          e = document.createElement(typeElement)
        , container
        , child
    if ( undefined !== dataElement.in )
    {
      container = dataElement.in
      delete dataElement.in
    }

    if ( undefined !== dataElement.child )
    {
      child = dataElement.child
      delete dataElement.child
    }

    if ( undefined !== dataElement.class )
    {
      let css = dataElement.class
      delete dataElement.class
      if ( 'string' !== typeof(css) ) css = css.join(' ')
      e.className = css
    }

    if ( dataElement.style ) {
      let style = dataElement.style
      delete dataElement.style
      if ( 'string' === typeof style ) {
        e.style = style
      }
      else
      {
        for ( let prop in style ) { e.style[prop] = style[prop] }
      }
    }

    if ( dataElement.inner ) {
      let inner = dataElement.inner
      delete dataElement.inner
      e.innerHTML = inner
    }

    // Tout ce qui reste
    for ( let prop in dataElement )
    {
      if ( null === dataElement[prop] ) { continue }
      e.setAttribute(prop, dataElement[prop])
    }

    if ( child )
    {
      this.add(e,child)
    }

    if ( container )
    {
      this.add(container, e)
    }
    // On retourne toujours l'élément
    return e
  }
}

module.exports = DOM
