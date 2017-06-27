/** ---------------------------------------------------------------------
  *   Extension des classes pour les tests
  *
*** --------------------------------------------------------------------- */

// Pour escaper les expressions régulières
RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/** ---------------------------------------------------------------------
  *   Class Any
  *
  * Permet de gérer toutes les sortes d'objet
*** --------------------------------------------------------------------- */

class Any {
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor (foo)
  {
    this.original = foo
  }

  /**
  * Retourne l'objet, quel qu'il soit, en version {String}
  **/
  inspect ()
  {
    switch(this.class)
    {
      case 'array':   return this.original.join(', ') // TODO mais si contient valeur complexe ?
      case 'object':  return JSON.stringify(this.original) // pour le moment
      case 'string': return `« ${this.original} »`
      default:
        return `${this.original}`
    }
  }

  /**
  * @param  expected    Une valeur Any si possible, sinon sera transformé en
  *                     instance Any
  * @return true si l'original est égal à l'+expected+, strictement ou non
  **/
  equals (expected, strict )
  {
    if ( 'Any' !== expected.constructor.name ) { expected = new Any(expected) }

    let res, vrai

    // Deux éléments de classe différente en peuvent être égaux
    // Sauf pour les nombres, qui peuvent être présentés en mode non strict
    // comme des strings.
    if ( this.class != 'number' && this.class != expected.class )
    {
      res = `les deux éléments ont des classes différentes ({${this.class}} vs {${expected.class}})`
    }
    else
    {
      // Comparaison en fonction de la class
      switch(this.class)
      {
        case 'string':
          res = Any.areEqualAsString(this, expected, strict)
          break
        case 'array':
          res = Any.areEqualAsArray(this, expected, strict)
          // log(`${this.original}, ${expected.original} : res = ${res}`)
          break
        case 'object':
          res = Any.areEqualAsPurObject(this, expected, strict)
          break
        default:
          // string, number, etc.
          if ( strict ) { vrai = this.original === expected.original }
          else { vrai = this.original == expected.original }
          res = vrai ? null : `les deux éléments ${this.class} ne sont pas ${strict ? 'strictement ': ''}identiques`
      }
    }

    if ( null === res ) { return true }
    else {
      Any.equalityError = res
      return false
    }
  } // equal

  get class () {
    if ( undefined === this._class ) { this._class = this.getClass() }
    return this._class
  }
  /* Private */
  getClass () {

    if ( null       === this.original ) { return 'null'       }
    if ( undefined  === this.original ) { return 'undefined'  }
    if ( true       === this.original ) { return 'boolean'    }
    if ( false      === this.original ) { return 'boolean'    }
    switch(typeof this.original)
    {
      case 'string':    return 'string'
      case 'number':    return 'number'
      case 'function':  return 'function'
      case 'object':
        if ( Array.isArray(this.original) )     { return 'array' }
        if ( this.original instanceof Object )  { return 'object' }
        return this.original.constructor.name
    }
  }
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static classOf(foo)
  {
    return new Any(foo).class
  }
  /**
  * @return true si les deux éléments sont égaux
  * @param  foo1    Premier élément
  * @param  foo2    Second élément
  * @param  opts    [Optionnel] Les options. Peuvent contenir notamment
  *                 strict: qui permet de faire des comparaisons strict.
  **/
  static areEqual(foo1, foo2, options)
  {
    this.equalityError = null
    // Pour accélérer, on traite des cas simples. Pour commencer si les deux
    // éléments fournis sont strictement égaux, ils sont forcément égaux
    if ( foo1 === foo2 ) { return true }
    if ( ! options ) { options = {} }
    return (new Any(foo1)).equals(new Any(foo2), options.strict)
  }

  /* Private */

  /**
  * @return true si +arr1+ et +arr2+ sont deux listes égales.
  * @note : les deux éléments doivent avoir été testés comme array avant
  * @param    arr1    {Array}
  * @param    arr2    {Array}
  **/
  static areEqualAsArray (any1, any2, strict)
  {
    let
          arr1 = any1.original
        , arr2 = any2.original
        , len  = arr1.length
        , i = 0
        , el1, el2
    if (len != arr2.length ){ return 'Les deux listes n’ont pas le même nombre d’éléments.' }
    for(; i < len ; ++i) {
      el1 = new Any(arr1[i])
      el2 = new Any(arr2[i])
      if ( ! el1.equals(el2, strict) ) { return `le ${parseInt(i)+1}ème élément ne correspond pas : ${el1.inspect()} différent de ${el2.inspect()}` }
    }
    return null
  }
  static areEqualAsPurObject (any1, any2, strict)
  {
    let
          obj1 = any1.original
        , obj2 = any2.original
        , k
        , el1
        , el2
    // Si les deux objects n'ont pas le même nombre de clés, ils ne peuvent
    // pas être égaux.
    if ( Object.keys(obj1).length != Object.keys(obj2).length ) { return 'les deux objets n’ont pas le même nombre de clés' }
    for ( k in obj1 )
    {
      if ( undefined === obj2[k] ) { return `la clé '${k}' est inconnue dans le second objet.` }
      el1 = new Any(obj1[k])
      el2 = new Any(obj2[k])
      if ( ! Any.areEqual(el1,el2,strict) ) { return `l'élément '${k}' ne correspond pas : ${el1.inspect} contre ${el2.inspect}.` }
    }
    return null
  } // areEqualAsArray

  static areEqualAsString (any1,any2,strict)
  {
    let
          str = any1.original
        , exp = any2.original
        , len = str.length
    // log(`Comparaison de '${str}' et '${exp}'`)
    if ( str.length != exp.length ) { return 'les deux chaines n’ont pas le même nombre de caractères.' }
    if ( strict )
    {
      if (str != exp ) { return 'les deux chaines ne sont pas strictement égales'}
    }
    else
    {
      let expReg = new RegExp(`^${RegExp.escape(exp)}$`, 'i')
      if ( str.search(expReg) != 0 ) { return 'les deux chaines ne sont pas identiques, même approximativement'}
    }
    return null
  }
}

module.exports = Any
