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

class PTestsDOMFacilities
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
    // log(`-> actualTagContainsExpect (this.expect = ${JSON.stringify(this.expect)})`)
    // console.log(`-> actualTagContainsExpect (act = ${JSON.stringify(act)} / this.expect = ${JSON.stringify(this.expect)})`)
    let
          text
        , tagList = []

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

    if(!options){options={}}
    if(!options.template){options.template={}}

    try
    {

      // Définition de `this.domActual`
      // ------------------------
      // this.domActual est l'objet HTMLElement qui va encapsuler le code ou
      // l'élément fourni.
      //
      this.resultat.step = 'définition de this.domActual'
      this.defineDOMActual(act)
      this.resultat.step = '/définition de this.domActual'
      this.resultat.domActual = this.domActual
      // console.log('this.domActual',this.domActual)

      // Recherche des TAGS CANDIDATES
      // =============================
      this.resultat.step = 'recherche des balises (tagList)'
      this.defineTagList(attrs_exp)
      this.resultat.step = '/recherche des balises (tagList)'


      // On retire les propriétés qui ne sont pas des attributs à trouver
      // dans la balise, pour les mettre dans des valeurs de `this.expectation`
      // Il reste donc dans `attrs_exp` uniquement les attributs à trouver
      this.resultat.step = 'récupération des valeurs non-attributs'
      this.dispatchAttributes( attrs_exp )
      this.resultat.step = '/récupération des valeurs non-attributs'

      let nombre_restantes

      // PREMIÈRE RECHERCHE : LES ATTRIBUTS
      // ==================================
      this.resultat.step = 'recherche sur les attributs'
      // Tous les éléments retenus doivent comporter les attributs
      // précisés. Ces attributs se trouvent dans attrs_exp
      nombre_restantes = this.filtreTagList('checkAttributesIn')
      if ( 0 === nombre_restantes ) {
        throw new TestError({message: 'Aucune balise trouvée avec les attributs fournis.', type:'expectation'})
      }
      this.resultat.step = '/recherche sur les attributs'


      // DEUXIÈME RECHERCHE : LA CLASS CSS
      // ----------------------------------
      this.resultat.step = 'recherche sur la class (if any)'
      if ( this.expectation.class )
      {
        nombre_restantes = this.filtreTagList('checkClassIn')
        if ( 0 === nombre_restantes )
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
        nombre_restantes = this.filtreTagList('checkTextIn')
        if ( 0 === nombre_restantes )
        {
          throw new TestError({message:"Aucune balise trouvée ne contient le texte recherché.",type:'expectation'})
        }
      }
      this.resultat.step = '/recherche sur le texte'


      // // Recherche des SOUS-BALISES dans la balise
      // // -----------------------------------------
      // let messChildren = '' // le message qui sera écrit
      // if ( children )
      // {
      //   // log(`[have_tag] Recherche des enfants dans les (${nombre_founds}) balises candidates`)
      //   let
      //       nombre_children = children.length
      //     , ichild          = 0
      //     , childDef, childTag, childAttrs
      //     , childRes
      //
      //   // On construit le message final
      //   messChildren = []
      //
      //   for(ichild=0;ichild<nombre_children;++ichild){
      //     [childTag, childAttrs] = children[ichild]
      //     childDef = `une balise &lt; ${childTag.toUpperCase()} &gt;`
      //     if(childAttrs){ childDef += ` avec ${JSON.stringify(childAttrs)}`}
      //     messChildren.push(childDef)
      //   }
      //   messChildren = messChildren.join(', ')
      //   // On vérifie toutes les balises retenues
      //   for(i=nombre_founds-1;i>=0;--i){
      //     domel = tagList[i]
      //     for(ichild=0;ichild<nombre_children;++ichild){
      //       childDef = children[ichild]
      //       [childTag, childAttrs] = childDef
      //       // log(`Test de <${childTag}> dans #${domel.id}::${domel.constructor.name}`)
      //       // log('Avec les attributs:',childAttrs)
      //       // Est-ce que l'enfant est contenu dans la balise courante ?
      //
      //       // TODO La ligne ci-dessous fait disparaitre la ligne, pourquoi ?
      //       console.log('childTag =', childTag)
      //       console.log('childAttrs =', childAttrs)
      //       childRes = expect(domel).to.have_tag(childTag,childAttrs,{NaT:true})
      //       // childRes = {isOK: true}
      //
      //       log('childRes:',childRes)
      //       if (childRes.isOK)
      //       {
      //         // La balise contient l'enfant, on la garde
      //         // log(`${domel.id} contient cet enfant`)
      //       }
      //       else
      //       {
      //         // On retire la balise de la liste
      //         // log(`${domel.id} ne contient pas cet enfant`)
      //         tagList.splice(i,1)
      //         break // on peut passer au containeur suivant
      //       }
      //     }// fin de boucle sur tous les enfants à trouver
      //   }//fin de boucle sur toutes les balises trouvées
      //
      //   nombre_founds = tagList.length
      //   // log('[have_tag] Nombre de balises candidates restant après la recherche des children :',nombre_founds)
      // }//fin de s'il faut tester les enfants
      //
      // // Si un nombre d'éléments précis doit être trouvé, on vérifie
      // if ( count && nombre_founds != count ){
      //   let s     = count > 1 ? 's' : ''
      //   let aient = count > 1 ? 'aient' : 'ait'
      //   throw new PTestsExpectationError(`${count} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s}`)
      // }
      // else if ( maxcount && nombre_founds > maxcount ){
      //   let s     = maxcount > 1 ? 's' : ''
      //   let aient = maxcount > 1 ? 'aient' : 'ait'
      //   throw new PTestsExpectationError(`pas plus de ${maxcount} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s}`)
      // }
      // else if ( mincount && nombre_founds < mincount ){
      //   let s     = mincount > 1 ? 's' : ''
      //   let aient = mincount > 1 ? 'aient' : 'ait'
      //   throw new PTestsExpectationError(`au moins ${mincount} élément${s} (au lieu de ${nombre_founds}) aur${aient} dû être trouvé${s}`)
      // }
      //
      // // SUCCESS ou FAILURE
      // let m
      // this._expect_str = exp_str
      // // log(`[have_tag] BALISES CANDIDATES FINALES : ${nombre_founds} (act:${act_str.join(' ')}, attrs_exp:${this._expect_str})`)
      // if(nombre_founds){
      //   m = `${act} contient ${act_str.join(' ')}`
      //   if ('' != messChildren) { m += ` et contient ${messChildren}` }
      //   this.options.template.success = m
      // }else{
      //   m = `${act} ne contient pas ${act_str.join(' ')}`
      //   if ('' != messChildren) { m += ` qui contiendrait ${messChildren}`}
      //   throw new PTestsExpectationError(m)
      // }
      // return nombre_founds > 0 // OK, balise trouvée

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
  static defineDOMActual (act)
  {
    act = act.trim()

    if('string' === typeof act){
      // <= act est un String
      //  => Ça peut être du code HTML ou un selector. On test la première
      //     lettre pour le savoir.
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
      this.domActual.appendChild(act)
    }
    return this.domActual
  }

  static defineTagList (attrs_exp)
  {
    // Un tag doit obligatoirement être défini. la politique de la recherche
    // doit être la précision, pas l'imprécision.
    if (!attrs_exp.tag || attrs_exp.tag == '*'){
      throw new Error('Il faut définir précisément la balise recherchée.')
    }
    let tag       = String(attrs_exp.tag)
      , capTag    = tag.toUpperCase()
      , capTagStr = `&lt; ${capTag} &gt;`
      , elementList
    delete attrs_exp.tag

    elementList = this.domActual.getElementsByTagName(tag)
    this.resultat.step = '/recherche des balises (tagList)'

    // Contrôle que des balises aient été trouvées
    let nombre_founds = elementList.length
    if ( 0 == nombre_founds ){
      throw new TestError({message:`aucune balise ${capTag} n’a été trouvée`, type:'expectation'})
    }

    // On indique le nombre de balises trouvées dans les résultats qui seront
    // retournés.
    this.resultat.tags_found_count = nombre_founds

    this.exp_str += capTag
    this.act_str.push(String(capTag))



    // this.tagList
    // ============
    // On produit `tagList`, la liste des tags trouvés dont on tentera
    // de trouver ou pas les éléments cherchés
    // On transforme la liste des DOMElement en vrai Array
    for(let i=0;i<nombre_founds;++i){this.tagList.push(elementList[i])}
  }

  /**
  * Prend la liste des attributs fournis (attrs_exp) et les dispatche entre
  * les vrais attributs qu'on doit trouver dans la balise recherchée et les
  * attributs qui concernent d'autres choses comme le texte, le nombre de
  * balises, etc.
  *
  * @product this.expected_attributes et this.expectation
  **/
  static dispatchAttributes (attrs_exp)
  {
    // Pour mettre les attributs balises réels
    this.expected_attributes = {}
    let nonAttributs = ['count', 'max_count','min_count', 'children', 'text', 'class']
    let my = this
    for ( let prop in attrs_exp ){
      if(!attrs_exp.hasOwnProperty(prop)){continue}
      if( nonAttributs.indexOf(prop) > -1 )
      {
        my.expectation[prop] = attrs_exp[prop]
      }
      else
      {
        my.expected_attributes[prop] = attrs_exp[prop]
      }
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
  static prepareSearchText()
  {
    let t = this.expectation.text
    console.log("Texte recherché = ", t)
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
  static filtreTagList ( methode_filtre )
  {
    let lasti = this.tagList.length - 1
    for(let itag=lasti; itag>=0; --itag){
      let tag = this.tagList[itag]
      if ( ! this[methode_filtre].bind(this)( tag ) )
      {
        this.tagList.splice(itag, 1)
        console.log("Nouvelle tag liste",this.tagList)
      }
    }
    return this.tagList.length
  }

  /**
  * Retourne true si +tag+ contient l'attribut +attr+ avec la valeur +val+
  * et false dans le cas contraire
  **/
  static checkAttributesIn ( tag )
  {
    // console.log("this.expected_attributes = ",this.expected_attributes)
    for ( let attr in this.expected_attributes )
    {
      if(!this.expected_attributes.hasOwnProperty(attr)){continue}
      let val = tag.getAttribute(attr)
      if ( !val || val !== this.expected_attributes[attr] ) { return false }
    }
    return true
  }

  /**
  * Méthode de filtre qui regarde si la balise contient la class CSS définie
  **/
  static checkClassIn (tag)
  {
    if (!tag){ return false }
    let c = tag.className.trim()
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
  static checkTextIn ( tag )
  {
    let my = this
    // console.log('this')
    // console.log(this)
    // console.log('-> checkTextIn')
    // console.log(`recherche de (type ${this.text_regexp.constructor.name}) `, this.text_regexp)
    if(!tag){return false}
    // console.log('dans ', tag.innerHTML)
    return tag.innerHTML.search(this.text_regexp) > -1
  }

}

module.exports = PTestsDOMFacilities
