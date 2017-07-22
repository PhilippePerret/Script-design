/** ---------------------------------------------------------------------
  *   class Events
  *   ------------
  *   Gestion des évènements en tant qu'ensemble d'{Event}s.
  *
*** --------------------------------------------------------------------- */
let moment = require('moment')

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
    this.projet  = panprojet.projet
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
    this.selection.reset()
    this._items = []
    this._dict  = {}
    this._ids   = []
    this._count = 0
    this.panneau.container.innerHTML = ''
  }


  /**
  * Appelée pour créer un parag. Contrairement à la méthode `new`, qui
  * instancie un paragraphe qui existe déjà (qui a déjà été créé), cette
  * méthode crée un tout nouveau parag et, notamment, l'ajoute à la liste
  * des `relatives`.
  *
  * C'est la méthode qui est appelée par la touche `n` hors mode d'édition
  * depuis n'importe quel pano.
  **/
  create ()
  {
    // On crée le paragraphe est on l'affiche
    let newP = this.new()
    newP.created_at = moment().format('YYMMDD')
    // On l'ajoute à la liste des relatives qui tient à jour la relation entre
    // les paragraphes dans les différents panneaux
    this.projet.relatives.addParag(newP)
    // Si les options le demandent, on doit synchroniser les autres panneaux
    this.projet.option('autosync') && ( newP.sync_after_save = true )
    // On informe à titre indicatif
    UILog(`Création du paragraphe #${newP.id}`)
    // On l'édite pour le modifier
    this.select(newP)
    newP.edit()
    // On retourne le paragraphe créé
    return newP
  }


  /**
  * Appelée par la méthode `create` précédente, cette méthode
  * permet d'initier la création d'un paragraphe {Parag}.
  **/
  new (options)
  {
    let newP = new Parag({id:Parag.newID(),c:''})
    // console.log("ID du nouveau parag", newP.id)
    if (this.hasCurrent()) {
      options || ( options = {} )
      options.before = this.selection.current.next
    }
    this.add(newP, options)
    return newP
  }

  /**
  * Méthode ajoutant un paragraphe au pan-projet courant, par exemple au
  * synopsis ou au scénier.
  * Cet ajout consiste à ajouter le paragraphe au document affiché et à
  * l'ajouter dans la liste des paragraphes du panneau (s'il ne s'y trouve
  * pas déjà - au chargement, tous les paragraphes sont ajoutés).
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
  *                     before    {Parag} Au besoin, le parag avant lequel
  *                               créer le nouveau.
  *                     reset     {Boolean} Pour tout réinitialiser, comme au
  *                               chargement du panneau.
  *
  * Note : on observe aussi ce paragraphe.
  **/
  add ( argp, options, methodeAfterDisplay )
  {
    options || ( options = {} )

    // S'il faut tout réinitialiser
    options.reset && this.reset()

    Array.isArray(argp) || ( argp = [argp] )

    // On répète pour chaque paragraphe
    let my = this
      , div
      , lastParag

    my._dict || my.reset()

    argp.forEach( (iparag) => {

      methodeAfterDisplay && (iparag.methodeAfterDisplay = methodeAfterDisplay)

      // Paragraphe existant déjà
      if ( undefined !== my._dict[iparag.id] ) { return }

      // On définit la donnée panneau_id du paragraphe, qui n'est plus
      // définit par défaut ou par les données (car c'est une donnée qui
      // consomme et qui est inutile)
      iparag.panneau_id = my.panneau.id

      // On ajoute la div du paragraphe dans le panneau HTML
      if (options.before)
      {
        console.log(`Ajout du parag#${iparag.id} dans le panneau ${my.panneau.id}`)
        my.panneau.container.insertBefore(iparag.mainDiv, options.before.mainDiv)
      }
      else
      {
        console.log(`Ajout du parag#${iparag.id} dans le panneau ${my.panneau.id}`)
        my.panneau.container.appendChild(iparag.mainDiv)
      }

      // On ajoute le paragraphe à la liste des paragraphes du panneau
      if (options.before)
      {
        let index_before = options.before.index - 1
        my._items .splice(index_before, 0, iparag)
        my._ids   .splice(index_before, 0, iparag.id)
      }
      else
      {
        my._items.push(iparag)
        my._ids.push(iparag.id)
      }
      my._dict[iparag.id] = iparag

      // Il faut aussi ajouter une donnée relative pour ce paragraphe
      my.projet.relatives.addParag(iparag)

      // On augmente le nombre de paragraphe du panneau
      my._count ++

      // Noter que seule l'option selected pourra être appliquée
      // à tous les parags fournis, pas l'option current.
      options.selected && my.selection.add( iparag )

      lastParag = iparag
    })

  }

  /**
  * Méthode qui reçoit l'argument envoyé aux principales fonctions et
  * qui retourne un Array d'instances Parags qui seront traités.
  * @param  {Array}  argp Une liste soit d'instances {Parag} soit d'ID
  *         {Parag}  Une instance seule
  *      ou {Number} L'ID du parag à traiter.
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
  *
  * Cf. plus bas la définition de la classe
  **/
  get selection ()
  {
    this._selection || ( this._selection = new ParagsSelection(this) )
    return this._selection
  }

  /**
  * @return {Boolean} true/false suivant qu'il y a une sélection ou non
  **/
  hasCurrent ()
  {
    // console.log("this.selection.current : ", this.selection.current)
    return this.selection.current != null
  }
  /**
   * Sélectionne le ou les parags en argument
   * ----------------------------------------
   * @param {Parag|Number|Array} iparag Soit l'instance du parag soit son ID,
   *  soit une liste de l'un ou l'autre.
   * C'est un raccourci pour this.selection.add, mais qui traite en plus
   * une liste d'instances {Parag} ou d'ID de parags
   */
  select ( argp )
  {
    argp = this.realArgs(argp)
    argp.forEach( p => this.selection.add(p) )
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
    argp.forEach( p => this.selection.remove(p) )
  }

  /**
  * Désélectionne tous les parags sélectionnés dans le panneau courant ou
  * le panneau qui possède le parags.
  **/
  deselectAll () { this.selection.reset() }

  /**
  * @return {HTMLArray}
  **/
  get domElements () {
    return this.panneau.container.getElementsByClassName('p')
  }

  /**
  * @return {Parag} Le premier parag du panneau
  **/
  get first () {
    return this.count
      ? this.instanceFromElement(this.domElements[0])
      : null
  }
  /**
  * @return {Parag} Le dernier parag du panneau
  **/
  get last () {
    return this.count
      ? this.instanceFromElement(this.domElements[this.domElements.length-1])
      : null
  }

  /**
  * Méthode principale qui déplace le paragraphe en tant qu'élément
  * DOM dans le panneau.
  *
  * Noter que cette méthode ne déplace pas l'item dant _items et _ids donc
  * il ne faut pas l'utiliser directement. Utiliser plutôt des méthodes comme
  * moveCurrentUp ou moveCurrentDown.
  *
  * Note : cette méthode marque toujours le panneau (et donc le projet)
  * modifié.
  **/
  moveBefore ( parag, before )
  {
    if ( 'number' == typeof parag  ) { parag  = this.get(parag)  }
    if ( 'number' == typeof before ) { before = this.get(before) }

    parag  && (parag  = parag.mainDiv)
    before && (before = before.mainDiv)

    this.panneau.container.insertBefore(parag, before)

    this.panneau.modified = true

  }



  /**
  * Selectionne le paragraphe précédent ou suivant
  *
  * @param {KeyUpEvent} evt Suivant la touche du clavier, le comporterment
  * peut être différent :
  *       MAJ     On se déplace de 10 parags en 10 parags
  *       ALT     On doit déplacer le paragraphe au-dessus ou en dessous
  **/
  selectPrevious (evt)
  {
    if(!evt){evt={}}
    let pa = this.getPrevious( evt.shiftKey ? 5 : 1 )
    pa && this.select(pa)
  }

  /**
  * Sélectionne le paragraphe suivant (ou 5 paragraphes plus bas)
  **/
  selectNext (evt)
  {
    if(!evt){evt={}}
    let pa = this.getNext( evt.shiftKey ? 5 : 1 )
    pa && this.select(pa)
  }

  /**
  * @return {Parag} Le paragraphe qui précède le paragraphe courant.
  * @param {Number} to Définit à combien on doit prendre le précédent (1 par
  *                    défaut)
  **/
  getPrevious (to)
  {
    // Retourne null si:
    //  - il n'y a pas de parag dans le panneau
    //  - il n'y a pas de sélection dans le panneau
    if ( 0 == this.count || !this.selection.current ) { return null }


    // Sinon (s'il y a un paragraphe courant et que ce n'est pas le
    // premier, on le renvoie. Si c'est le premier, on renvoie le même
    if(undefined === to) { to = 1 }
    let   i = to
        , other
        , o = this.selection.current.mainDiv

    if ( ! o.previousSibling ) { return null }
    while ( i-- && o.previousSibling ){ o = o.previousSibling }

    return this.instanceFromElement(o)
  }

  /**
  * @return {Parag} Le paragraphe qui précède de +to+ le paragraphe
  * courant. Retourne NULL s'il n'y a aucun paragraphe ou le premier paragraphe
  * s'il n'y a aucun paragraphe courant.
  **/
  getNext (to)
  {
    if ( 0 == this.count ) { return null }
    // S'il n'y a pas de paragraphe courant, on doit sélectionner le premier
    if ( ! this.selection.current ) { return this.first }

    if ( undefined === to ) { to = 1 }
    let   i = to
        , other
        , o = this.selection.current.mainDiv

    if ( !o.nextSibling ) { return null }
    while ( i-- && o.nextSibling ) { o = o.nextSibling }

    return this.instanceFromElement(o)
  }

  /**
  * Remonte le parag courant
  **/
  moveCurrentUp (evt)
  {
    if(
          this.count == 0
      ||  !this.selection.current
      || this.selection.current.id == this.first.id
    ){
      return false
    }
    let current_index = Number(this.selection.current.index)
    if(!evt){evt={}}
    let pa = this.getPrevious(evt.shiftKey ? 5 : 1)
    // On déplace dans les listes
    this._items .splice(current_index, 1)
    this._ids   .splice(current_index, 1)
    // this._items.splice(current_index - 1, 0, this.selection.current)
    // this._ids.splice(current_index - 1, 0, this.selection.current.id)
    this._items .splice(pa.index, 0, this.selection.current)
    this._ids   .splice(pa.index, 0, this.selection.current.id)

    // NOTE 0001
    // Note : puisqu'on utilise `pa.index` ci-dessus pour positionner l'élément
    // déplacé, et que `.index` se sert du DOM pour renvoyer l'index, il faut
    // déplacer le paragraphe seulement après, sinon pa.index sera faux.
    this.moveBefore(this.selection.current, pa)
  }

  /**
  * Descend le parag courant
  **/
  moveCurrentDown (evt)
  {
    if(
          this.count == 0
      ||  !this.selection.current
      ||  this.selection.current.id == this.last.id
    ){
      return false
    }
    let current_index = Number(this.selection.current.index)
    if(!evt){evt={}}
    let pa = this.getNext(evt.shiftKey ? 5 : 1)

    // On déplace dans les listes
    this._items .splice(current_index, 1)
    this._ids   .splice(current_index, 1)
    this._items .splice(pa.index, 0, this.selection.current)
    this._ids   .splice(pa.index, 0, this.selection.current.id)

    // CF. NOTE 0001 CI-DESSUS (bien qu'ici ça pose moins de problème
    // puisque l'ajout se fait après)
    this.moveBefore(this.selection.current, pa.next)

  }


  /**
  * Met le paragraphe courant en édition (s'il existe)
  **/
  editCurrent ()
  {
    this.selection.current && this.selection.current.edit()
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
      , i
      , cancelF

    // Pour conserver les fonctions d'annulation
    this.cancelFunctions = []

    // On construit la méthode d'annulation
    let goodOnes = []
    argp.forEach( (iparag) => {
      if ( undefined == iparag ) { return }
      i = Number(iparag.index)
      if ( i < 0 ) { return }
      iparag.indexProv = i
      goodOnes.push(iparag)
    })

    // Pour l'annulation
    let old_items = new Array(...my._items)
      , old_ids   = new Array(...my._ids)
      , old_count = 0 + Number(my._count)
      , old_relatifs

    goodOnes.forEach( (iparag) => {
      i = iparag.indexProv
      // On dissocie avec ses relatifs avant de le détruire
      old_relatifs = iparag.data_relatives
      let canc = my.projet.relatives.dissociateWithAll( iparag, true )

      iparag.selected && my.selection.remove( iparag )

      // Supprimer du container
      let nextO = iparag.mainDiv.nextSibling
      my.panneau.container.removeChild(iparag.mainDiv)

      // Pour annulation
      cancelF = () => {
        let me = my
        me._items = old_items
        me._ids   = old_ids
        me._count = old_count
        me.panneau.container.insertBefore(iparag.mainDiv, nextO)
        me._dict[iparag.id] = iparag
        iparag.data_relatives = old_relatifs
        me.projet.relatives.deCancellisable(canc)
      }

      // Supprimer de la liste des items et du dictionnaire des Parags
      my._items .splice(i, 1)
      my._ids   .splice(i, 1)
      delete my._dict[iparag.id]
      my._count --

      this.cancelFunctions.push(cancelF)

    })// fin de boucle sur tous les paragraphes donnés en argument

    // On indique que la méthode d'annulation sera celle-ci
    this.projet.cancelableMethod = this.unRemoveLast.bind(this)
  }

  /**
  * Détruit la sélection courante
  **/
  removeCurrent ()
  {
    this.selection.current && this.remove(this.selection.current)
  }

  /**
  * Méthode pour annuler la destruction
  **/
  unRemoveLast ()
  {
    // console.log('-> unRemoveLast')
    this.cancelFunctions && this.cancelFunctions.forEach( f => f.call() )
    // console.log('<- unRemoveLast')
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
    argp.forEach( (p) => { p.modified = false } )
  }

  get as_data ()
  {
    // On commence par initialiser this._items ce qui produira la
    // relecture des paragraphes dans le document
    // TODO Mais je n'aime pas trop ça… Il vaut mieux faire une méthode
    // qui les relis et laisser items retourner simplement la liste des items
    delete this._items
    return this.items.map( p => p.data )
  }

  /**
  * Liste des paragraphes
  * ---------------------
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

      for(; i < nb ; ++i ){ arr.push( this.instanceFromElement(ps[i]) ) }
      this._items = arr
    }
    return this._items
  }

  /**
  * @return {Number} Le nombre de paragraphe dans le panneau
  **/
  get count ()
  {
    this._count || (this._count = this.items.length)
    return this._count
  }

  /**
  * @param {Number} parag_id Identifiant du paragraphe
  * @return {Parag} L'instance du paragraphe
  **/
  get ( parag_id ) { return this._dict[parag_id] }

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

    alert("Il faut actualiser cette méthode pour tenir compte du fait que les sélections se trouvent maintenant dans les deux panneaux.")
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
  * Pour ajouter le paragraphe, quel que soit son panneau, à la liste de
  * paragraphes courants, pour pouvoir toujours le récupérer par Parags.get
  *
  * @param  {Parag} iparag L'instance du paragraphe.
  *
  **/
  static add (iparag)
  {
    this._items || ( this._items = {} )
    this._items[iparag.id] = iparag
  }

  static get items () { return this._items }

  /**
  * Retourne l'instance Parag du paragraphe d'identifiant +parag_id+
  *
  * @param {Number} parag_id Identifiant du parag à retourner
  *
  * @return {Parag} Le parag d'identifiant +parag_id+ ou null s'il n'existe pas
  **/
  static get ( parag_id ) { return this.items[parag_id] }

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
    // console.log('-> ParagsSelection#reset')
    // try{throw new Error('Just pour voir')}
    // catch(err){console.log(err)}
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
    // console.log('-> ParagsSelection#unsetCurrent')
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
