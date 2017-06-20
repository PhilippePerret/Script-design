/*

  Méthodes utilitaires pour la gestion du DOM

 */
define(
  [],
  function()
  {

    class DOM
    {

      static get (id)
      {
        return document.getElementById(id)
      }

      static focus (id)
      {
        this.get(id).focus()
        this.get(id).select()
      }

      static addClass (id, cname )
      {
        let e = this.get(id)
        let c = (e.className || '').split(' ')
        c.push(cname)
        e.className = c.join(' ')
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
    }
    return DOM
  }
)
