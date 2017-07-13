/** ---------------------------------------------------------------------
  *   class Events
  *   ------------
  *   Gestion des évènements en tant qu'ensemble d'{Event}s.
  *
*** --------------------------------------------------------------------- */
class Parags
{


  /** ---------------------------------------------------------------------
    *
    *   INSTANCE PARAGS
    *   ---------------
    *   Pour la propriété `parags` des panneaux, qui gère les paragraphes
    *   d'un panneau
    *
    *   items     La liste (Array) de tous les parags du panneau
    *   _dict     Le dictionnaire avec en clé l'identifiant du parag et
    *             en valeur son instance Parag.
  *** --------------------------------------------------------------------- */

  /**
  * @param {PanProjet} panprojet Le panneau qui possède les paragraphes.
  **/
  constructor ( panprojet )
  {
    this.panneau = panprojet
  }

  /**
  * @param {HTMLElement} odom L'objet DOM du parag dans le panneau
  * @return {Parag} L'instance Parag correspondante.
  **/
  instanceFromElement (odom)
  {
    return this._dict[ Number(odom.getAttribute('data-id')) ]
  }

  /**
  * Reset toute la données parags du panneau (pour le moment, ça ne sert
  * qu'aux tests mais ça pourra servir ensuite au chargement d'un projet, pour
  * vider le panneau)
  **/
  reset ()
  {
    this.selection.current  && this.selection.unsetCurrent()
    this.selection.count    && this.deselectAll()
    this._items = []
    this._dict  = {}
    this._count = 0
    this.panneau.container.innerHTML = ''
  }
  /**
  * Méthode ajoutant un paragraphe au pan-projet courant, par exemple au
  * synopsis ou au scénier.
  * Cet ajout consiste à ajouter le paragraphe au document affiché et à
  * l'ajouter dans la liste des paragraphes du panneau.
  * TODO Pour le moment, le paragraphe s'ajoute toujours à la fin du
  * panneau mais on pourra déterminer plus tard la position que doit
  * adopter l'ajout, avant ou après la sélection courante (le paragraphe
  * courant).
  *
  * NOTE Maintenant, la méthode est seulement un raccourci public de
  * la méthode `add` de l'instance `Parags` du panneau, qui gère tous ses
  * parags.
  *
  * @param {Parag}  argp Le nouveau paragraphe (ici, une instance)
  *                 OU liste d'instances {Parag} à ajouter
  * @param {Object} options
  *                     edit      Si true, le paragraphe est aussitôt mis en
  *                               édition.
  *
  * Note : on observe aussi ce paragraphe.
  **/
  add ( argp, options )
  {
    options || ( options = {} )
    if ( options.edited ) { options.selected = true }

    if ( ! Array.isArray(argp) ) { argp = [argp] }

    // On répète pour chaque paragraphe
    let my = this
      , div
      , lastParag
    argp.forEach( (iparag) => {

      // TODO doit provoquer une erreur si le parag existe déjà
      if ( undefined !== my._dict[iparag.id] )
      {
        throw new Error(`Le paragraphe #${iparag.id} existe déjà dans ce panneau.`)
      }

      // console.log(`Ajout du paragraphe #${iparag.id}`)
      // On ajoute la div du paragraphe dans le panneau HTML
      my.panneau.container.appendChild(iparag.mainDiv)
      // TODO insertBefore (si options.before)
      // On ajoute le paragraphe à la liste des paragraphes du panneau
      my._items.push(iparag)
      my._dict[iparag.id] = iparag
      // TODO splice (si options.before)

      // On définit l'index
      // Rappel : ça ne sert pas vraiment, mais c'est au cas où, et pour
      // les tests.
      iparag.index = Number(my._count)

      // On augmente le nombre de paragraphe du panneau
      my._count ++

      // Noter que seule l'option selected pourra être appliquée
      // à tous les parags fournis.
      options.selected && my.selection.add( iparag )

      lastParag = iparag
    })

    options.edited && lastParag.edit()

  }

  /**
  *
  **/
  realArgs ( argp )
  {
    let my = this
    if ( ! Array.isArray(argp) ) { argp = [argp] }
    argp = argp.map( (p) => {
      if ( 'number' == typeof p ) { return my._dict[p] }
      else { return p }
    })
    return argp
  }

  /** ---------------------------------------------------------------------
    *
    * Toutes les méthodes qui relèvent de la sélection dans le panneau
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {ParagsSelection} l'instance qui gère la ou les sélections
  **/
  get selection ()
  {
    if ( undefined === this._selection ) {
      this._selection = new ParagsSelection(this)
    }
    return this._selection
  }

  /**
   * Sélectionne le ou les parags en argument
   * ----------------------------------------
   * @param {Parag|Number|Array} iparag Soit l'instance du parag soit son ID,
   *  soit une liste de l'un ou l'autre.
   */
  select ( argp )
  {
    argp = this.realArgs(argp)
    argp.forEach( (p) => { this.selection.add(p) } )
  }
  /**
   * Désélectionne le ou les parags en argument
   * ------------------------------------------
   * @param {Parag|Number|Array} iparag Soit l'instance du parag soit son ID,
   *  soit une liste de l'un ou l'autre.
   */
  deselect (argp)
  {
    argp = this.realArgs(argp)
    argp.forEach( (p) => { this.selection.remove(p) } )
  }

  /**
  * Désélectionne tous les parags sélectionnés
  **/
  deselectAll ()
  {
    if(0 == this.selection.count){return}
    this.deselect(this.selection.items)
  }
  /**
  * Retire le paragraphe +iparag+ de la liste des items et du panneau
  * @param {Parag} iparag Instance du parag à retirer
  *
  * Noter que le paragraphe, en temps d'instance, n'est pas détruit, tant
  * que le projet n'est pas enregistré. QUESTION Ou garde-t-on toutes les
  * instances ? en les marquant simplement 'deleted' ?
  **/
  remove (argp)
  {
    argp = this.realArgs(argp)
    let my = this
    argp.forEach( (iparag) => {
      if ( undefined == iparag ){
        console.log("iparag est indéfini avec les arguments : ",argp)
        return
      }
      iparag.selected && my.selection.remove( iparag )

      // Supprimer du container
      my.panneau.container.removeChild(iparag.mainDiv)

      // Supprimer de la liste des items et du dictionnaire des Parags
      my._items.splice(iparag.index, 1)
          //  Ci-dessus, ça ne marchera pas s'il a été déplacé. Ou alors,
          //  il faudrait utiliser une marque 'deleted' et ne tenir compte que
          //  des paragraphes non deleted et passer les autres.
      my._dict[iparag.id] = undefined
      my._count --
    })// fin de boucle sur tous les paragraphes donnés en argument
  }

  /**
  * Marque les paragraphes non modifiés.
  * @param {String|Parag|Array} argp
  *           - Instance {Parag}
  *           - {String} 'all' Pour dire "tous les paragraphes"
  *           - {Array} la liste des Paragraphes soit un paragraphe
  **/
  setUnmodified ( argp )
  {
    if ( undefined === argp || 'all' === argp ) {
      argp = this._items
    }
    else {
      argp = this.realArgs(argp)
    }
    argp.forEach( p => p.modified = false )
  }

  get as_data ()
  {
    // On commence par initialiser this._items ce qui produira la
    // relecture des paragraphes dans le document
    // TODO Mais je n'aime pas trop ça… Il vaut mieux faire une méthode
    // qui les relis et laisser items retourner simplement la liste des items
    delete this._items
    return this.items.map( p => p.as_data )
  }

  /**
  * Liste des paragraphes.
  * Noter qu'ils sont pris dans le document, mais que ça pourrait aussi
  * se prendre dans les données. L'avante de les prendre dans le document
  * c'est que les paragraphes sont dans le bon ordre.
  **/
  get items ()
  {
    if ( undefined === this._items ) {
      let arr = []
        , ps  = this.panneau.container.getElementsByClassName('p')
        , nb  = this._count = ps.length
        , i   = 0

      for(; i < nb ; ++i ){
        arr.push( this.instanceFromElement(ps[i]) )
      }
      this._items = arr
    }
    return this._items
  }
  /**
  * Définit les paragraphes (instances) au chargement du panneau.
  *
  * Ajoute également un index pour connaitre la position du paragraphe
  * dans le panneau.
  *
  * @param {Array} de {Object|Parag} pars Liste des paragraphes à mettre dans les
  * items du panneau. Chaque élément est soit un tableau contenant les données
  * du paragraphe, comme au chargement des données, soit une instance {Parag}
  * du paragraphe (utilisé pour le moment par les tests)
  **/
  set items ( pars )
  {
    let index = 0
      , my    = this
      , inst

    if ( pars[0] && pars[0].constructor.name == 'Parag'){
      // Les éléments de pars sont déjà des instances {Parag}
      this._items = pars.map( ipar => {
        ipar.index = index ++
        return ipar
      } )
    } else {
      // Les éléments de pars sont des tables
      this._items = pars.map( hpars => {
        inst = new Parag(hpars)
        inst.index = index ++
        return inst
      } )
    }
    this._count = this._items.length
    // On renseigne le dictionnaire
    my._dict = {}
    this._items.forEach( (p) => { my._dict[p.id] = p } )
  }

  /**
  * @return {Number} Le nombre de paragraphe dans le panneau
  **/
  get count ()
  {
    if ( undefined === this._count ) { this._count = this.items.length }
    return this._count
  }

  /**
  * @param {Number} parag_id Identifiant du paragraphe
  * @return {Parag} L'instance du paragraphe
  **/
  get ( parag_id ) { return this._dict[parag_id] }

  /** ---------------------------------------------------------------------
    *
    *   CLASSE Parags
    *
  *** --------------------------------------------------------------------- */


  /**
  * Appelée pour créer un parag. Contrairement à la méthode `new`, qui
  * instancie un paragraphe qui existe déjà (qui a déjà été créé), cette
  * méthode crée un tout nouveau parag et, notamment, l'ajoute à la liste
  * des `relatives`.
  *
  * C'est la méthode qui est appelée par la touche `n` hors mode d'édition
  * depuis n'importe quel pano.
  **/
  static create ()
  {
    // On crée le paragraphe est on l'affiche
    let newP = this.new({current:true, edited: true})
    // On l'ajoute à la liste des relatives qui tient à jour la relation entre
    // les paragraphes dans les différents panneaux
    let iprojet = Projet.current
    iprojet.relatives.addParag(newP)
  }


  /**
  * Appelée par la touche 'n' en dehors du mode édition, cette méthode
  * permet d'initier la création d'un paragraphe {Parag}.
  **/
  static new (options)
  {
    let newP = new Parag({id:Parag.newID(),contents:''})
    Projet.current_panneau.addParag(newP, options)
    return newP
  }

  /**
  * @param {HTMLElement} odom L'objet DOM du parag dans le panneau
  * @return {Parag} L'instance Parag correspondante.
  * TODO Rendre cette méthode OBSOLETE en utilisatn celle du panneau
  **/
  static instanceFromElement( odom )
  {
    return Parags.items[Number(odom.getAttribute('data-id'))]
  }

  /** ---------------------------------------------------------------------
    *
    *   RELATIVES
    *
  *** --------------------------------------------------------------------- */

  /**
  * Prend les paragraphes sélectionnés dans Parag.selecteds et les associe
  *
  **/
  static setSelectedsAsRelatives ()
  {

    console.log("Il faut actualiser cette méthode pour tenir compte du fait que les sélections se trouvent maintenant dans les deux panneaux.")
    return true
    // if ( Parag.selecteds.length < 2 )
    // {
    //   return alert("Accordez-moi une chose : pour associer deux paragraphes, avouez qu'il faut qu'il y en ait au moins deux…")
    // }
    // if ( ! confirm(`Voulez-vous vraiment associer les ${Parag.selecteds.length} parags sélectionnés ?`) )
    // { return false }
    //
    // // OK, on procède à l'association
    // // Si le référent est retourné (ce qui se produit en cas de réussite)
    // // alors on met en exergue les relatives de ce référent
    // let referent = Projet.current.relatives.associate(Parag.selecteds)
    // if ( referent ) {
    //   this.parags.selection.setCurrent(referent)
    //   referent.exergueRelatifs()
    // }
    //
  }

  /** ---------------------------------------------------------------------
    *
    *   ITEMS
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {Parag} Le parag d'identifiant +parag_id+ ou null s'il n'existe pas
  * @param {Number} parag_id Identifiant du parag à retourner
  **/
  static get ( parag_id )
  {
    return this.items[parag_id]
  }

  static get items () {
    if(undefined===this._items){this._items = {}}
    return this._items
  }
  static addItem (iparag)
  {
    if(undefined===this._items){
      this._items         = {}
      this._nombre_items  = 0
    }
    this._items[iparag.id] = iparag
    this._nombre_items ++
  }
  static get length () { return this._nombre_items }
  static get zeroParags () { return this.length === 0 }

  static get firstParag () {
    if(this.zeroParags){return null}
    let firstK = Object.keys(this.items)[0]
    return this.items[firstK]
  }
  static get lastParag () {
    if(this.zeroParags){return null}
    let lastK = Object.keys(this.items)[this.length-1]
    console.log(`lastK = `, lastK)
    return this.items[lastK]
  }

  /**
  * Selectionne le paragraphe précédent ou suivant
  *
  * @param {KeyUpEvent} evt Suivant la touche du clavier, le comporterment
  * peut être différent :
  *       MAJ     On se déplace de 10 parags en 10 parags
  *       ALT     On doit déplacer le paragraphe au-dessus ou en dessous
  **/
  static selectPrevious (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , prev  = this.getPrevious(to)

    if ( ! prev ) { return }
    Parag.setCurrent(prev)
  }
  /**
  * Remonte le parag courant
  **/
  static moveCurrentUp (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , prev  = this.getPrevious(to)

    if ( ! prev ) { return }
    Parag.current.moveBefore(prev)
  }

  /**
  * Sélectionne le paragraphe suivant (ou 5 paragraphes plus bas)
  **/
  static selectNext (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , next  = this.getNext(to)

    if ( ! next ) { return }
    Parag.setCurrent(next)
  }
  /**
  * Descend le parag courant
  **/
  static moveCurrentDown (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , next  = this.getNext(to)

    if ( ! next ) { return }
    Parag.current.moveAfter(next)
  }


  /**
  * @return {Parag} Le paragraphe qui précède le paragraphe courant.
  * @param {Number} to Définit à combien on doit prendre le précédent (1 par
  *                    défaut)
  **/
  static getPrevious (to)
  {
    // Quand il n'y a pas de paragraphe dans ce pan du projet, on ne
    // peut que retourner null
    if ( this.zeroParags )
    {
      return null
    }

    // S'il n'y a pas de paragraphe courant, on renvoie le dernier
    // paragraphe.
    if( ! Parag.current)
    {
      return this.lastParag
    }

    // Sinon (s'il y a un paragraphe courant et que ce n'est pas le
    // premier, on le renvoie. Si c'est le premier, on renvoie le même
    if(undefined === to) { to = 1 }
    let
          i = 0
        , other
        , o = Parag.current.mainDiv
    for(; i < to ; ++i )
    {
      o = o.previousSibling
      if ( o ) { other = o }
      else { break }
    }
    if ( other )
    {
      return this.items[Number(other.getAttribute('data-id'))]
    }
    else
    {
      return Parag.current
    }
  }

  /**
  * @return {Parag} Le paragraphe qui précède de +to+ le paragraphe
  * courant. Retourne NULL s'il n'y a aucun paragraphe ou le premier paragraphe
  * s'il n'y a aucun paragraphe courant.
  **/
  static getNext (to)
  {
    if ( this.zeroParags )
    {
      return null
    }
    // S'il n'y a pas de paragraphe courant, on doit sélectionner le premier
    if( ! Parag.current)
    {
      return this.firstParag
    }

    if ( undefined === to ) { to = 1 }
    let
          i = 0
        , other
        , o = Parag.current.mainDiv

    for (; i < to ; ++i )
    {
      o = o.nextSibling
      if ( o ) { other = o }
      else { break }
    }

    if ( other )
    {
      return this.instanceFromElement(other)
    }
    else
    {
      return this.lastParag
    }
  }

}


/** ---------------------------------------------------------------------
  *
  *   Class ParagsSelection
  *
*** --------------------------------------------------------------------- */
class ParagsSelection
{
  constructor ( panneauParags )
  {
    this.instance_parags = panneauParags
    this.reset()
  }

  /**
  * Prépare l'instance sélection
  **/
  reset ()
  {
    this.current && this.unsetCurrent()
    this.count && this.items.forEach(p => p.deselect())
    this.resetList()
    this._current   = null
    this._multiple  = false
  }

  resetList ()
  {
    this._count = 0
    this._dict  = {}
    this._items = []
    this._ids   = []
  }

  // ---------------------------------------------------------------------
  //  Définition du mode multiple/simple
  // ---------------------------------------------------------------------

  setMultiple (val)
  {
    if (undefined === val) { val = true }
    this._multiple = !!val
    if ( ! this._multiple && this.count > 1 ) {
      // Si on passe ne mode simple (non multiple) et qu'il y a
      // plusieurs sélections courante, on doit tout désélectionner à
      // par le dernier
      for ( let i = this.count - 2 ; i >=0  ; -- i )
      {
        this.remove(this.items[i], i)
      }
    }
  }
  get multiple () { return this._multiple }

  // ---------------------------------------------------------------------


  // ---------------------------------------------------------------------
  //  Méthodes d'ajout et de retrait
  // ---------------------------------------------------------------------

  add ( argp )
  {
    if ( 'number' === typeof argp ) { argp = this.instance_parags.get(argp) }
    this.current && this.unsetCurrent()
    if ( ! this.multiple )
    {
      this.items.forEach( p => p.deselect() )
      this.resetList()
    }
    argp.select()
    this._items.push(argp)
    this._dict[argp.id] = argp
    this._ids.push(argp.id)
    ++ this._count
    this.setCurrent( argp )
  }

  remove ( argp, index )
  {
    let update_current = false
    if ( argp.current ){
      this.unsetCurrent()
      // En mode multiple, si le courant est décurrentisé, il faut currentiser
      // le nouveau dernier parag sélectionné
      update_current = true
    }
    if( undefined === index) { index = this._ids.indexOf(argp.id) }
    delete this._dict[argp.id]
    this._items .splice(index, 1)
    this._ids   .splice(index, 1)
    argp.deselect()
    -- this._count
    // Il faut actualiser le paragraphe courant
    update_current && this.count && this.setCurrent( this.items[this.count-1] )
  }

  // ---------------------------------------------------------------------
  //  Gestion du parag courant
  // ---------------------------------------------------------------------
  setCurrent ( parag )
  {
    this._current = parag
    parag.setCurrent()
  }
  unsetCurrent ()
  {
    if ( ! this.current ) { return false }
    this.current.unsetCurrent()
  }

  // ---------------------------------------------------------------------
  //  Propriétés
  // ---------------------------------------------------------------------

  get count () { return this._count }

  get items () { return this._items }

  get dict  () { return this._dict  }

  get current () { return this._current }
}




module.exports = Parags
