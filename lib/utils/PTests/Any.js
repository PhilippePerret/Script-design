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
        return String(this.original)
    }
  }

  /**
  * @return la class réelle de l'any
  **/
  get class () {
    if ( undefined === this._class ) { this._class = this.getClass() }
    return this._class
  }

  /**
  * @return true si l'élément est de class +c+ ('string','array', etc.)
  **/
  classOf (c) { return this.class === c }

  /**
  * @param  expected    Une valeur Any si possible, sinon sera transformé en
  *                     instance Any
  * @param  strict      Si true, la comparaison doit être stricte
  * @param  diff        Si true, on détaille la différence pour les objets
  *                     complexes comme les tables.
  * @return true si l'original est égal à l'+expected+, strictement ou non
  **/
  equals (expected, strict, diff )
  {
    if ( 'Any' !== expected.constructor.name ) { expected = new Any(expected) }

    let res, vrai

    // Deux éléments de classe différente ne peuvent pas être égaux
    // Sauf :
    //    - pour les nombres, qui peuvent être présentés en mode non strict
    //      comme des strings. En actual ou expected
    let classOK =
          ( this.classOf('number') && expected.classOf('string') && !strict)
      ||  ( this.classOf('string') && expected.classOf('number') && !strict)
      ||  ( expected.classOf(this.class) )
    if ( false == classOK )
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
      if ( diff )
      {
        console.log("diff est true")
        // Si l'option `diff` est activée, on doit faire le détail des différences
        // entre les deux éléments. Cela dépend des types.
        res += "\n\n" + this.diff_between(this.original, expected.original).join("\n")
        console.log(`Message final : ${res}`)
      }
      Any.equalityError = res
      return false
    }
  } // equal

  /**
  * Méthode fonctionnelle étudiant la différence (diff) entre l'actual
  * et l'expected pour un rapport détaillé.
  *
  * Noter que la méthode peut être appelée pour des sous-éléments, donc il
  * faut lui fournir tout ce dont elle a besoin.
  * @param  {Any} L'élément quelconque de modèle
  * @param {Any} L'élément quelconque de comparaison
  * @param {Array} diff_list La liste dans laquelle mettre les résultats
  *
  * @return {String} Le texte de la différence qui sera ajouté au message
  * de retour dans Any.equalityError
  **/
  diff_between (act, exp, diff_list)
  {
    let p
    if(undefined === diff_list){ diff_list = []}
    let act_const = act ? act.constructor.name : 'Undefined'
    let exp_const = exp ? exp.constructor.name : 'Undefined'
    if ( act_const != exp_const )
    {
      diff_list.push(`actual::${act_const} / expected::${exp_const}: imcomparables.`)
      return diff_list
    }
    switch ( act_const ){
      case 'String':
        // On ne fait rien pour les strings
        break
      case 'Array':
        let index_in_exp
        for(p=0;p<act.length;++p){
          if (act[p] == exp[p]) { continue }
          if( (index_in_exp = exp.indexOf(act[p])) < 0 )
          {
            // L'élément est inconnu de p
            diff_list.push(`Élément d'indice ${p} (${act[p]}) inconnu dans expected.`)
          }
          else
          {
            // L'élément est quand même contenu dans expect
            diff_list.push(`L'élément d'indice ${p} dans actual a l'index ${index_in_exp} dans expected`)
          }
        }//fin de boucle sur tous les éléments de actual
      case 'Object':
        for( p in act )
        {
          let actp_const = act[p] ? act[p].constructor.name : 'Undefined' // pour le message
          switch ( actp_const )
          {
            case 'String':
            case 'Number':
            case 'Boolean':
              if (act[p] === exp[p]) { continue }
              if (undefined === exp[p]) { diff_list.push(`Clé '${p}' inconnue dans expected`)}
              if (act[p] != exp[p]) { diff_list.push(`Clé '${p}': actual: ${act[p]} / expected: ${exp[p]}`)}
              break
            case 'Object':
            case 'Array':
              diff_list = this.diff_between(act[p], exp[p], diff_list)
              break
            default:
              console.log(`ERREUR : le type '${actp_const}' n'est pas traité dans Any#diff_between`)
          }
        }
        for ( p in exp )
        {
          if (undefined === act[p]) { diff_list.push(`Clé '${p}' inconnue dans actual`)}
        }
        break
      default:
        break // ne rien faire
    }
    return diff_list
  }

  /**
  * @return true si le conteneur courant contient +element+
  * @param {Any} element
  * @param {Boolean} strict Si true, on doit retrouver l'élément strictement identique (même
  *         class, etc.)
  **/
  contains (element, strict, deep)
  {
    if ( 'array' === element.class )
    {
      let len = element.original.length, i = 0
        , sElement
        , manques = []
      Any.containityLacks = []
      for( ; i < len ; ++i )
      {
        sElement = new Any(element.original[i])
        // log(`Recherche de ${sElement.inspect()} dans ${this.inspect()}`)
        if ( false === this.contains(sElement, strict, deep) ) {
          // log('  -> PAS trouvé')
          manques.push(sElement.inspect())
          Any.containityLacks.push(sElement.original)
        }
        // else {
        //   // log('  -> trouvé')
        // }
      }
      // log(`manques contient : ${manques.join(', ')}`)
      if ( manques.length > 0 )
      {
        if ( manques.length > 1 )
        {
          Any.containityError = `ne contient ni ${manques.join(', ni ')}`
        }
        else
        {
          Any.containityError = `ne contient pas ${manques[0]}`
        }
        return false
      }
      else
      {
        Any.containityError = null
        return true /* toutes les valeurs ont été trouvées */
      }
    }
    else
    {
      // Traitement en fonction de la classe du conteneur
      Any.containityError = null
      switch(this.class)
      {
        case 'string':
          return this.containsAsString(element,strict,deep)
        case 'array':
          return this.containsAsArray(element,strict,deep)
        case 'object':
          return this.constainsAsObject(element,strict,deep)
        case 'number':
        case 'symbol':
        case 'function':
          Any.containityError = `Un ${this.class} ne peut pas contenir un élément`
          return false
      }
    }
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
        if ( Array.isArray(this.original) ) { return 'array' }
        // Pour 'object', 'symbol', 'regexp', etc.
        return this.original.constructor.name.toLowerCase() // 'symbol'
    }
  }

  /**
  * @return true si +element+ {Any} est contenu dans l'any string courant
  * Si false, met l'erreur dans `Any.containityError`
  * @param  {Any} element (qui peut être un string, un number ou un regexp)
  *                       Ce peut être aussi une liste de string, number ou
  *                       regexp.
  **/
  containsAsString (element, strict, deep )
  {
    let re
    if ( 'regexp' === element.class )
    {
      re = element.original
    }
    else
    {
      re = RegExp.escape(element.original)
    }
    if ( strict )
    {
      return this.original.search(re) > -1
    }
    else
    {
      if ( 'regexp' == element.class ) { re = element.original }
      else re = new RegExp(re,'i')
      return this.original.search(re) > -1
    }
  }
  /**
  * @return true si +element+ {Any} est contenu dans l'any Array courant
  * Si false, met l'erreur dans `Any.containityError`
  **/
  containsAsArray ( element, strict, deep )
  {
    if ( ['object'].indexOf(element.class) > -1 )
    {
      // let mesErr = 'On ne peut pas encore vérifier l’appartenance d’un tableau dans une liste'
      // let mesErr = Any.containityError = 'On ne peut pas encore vérifier l’appartenance d’un tableau dans une liste'
      Any.containityError = 'On ne peut pas encore vérifier l’appartenance d’un tableau dans une liste'
      // return throwError(mesErr)
      return false
    }

    if ( true /* plus tard, si trop long, utiliser : deep */ )
    {
      let
          len = this.original.length
        , i = 0
        , e
      for(;i < len ; ++i)
      {
        e = this.original[i]
        if ( element.equals( new Any(e) ) ) { return true }
      }
    }
    return false
  }
  /**
  * @return true si +element+ {Any} est contenu dans l'any Objet courant
  * Si false, met l'erreur dans `Any.containityError`
  **/
  constainsAsObject (element, strict, deep)
  {
    if (element.classOf('object'))
    {
      for( let prop in element.original )
      {
        if ( !element.original.hasOwnProperty(prop) ) { continue }
        if (undefined === this.original[prop])
        {
          // <= la table ne contient pas cette clé
          // => failure
          Any.containityError = `La table ne contient pas la clé "${prop}"`
          return false
        }
        else
        {
          // <= La clé existe dans la table
          // => Il faut vérifier que la valeur soit la même
          let thval = new Any(this.original[prop])
          let elval = new Any(element.original[prop])
          if ( thval.equals(elval,strict) )
          {
            // <= Les valeurs sont identiques
            // => on peut poursuivre
          }
          else
          {
            // <= les valeurs sont différentes
            // => échec
            Any.containityError = `La valeur de la clé "${prop}" dans la table est ${thval.inspect()}, pas ${elval.inspect()}`
            return false
          }
        }
      }
      // Si on arrive ici c'est que toutes les valeurs ont été trouvées
      // identiques
      return true
    }
    else
    {
      Any.containityError = `Un object ne peut contenir un ${element.class}`
      return false
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
    return (new Any(foo1)).equals(new Any(foo2), options.strict, options.diff)
  }

  static isContainedBy(element, container, options)
  {
    this.containityError = null
    if ( !options ) { options = {} }
    return (new Any(container).contains(new Any(element), options.strict, options.deep))
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
      if ( ! el1.equals(el2, strict) ) { return `le ${parseInt(i)+1}ème élément ne correspond pas : \n🤕 ${el1.inspect()} \n<span style="color:#00DB00!important;">😀 ${el2.inspect()}</span>` }
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
    if ( Object.keys(obj1).length != Object.keys(obj2).length ) {
      return 'les deux objets n’ont pas le même nombre de clés'
    }
    for ( k in obj1 )
    {
      if ( ! obj1.hasOwnProperty(k) ) { continue }
      if ( undefined === obj2[k] ) { return `la clé '${k}' est inconnue dans le second objet.` }
      el1 = new Any(obj1[k])
      el2 = new Any(obj2[k])
      if ( ! el1.equals(el2, strict) ) { return `l'élément '${k}' ne correspond pas : \n🤕 ${el1.inspect()} \n<span style="color:#00DB00!important;">😀 ${el2.inspect()}</span>` }
    }
    return null
  } // areEqualAsArray

  static areEqualAsString (any1,any2,strict)
  {
    let
          str = String(any1.original)
        , exp = String(any2.original)
        , len = str.length
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
