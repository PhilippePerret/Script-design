/*
  J'essaie d'isoler ici les méthodes spéciales pour le DOM des PTests

  Il faut qu'elles soient testtables en elles-mêmes, sans avoir à
  charger (beaucoup) d'autres choses.

*/
let path  = require('path')
let DOM   = require(path.join(C.LIB_UTILS_FOLDER,'dom_class'))

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
  * @param {Object} attrs_exp  Objet qui définit ce qu'on doit trouver
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
    this.act        = act
    this.attrs_exp  = attrs_exp
    if(!options){options={}}
    if(!options.template){options.template={}}
    this.options    = options
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
      this.resultat.step = 'définition de this.domActual'
      this.defineDOMActual()
      this.resultat.step = '/définition de this.domActual'
      this.resultat.domActual = this.domActual
      // console.log('this.domActual',this.domActual)

      // Recherche des TAGS CANDIDATES
      // =============================
      this.resultat.step = 'recherche des balises (tagList)'
      this.defineTagList()
      this.resultat.step = '/recherche des balises (tagList)'


      // On retire les propriétés qui ne sont pas des attributs à trouver
      // dans la balise, pour les mettre dans des valeurs de `this.expectation`
      // Il reste donc dans `attrs_exp` uniquement les attributs à trouver
      this.resultat.step = 'récupération des valeurs non-attributs'
      this.dispatchAttributes()
      this.resultat.step = '/récupération des valeurs non-attributs'

      // PREMIÈRE RECHERCHE : LES ATTRIBUTS
      // ==================================
      this.resultat.step = 'recherche sur les attributs'
      // Tous les éléments retenus doivent comporter les attributs
      // précisés. Ces attributs se trouvent dans attrs_exp
      if ( 0 === this.filtreTagList('checkAttributesIn') ) {
        throw new TestError({message: 'Aucune balise trouvée avec les attributs fournis.', type:'expectation'})
      }
      this.resultat.step = '/recherche sur les attributs'


      // DEUXIÈME RECHERCHE : LA CLASS CSS
      // ----------------------------------
      this.resultat.step = 'recherche sur la class (if any)'
      if ( this.expectation.class )
      {
        if ( 0 === this.filtreTagList('checkClassIn') )
        {
          throw new TestError({message:`Aucune balise trouvée ne contient la class CSS recherchée ("${this.expectation.class.join(' ')}").`,type:'expectation'})
        }
      }
      this.resultat.step = '/recherche sur la class (if any)'


      // TROISIÈME RECHERCHE : LE TEXTE
      // ----------------------------
      this.resultat.step = 'recherche sur le texte (if any)'
      if ( this.expectation.text ){
        this.prepareSearchText()
        if ( 0 === this.filtreTagList('checkTextIn') )
        {
          throw new TestError({message:"Aucune balise trouvée ne contient le texte recherché.",type:'expectation'})
        }
      }
      this.resultat.step = '/recherche sur le texte'

      // QUATRIÈME RECHERCHE : LES SOUS-BALISES
      // --------------------------------------
      if (this.expectation.children)
      {
        if ( 0 === this.filtreTagList('checkChildrenIn') )
        {
          throw new TestError({message:"Aucune balise trouvée ne contient les enfants recherchés.", type:'expectation'})
        }
      }

      // CINQUIÈME RECHERCHE : LE NOMBRE
      // -------------------------------
      this.resultat.step = 'recherche sur le nombre attendu (if any)'
      this.checkFinalCount()
      this.resultat.step = '/recherche sur le nombre attendu (if any)'

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
      }
      console.log(erreur)
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
        // this.domActual.innerHTML = act
        this.domActual = DOM.create('_cptests',{inner:act})
      }
      else
      {
        this.domActual = document.querySelector(act)
        if( ! this.domActual ) {
          throw new Error(`${act} n'est pas un sélecteur valide ou ne correspond à aucun élément DOM.`)
        }
      }
    } else {
      if ( 'function' !== typeof act.getAttribute ){
        throw new TestError({message: 'Il faut fournir un DOMElement ou le string d’un DOMElement.', type: 'expectation'})
      }
      this.domActual = DOM.create('_cptests')
      // Noter que si on ne clone pas act ci-dessous, c'est le node dans le
      // document lui-même qui sera affecté par les suppressions.
      this.domActual.appendChild(act.cloneNode(true))
    }
    return this.domActual
  }

  get tag () {
    if ( undefined === this._tag ) { this._tag = this.attrs_exp.tag }
    return this._tag
  }
  get capTag () {
    if ( undefined === this._captag ) { this._captag = this.tag.toUpperCase() }
    return this._captag
  }
  get capTagStr () {
    if ( undefined === this._captagstr )
    { this._captagstr = `&lt; ${this.capTag} &gt;` }
    return this._captagstr
  }

  get dans_actual () {
    if (undefined === this._dans_actual){
      // VERSION COMPLÈTE :
      this._dans_actual = `dans le code ${this.domActual.outerHTML}`
      // this._dans_actual = 'dans le code'
    }
    return this._dans_actual
  }

  defineTagList ()
  {

    // Un tag doit obligatoirement être défini. la politique de la recherche
    // doit être la précision, pas l'imprécision. On ne doit donc pas pouvoir
    // tester une balise avec '*'
    if (!this.tag || this.tag == '*'){
      throw new Error('Il faut définir précisément la balise recherchée.')
    }

    let liste = this.domActual.getElementsByTagName(this.tag)

    // Il faut obligatoirement que des balises aient été trouvées
    if ( 0 == liste.length ){
      this.errorMessage = `aucune balise ${this.capTag} n’a été trouvée ${this.dans_actual}`
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
      throw new Error(`le texte cherché doit être exclusivement de type {String} ou {RegExp} (il est de type {${t.constructor.name}})`)
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
    console.log(`-> filtreTagList( methode filtre : ${methode_filtre})`)
    let lasti = this.tagList.length - 1
    for(let ibal=lasti; ibal>=0; --ibal){
      let bal = this.tagList[ibal]
      if ( ! this[methode_filtre].bind(this)( bal ) )
      {
        this.tagList.splice(ibal, 1)
        console.log("TAGLIST RESTANTES",this.tagList)
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
      let aient = count > 1 ? 'aient' : 'ait'
      this.errorMessage = `${count} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s} ${this.dans_actual}`
      throw new TestError({message: this.errorMessage, type:'expectation'})
    }
    else if ( maxcount && nombre_founds > maxcount ){
      let s     = maxcount > 1 ? 's' : ''
      let aient = maxcount > 1 ? 'aient' : 'ait'
      this.errorMessage = `pas plus de ${maxcount} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s} ${this.dans_actual}`
      throw new TestError({message:this.errorMessage, type:'expectation'})
    }
    else if ( mincount && nombre_founds < mincount ){
      let s     = mincount > 1 ? 's' : ''
      let aient = mincount > 1 ? 'aient' : 'ait'
      this.errorMessage = `au moins ${mincount} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s} ${this.dans_actual}`
      throw new TestError({message:this.errorMessage, type:'expectation'})
    }

    return true
  }
}

module.exports = PTestsDOM
