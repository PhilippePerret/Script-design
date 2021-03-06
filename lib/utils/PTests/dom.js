/*
  J'essaie d'isoler ici les méthodes spéciales pour le DOM des PTests

  Il faut qu'elles soient testtables en elles-mêmes, sans avoir à
  charger (beaucoup) d'autres choses.

*/
let path  = require('path')

class TestError extends Error {
  constructor(hdata){
    super(hdata.message)
    this.type = hdata.type
    Error.captureStackTrace(this,this.constructor)
  }
}

class PTestsDOM
{

  /**
  * Méthode qui vérifie si +act+ contient bien +attrs_exp+
  *
  * @param {Object} act
  * @param {Object} attrs_exp  Objet qui définit ce qu'on doit trouver. Doit
  *                             contenir au minimum l'attribut 'tag'
  * @param {Object} options   Options éventuelle
  *
  * @return {Object} Un objet contenant le résultat détaillé :
  *
  **/
  static actualTagContainsExpect (act, attrs_exp, options)
  {
    // return true
    return new PTestsDOM(act, attrs_exp, options).searchExpectedInActual()
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor ( act, attrs_exp, options )
  {
    // console.log('attrs_exp',attrs_exp)
    this.act        = act
    this.attrs_exp  = attrs_exp
    if ( 'string' === typeof this.attrs_exp ) { this.parseExpected() }
    options || ( options = {} )
    options.template || ( options.template = {} )
    this.options = options
  }

  /**
  * +attrs_exp+ peut être fourni en object, contenant tag:, etc.
  * mais il peut être fourni aussi en string comme un queryString.
  * Il faut alors le décomposer pour obtenir un objet utilisable.
  **/
  parseExpected ()
  {
    let pat = /^([a-z]+)(#[a-z0-9_\-]+)?(\.[\.a-z0-9]+)?(.*)$/i
    let m = this.attrs_exp.match(pat)
    let ea = { tag: m[1] }
    // ID
    if(m[2]){
      ea.id = m[2].substr(1,m[2].length).trim()
    }
    // Class CSS
    if(m[3]){
      ea.class = m[3].substr(1,m[3].length).trim().split('.')
    }
    // Autres attributs
    let props = null
    if(m[4]!==''){
      props = m[4].substr(1,m[4].length-2).trim().split('][')
      props = props.map(paire => { return paire.split('=') })
      props.forEach( paire => {
        if(paire[1].startsWith('"')){paire[1] = paire[1].substring(1,paire[1].length)}
        if(paire[1].endsWith('"')){paire[1] = paire[1].substring(0,paire[1].length-1)}
        // On ajoute ici
        ea[paire[0]] = paire[1]
      })
    }
    this.attrs_exp = ea
  }

  searchExpectedInActual ()
  {
    // Pour la construction des messages
    this.exp_str = 'la balise ' // pour construire expect_str
    this.act_str = ['la balise']

    // contiendra le résultat renvoyé
    this.resultat = {}
    // Contiendra toutes les balises trouvées au départ, qui seront ensuite
    // filtrées par les conditions
    this.tagList  = []
    // Contient toutes les expectations attendues
    this.expectation = {}

    try
    {

      // Définition de `this.domActual`
      // ------------------------
      // this.domActual est l'objet HTMLElement qui va encapsuler le code ou
      // l'élément fourni.
      //
      this.resultat.step = 'definition of this.domActual'
      this.defineDOMActual()
      this.resultat.step = '/definition of this.domActual'
      this.resultat.domActual = this.domActual
      // console.log('this.domActual',this.domActual)

      // Recherche des TAGS CANDIDATES
      // =============================
      this.resultat.step = 'seaching tagList'
      this.defineTagList()
      this.resultat.step = '/searching tagList'


      // On retire les propriétés qui ne sont pas des attributs à trouver
      // dans la balise, pour les mettre dans des valeurs de `this.expectation`
      // Il reste donc dans `attrs_exp` uniquement les attributs à trouver
      this.resultat.step = 'get non-attributes values'
      this.dispatchAttributes()
      this.resultat.step = '/get non-attributes values'

      // PREMIÈRE RECHERCHE : LES ATTRIBUTS
      // ==================================
      this.resultat.step = 'searching for attributes'
      // Tous les éléments retenus doivent comporter les attributs
      // précisés. Ces attributs se trouvent dans attrs_exp
      if ( 0 === this.filtreTagList('checkAttributesIn') ) {
        throw new TestError({message: 'No tag found in _ACTUAL_ with provided attributes', type:'expectation'})
      }
      this.resultat.step = '/searching for attributes'


      // DEUXIÈME RECHERCHE : LA CLASS CSS
      // ----------------------------------
      this.resultat.step = 'searching for class (if any)'
      if ( this.expectation.class )
      {
        if ( 0 === this.filtreTagList('checkClassIn') )
        {
          throw new TestError({message:`No tag found in _ACTUAL_ with class CSS "${this.expectation.class.join(' ')}"`,type:'expectation'})
        }
      }
      this.resultat.step = '/searching for class (if any)'


      // TROISIÈME RECHERCHE : LE TEXTE
      // ----------------------------
      this.resultat.step = 'searching for text (if any)'
      if ( this.expectation.text ){
        this.prepareSearchText()
        if ( 0 === this.filtreTagList('checkTextIn') )
        {
          throw new TestError({message:"No tag found in _ACTUAL_ with text « ${this.expectation.text} ».",type:'expectation'})
        }
      }
      this.resultat.step = '/searching for text (if any)'

      // QUATRIÈME RECHERCHE : LES SOUS-BALISES
      // --------------------------------------
      if (this.expectation.children)
      {
        if ( 0 === this.filtreTagList('checkChildrenIn') )
        {
          throw new TestError({message:"No tag found in _ACTUAL_ with children expected", type:'expectation'})
        }
      }

      // CINQUIÈME RECHERCHE : LE NOMBRE
      // -------------------------------
      this.resultat.step = 'searching for count (if any)'
      this.checkFinalCount()
      this.resultat.step = '/searching for count (if any)'

      this.resultat.success = true

    } catch (erreur) {

      // return this.traiteErreurInCheck(erreur)
      if ( erreur.constructor.name === 'TestError')
      {
        this.resultat.error     = erreur.message
        this.resultat.errorType = erreur.type
      }
      else
      {
        this.resultat.error = erreur
        console.log(erreur)
      }
      this.resultat.success = false

    }

    return this.resultat
  }


  /**
  * Méthode qui définit this.domActual, l'élément HTML dans lequel on fera les
  * recherches
  * api @private
  * @param {String|HTMLElement} act soit un string définissant du code HTML ou
  *                                 un selector CSS, soit un HTMLElement
  * @return {HTMLElement} Un dom élément quelconque
  **/
  defineDOMActual ()
  {
    let act = this.act
    if('string' === typeof act){
      // <= act est un String
      //  => Ça peut être du code HTML ou un selector. On test la première
      //     lettre pour le savoir.
      act = this.act.trim()
      if ( act.startsWith('<') )
      {
        this.domActual = document.createElement('_cptests')
        this.domActual.innerHTML = act
      }
      else
      {
        this.domActual = document.querySelector(act)
        if( ! this.domActual ) {
          throw new Error(`${act} is an invalid selector or doesn't match any DOM element in _ACTUAL_`)
        }
      }
    } else {
      if ( 'function' !== typeof act.getAttribute ){
        throw new TestError({message: 'A valid DOMElement or a string DOMElement must be provided.', type: 'expectation'})
      }
      this.domActual = document.createElement('_cptests')
      // Noter que si on ne clone pas act ci-dessous, c'est le node dans le
      // document lui-même qui sera affecté par les suppressions.
      this.domActual.appendChild(act.cloneNode(true))
    }
    return this.domActual
  }

  get tag () {
    this._tag || ( this._tag = this.attrs_exp.tag )
    return this._tag
  }
  get capTag () {
    this._captag || ( this._captag = this.tag.toUpperCase() )
    return this._captag
  }
  get capTagStr () {
    this._captagstr || ( this._captagstr = `&lt; ${this.capTag} &gt;` )
    return this._captagstr
  }

  get dans_actual () {
    if (undefined === this._dans_actual){
      // VERSION COMPLÈTE :
      if ( this.options.realTest )
      {
        // <= On est sur de vrais tests, pas sur le test des tests
        // => On affiche le code en HTML
        this._dans_actual = `in code ${this.domActual.outerHTML.replace(/</g,'&lt;')}`
      }
      else
      {
        this._dans_actual = `in code ${this.domActual.outerHTML}`
        // this._dans_actual = 'dans le code'
      }
    }
    return this._dans_actual
  }

  defineTagList ()
  {

    // Un tag doit obligatoirement être défini. la politique de la recherche
    // doit être la précision, pas l'imprécision. On ne doit donc pas pouvoir
    // tester une balise avec '*'
    if (!this.tag || this.tag == '*'){
      throw new Error('Expected tag must be define')
    }

    let liste = this.domActual.getElementsByTagName(this.tag)

    // Il faut obligatoirement que des balises aient été trouvées
    if ( 0 == liste.length ){
      this.errorMessage = `no ${this.capTag} tag found ${this.dans_actual}`
      throw new TestError({message: this.errorMessage, type:'expectation'})
    }

    // this.tagList
    // ============
    // On produit `tagList`, la liste des tags trouvés dont on tentera
    // de trouver ou pas les éléments cherchés
    // On transforme la liste des DOMElement en vrai Array
    for(let i=0,l=liste.length;i<l;++i){this.tagList.push(liste[i])}

    // console.log('this.tagList:',this.tagList)
  }

  /**
  * Prend la liste des attributs (this.attrs_exp) et les dispatche entre
  * les vrais attributs qu'on doit trouver dans la balise recherchée et les
  * attributs qui concernent d'autres choses comme le texte, le nombre de
  * balises, etc.
  *
  * @product this.expected_attributes et this.expectation
  **/
  dispatchAttributes ()
  {
    let attrs = this.attrs_exp
    // Pour mettre les attributs balises réels
    this.expected_attributes = {}
    let nonAttributs = ['tag', 'count', 'max_count','min_count', 'children', 'text', 'class']
    let my = this
    for ( let prop in attrs ){
      if(!attrs.hasOwnProperty(prop)){continue}
      if( nonAttributs.indexOf(prop) > -1 )
      {
        my.expectation[prop] = attrs[prop]
      }
      else
      {
        my.expected_attributes[prop] = attrs[prop]
      }
      this._tag = attrs.tag
    }
    // Si on fait une recherche sur la class, il faut voir si la valeur est
    // bien une liste.
    if ( my.expectation.class ){
      if ( 'string' === typeof my.expectation.class ){
        my.expectation.class = my.expectation.class.split(' ')
      }
    }
  }

  /**
  * Si une recherche sur le texte est à mener, il faut préparer le texte,
  * qui doit être une expression régulière.
  **/
  prepareSearchText()
  {
    let t = this.expectation.text
    // console.log("Texte recherché = ", t)
    if (['String','RegExp'].indexOf(t.constructor.name) < 0){
      throw new Error(`Text expected must have type {String} or {RegExp} (its type is {${t.constructor.name}})`)
    }
    if ( 'RegExp' != t.constructor.name )
    {
      t = new RegExp(RegExp.escape(t),'i')
    }
    this.expectation.text_regexp = this.text_regexp =  t
  }


  /**
  * Méthode générale qui permet de filtrer la liste des balise retenues
  * en utilisant la méthode +methode_filtre+ qui doit être une méthode
  * static de la classe recevant un seul paramètre : la balise à tester
  * et qui doit retourner true si la balise doit être gardée et false
  * dans le cas contraire.
  *
  * @return {Number} Le nombre de balises restantes
  **/
  filtreTagList ( methode_filtre )
  {
    // console.log(`-> filtreTagList( methode filtre : ${methode_filtre})`)
    let lasti = this.tagList.length - 1
    for(let ibal=lasti; ibal>=0; --ibal){
      let bal = this.tagList[ibal]
      if ( ! this[methode_filtre].bind(this)( bal ) )
      {
        this.tagList.splice(ibal, 1)
        // console.log("TAGLIST RESTANTES",this.tagList)
      }
    }
    return this.tagList.length
  }

  /**
  * Retourne true si +tag+ contient l'attribut +attr+ avec la valeur +val+
  * et false dans le cas contraire
  **/
  checkAttributesIn ( bal )
  {
    // console.log("this.expected_attributes = ",this.expected_attributes)
    for ( let attr in this.expected_attributes )
    {
      if(!this.expected_attributes.hasOwnProperty(attr)){continue}
      let val = bal.getAttribute(attr)
      if ( !val || val !== this.expected_attributes[attr] ) { return false }
    }
    return true
  }

  /**
  * Méthode de filtre qui regarde si la balise contient la class CSS définie
  **/
  checkClassIn (bal)
  {
    if (!bal){ return false }
    let c = bal.className.trim()
    if ( c == '' ){ return false /* forcément puisque des classes ont été fournies */}
    c = c.split(' ')
    for(let css of this.expectation.class){
      if (c.indexOf(css) < 0){ return false /* Il manque celle-là */}
    }
    return true
  }

  /**
  * Méthode de filtre qui regarde si la balise contient bien le texte fourni
  **/
  checkTextIn ( bal )
  {
    let my = this
    if ( ! bal ) { return false }
    return bal.innerHTML.search(this.text_regexp) > -1
  }

  /**
  * Méthode de filtre qui regarde si la balise contient bien les enfants
  * définis dans les expectations.
  * Cette méthode consiste à appeler cette méthode principales avec les
  * éléments voulus.
  **/
  checkChildrenIn ( bal )
  {
    let child, res, hchild
    // Chaque enfant doit se trouver dans la balise bal
    // Note : `child` est une liste qui contient en premier élement la bal
    // recherchée et en second élément un objet définissant les attributs
    for( child of this.expectation.children )
    {
      hchild      = child[1] || {}
      hchild.tag  = child[0]
      res = PTestsDOM.actualTagContainsExpect(bal, hchild)
      if ( false === res.success ) { return false }
    }
    // Si on a trouvé tous les enfants cherchés dans la balise testée,
    // on peut renvoyer true
    return true
  }

  checkFinalCount ()
  {
    let nombre_founds = this.tagList.length
      , count         = this.expectation.count
      , maxcount      = this.expectation.max_count
      , mincount      = this.expectation.min_count

    // Si un nombre d'éléments précis doit être trouvé, on vérifie
    if ( count && nombre_founds != count ){
      let s     = count > 1 ? 's' : ''
      this.errorMessage = `${count} tag${s} (against ${nombre_founds} expected) should have be found ${this.dans_actual}`
      throw new TestError({message: this.errorMessage, type:'expectation'})
    }
    else if ( maxcount && nombre_founds > maxcount ){
      let s     = maxcount > 1 ? 's' : ''
      this.errorMessage = `no more than ${maxcount} tag${s} (against ${nombre_founds} found) should have be found ${this.dans_actual}`
      throw new TestError({message:this.errorMessage, type:'expectation'})
    }
    else if ( mincount && nombre_founds < mincount ){
      let s     = mincount > 1 ? 's' : ''
      this.errorMessage = `at least ${mincount} tag${s} (against ${nombre_founds} found) should have be found ${this.dans_actual}`
      throw new TestError({message:this.errorMessage, type:'expectation'})
    }

    return true
  }
}

module.exports = PTestsDOM
