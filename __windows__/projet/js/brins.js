/**
 * Les méthodes indispensables
 *
 *  Brins.get(<ID brin>)
 *
 *    => Instance {Brin} du brin d'ID <ID brin>
 *
 *
 */
class Brins {

  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get items ()
  {
    this._items || ( this._items = new Map() )
    return this._items
  }

  /**
  * Pour pouvoir utiliser :
  *
  *   Brins.get(<ID brin>)
  *
  *
  * @return {Brin} l'instance Brin d'ID +bid+
  * @param {Number} bid IDentifiant du brin
  **/
  static get (bid) { return this.items.get(Number(bid)) }

  /**
  * @return {Brin} l'instance Brin d'ID 32 +bid32+
  * @param {String} bid32 Identifiant du brin exprimé en base 32.
  **/
  static getWithId32 ( bid32 ) { return this.get( bid32.fromBase32() ) }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
   * Instanciateur
   */
  constructor (projet)
  {
    this.projet = projet
  }

  get modified () { return this._modified || false }
  set modified (v){
    this._modified = v
    v && (this.projet.modified = true)
  }
  /**
  * Méthode appelée par la touche Enter sur le formulaire d'édition
  * du brin pour créer un nouveau brin.
  **/
  createNew ()
  {
    // console.log("-> Brins#createNew")
    const my = this
    let dataBrin = my.getFormValues()
    // On met toujours le type du brin sélectionné
    dataBrin['type'] = my.selected ? my.selected.type : 0
    my.add( dataBrin )
    my.modified = true
    my.hideForm()
    my.formParams && my.formParams.callback_oncreate && my.formParams.callback_oncreate.call()
  }

  /**
  * Actualisation du brin édité
  *
  * La méthode est appelée par la touche Enter sur le formulaire de brin (qu'il
  * vienne ou non du panneau de brin)
  **/
  updateCurrent ()
  {
    // console.log("-> Brins#updateCurrent")
    const my  = this
    const B   = my.currentBrin
    const BparentId = B.parent_id
    const oldParentId = (BparentId === undefined || BparentId === null)
                          ? null : BparentId
    B.update( my.getFormValues() )
    if ( my._panneau ){
      // Il faut prendre en compte le changement éventuel de titre
      my.ULlisting.querySelector(`div#brin-${B.id}-titre`).innerHTML = B.titre
      // Il faut prendre en compte le changement éventuel de parent
      if ( B.parent_id || B.parent_id === 0 )
      {
        // <= Le brin est introduit dans un brin
        // => Il faut mettre son LI dans le UL des enfants de ce brin parent
        B.parent.ULChildren.appendChild(B.LI)
      }
      else if ( null !== oldParentId )
      {
        // <= Le brin précédemment dans un parent
        // => Il faut le sortir et le mettre au bout de la liste
        my.ULlisting.appendChild(B.LI)
      }
    }
    my.hideForm()
  }
  /**
  * Ajoute un brin au projet (en le sauvant tout de suite)
  *
  * @param {Object|Brin} refBrin  Si c'est un brin, c'est un simple ajout
  *                               à la Map Brins.items.
  *                               Sinon, c'est une création d'instance.
  **/
  add ( refBrin, options )
  {
    const my = this

    options || ( options = {} )
    if ( 'Brin' === refBrin.constructor.name )
    {
      // <= refBrin est déjà un Brin
      // => On l'ajoute s'implement à Brins.items

      Brins.items.set( refBrin.id, refBrin )

    }
    else if ( 'object' === typeof(refBrin) && refBrin.titre )
    {
      refBrin.id = Brin.newID()
      let newB = new Brin(refBrin)
      if ( my.panneau.opened ) { my.addBrinToPanneau( newB) }
    }

    if ( options.save ) { return my.PRsave() }
  }

  /**
  * Ajoute le brin +brin+ au panneau (qui doit être ouvert)
  * C'est la méthode utilisée quand on crée un nouveau brin.
  *
  * @param {Brin} brin Le brin à ajouter au panneau
  **/
  addBrinToPanneau (brin)
  {
    const my = this
    let container = null
    const obrin   = brin.buildAsLI()

    if ( brin.hasParent() )
    {
      let parent  = my.ULlisting.querySelector(`li#brin-${brin.parent_id}`)
      brin.parent.ULChildren.appendChild( obrin )
    } else {
      // On ajoute le brin en fonction de son type
      let canAdd = false, added = false
      let children = my.ULlisting.childNodes
      let nb_children = children.length
      let child
      for(let ichild = 0; ichild < nb_children; ++ichild) {
        child = children[ichild]
        if ( child.tagName == 'DIV' ) {
          if ( child.getAttribute('data-type') == String(brin.type) ) {
            canAdd = true
          } else if ( canAdd ) {
            my.ULlisting.insertBefore(obrin, child)
            added  = true
            break
          }
        }
      }
      if ( ! added ) my.ULlisting.appendChild(obrin)
    }
  }

  remove( bid )
  {
    if ( bid && 'Brin' == bid.constructor.name ){ bid = bid.id }
    if ( ! bid || 'number' != typeof bid ) {
      throw new Error("Il faut fournir l'ID du brin ou le brin à détruire.")
    }
    let brin = Brins.get(bid)
    if ( brin )
    {
      /*- Suppression du brin dans tous ses parags -*/

      brin.parags.forEach( (p) => {
        p._brin_ids.splice( p.brin_ids.indexOf(bid), 1)
        p.modified = true
      })

      /*- Suppression dans Brins -*/

      Brins.items.delete(bid)

      this.modified = true
    }
    else { throw new Error(`Le brin #${bid} est inconnu au projet.`)}
  }

  /**
  * Enregistre tous les brins (si nécessaire (1))
  *
  * (1) this.modified doit être à true
  *
  * @return {Promise} Pour le chainage principalement, et lorsque la
  * liste sera longue peut-être.
  **/
  PRsave ()
  {
    const my = this

    if ( ! my.modified ) { return Promise.resolve() }
    return my.prepareData()
      .then( my.store.save.bind(my.store) )
      .then( () => {
        // console.log("= Fichier brins sauvé")
        UILog("Brins du projet enregistrés.")
        return Promise.resolve()
      })
      .catch( err => { throw err })
  }

  /**
  * Méthode asynchrone chargeant les données des brins et les dispatchant
  **/
  PRload ()
  {
    const my = this
    return my.PRloadData()
      .then( my.PRdispatchData.bind(my) )
      .catch( err => { throw err })
  }
  PRloadData ()
  {
    const my = this
    if ( my.store.exists() )
    {
      let res = my.store.load() // définit my._data
      return res
    }
    else
    {
      my._data = my.defaultData
      return Promise.resolve()
    }
  }
  PRdispatchData ()
  {
    const my = this
    let brin

    my.resetAll()
    return new Promise( (ok, ko) => {
      my.data.items.forEach( hbrin => {
        hbrin.projet = my.projet
        brin = new Brin( hbrin )
      })
      ok()
    })
  }

  resetAll ()
  {
    const my = this

    Brins._items  = new Map()
    my._store     = undefined
    my._panneau   = undefined
    my._form      = undefined
    my.reset()
  }

  reset ()
  {
    const my = this

    my._nb_displayed  = undefined
    my._imax_brin     = undefined
    my._selected      = undefined
  }

  prepareData ()
  {
    const my = this
    return new Promise( (ok, ko) => {
      let hdata = {
          projet_id : my.projet.id  || currentProjet.id
        , created_at: my.created_at || moment().format()
        , updated_at: true
        , items     : []
      }
      Brins.items.forEach( (dBrin, bid) => {
        hdata.items.push(dBrin.data)
      })
      my._data = hdata
      ok()
    })
  }

  get data () { return this._data }
  get defaultData () {
    this._defaultData || (
      this._defaultData = {
          projet_id   : this.projet.id
        , items       : []
        , created_at  : moment().format()
        , updated_at  : moment().format()
      }
    )
    return this._defaultData
  }
  get store () {
    this._store || ( this._store = new Store(path.join('projets',this.projet.id,'brins'), this))
    return this._store
  }

  helpWanted ()
  {
    return ipc.send('want-help', { current_window: 'projet', anchor: 'formulaire_brin' })
  }

  /**
  * Appelée quand on abandonne l'édition (Escape)
  **/
  cancelEdition ()
  {
    const my = this
    my.hideForm()
    my.formParams && my.formParams.callback_oncancel && my.formParams.callback_oncancel.call()
  }

  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES D'HELPER
    *
  *** --------------------------------------------------------------------- */
  setTitrePanneau ()
  {
    const my = this

    let titre = my.currentParag
                  ? `Brins du parag #${my.currentParag.id}`
                  : 'Liste des brins'
    my.panneau.querySelector('div#titre_panneau_brins').innerHTML = titre

  }
  showPanneau ( params )
  {
    const my = this

    params || ( params = {} )

    if ( params.parag ) {
      my.oldBrinIds = (params.parag.brin_ids||[]).map( bid => { return bid })
      my.currentParag = params.parag

      // La listes qui vont permettre de gérer provisoirement les
      // ajouts et les retraits.
      // C'est cette liste, comparée à la liste initiale, qui va déterminer
      // les ajouts et les retraits produits.
      // La méthode `preparePanneauForCurrentParag` va la renseigner avec
      // les ids courants du parag.
      my.current_brin_ids = []

      my.preparePanneauForCurrentParag()
      // Si la méthode showPanneau est appelée par un parag (verso de sa fiche),
      // on doit le préparer, c'est-à-dire sélectionner tous ses brins.
    }


    currentPanneau.section.appendChild(my.panneau)
    my.panneau.setAttribute('style', '')
    my.setTitrePanneau()

    if ( my.iselected ) { my.selectBrinCurrent() }
    else { my.iselected = 0 /* pseudo-méthode qui appelle selectBrinCurrent */}

    // La formule ci-dessus fait que lorsqu'on ré-ouvre le panneau, c'est
    // toujours le même brin qui est sélectionné. Peut-être qu'à l'usage il
    // faudra toujours remettre my.iselected à 0 ou TODO mettre une option

    my.panneau.opened = true
    Tabulator.setupAsTabulator(my.panneau, {
      MapLetters: new Map([
          ['ArrowDown',   my.selectNext.bind(my)]
        , ['ArrowUp',     my.selectPrevious.bind(my)]
        , ['ArrowRight',  my.chooseCurrent.bind(my)]
        , ['l',           my.chooseCurrent.bind(my)]
        , ['ArrowLeft',   my.chooseCurrent.bind(my)]
        , ['j',           my.chooseCurrent.bind(my)]
        , ['e',           my.editCurrent.bind(my)]
        , ['Enter',       my.confirmerChoix.bind(my)]
        , ['Escape',      my.renoncerChoix.bind(my)]
        , ['b',           my.wantsNew.bind(my)]
        , ['@',           my.afficherAide.bind(my)]
      ])
    })
  }

  preparePanneauForCurrentParag ()
  {
    const my  = this
    const ids = my.currentParag.brin_ids || []

    let o = null

    Brins.items.forEach( (brin, bid) => {
      o = my.ULlisting.querySelector(`li#brin-${bid}`)
      if ( ! o ) { return /* brin introuvable */}
      if ( ids.includes(bid) )
      {
        DOM.addClass(o, 'chosen')
        my.current_brin_ids && my.current_brin_ids.push(bid)
      }
      else {
        o.className = 'brin' }
    })
  }


  get iselected () { return this._iselected }
  set iselected (v){
    this._iselected = v
    this._selected = undefined
    this.selectBrinCurrent()
  }

  getIndexOfBrin (brin)
  {
    return this.getIndexOfLI(brin.LI)
  }
  /**
  * Retourne l'index du LI du brin dans le listing actuel
  **/
  getIndexOfLI (librin)
  {
    const my = this
    const LIs = my.LIlist
    let i = 0, len = LIs.length
    for (; i < len ; ++i){
      if ( LIs[i].id == librin.id ) return i ;
    }
    return null
  }

  get selected () {
    if ( ! this._selected ) {
      this._selected = this.ULlisting.querySelectorAll('li.brin')[this.iselected]
      if ( this._selected ) {
        this._selected = Brins.get(Number(this._selected.getAttribute('data-id')))
      }
    }
    return this._selected
  }
  // Alias sémantique (pour correspondre à « currentParag »)
  get currentBrin () { return this.selected }

  /**
  * On fournit un objet DOM LI du brin et la méthode retourne l'identifiant
  * du brin
  **/
  brin_LI_2_ID ( li )
  {
    return Number(li.getAttribute('data-id'))
  }

  /**
  * @return {Array} La liste de LI du listing des brins
  **/
  get LIlist ()
  {
    return this.ULlisting.querySelectorAll('li.brin')
  }

  /**
  * @param {Number} index L'index du LI de brin à obtenir
  * @return {HTMLElement} Le LI du brin se trouvant à l'index +index+
  **/
  getBrinLIAtIndex ( index )
  {
    if ( index > this.nombre_brins_displayed - 1 ) return null
    const my = this
    index < 0 && (index = my.nombre_brins_displayed + index)
    return my.LIlist[index] || null
  }
  getBrinIdAtIndex ( index )
  {
    if ( index > this.nombre_brins_displayed - 1 ) return null
    const li = this.getBrinLIAtIndex(index)
    return li ? this.brin_LI_2_ID(li) : null
  }
  getBrinAtIndex ( index )
  {
    if ( index > this.nombre_brins_displayed - 1 ) return null
    let id = this.getBrinIdAtIndex(index)
    return id === null ? null : Brins.get(id)
  }

  selectBrinCurrent ()
  {
    const my = this
    my.deselectBrinSelected()
    const o = my.getBrinLIAtIndex(my.iselected)
    o && DOM.addClass(o, 'selected')
  }
  deselectBrinSelected ()
  {
    const my = this
    const o = my.ULlisting.querySelector('li.selected')
    if ( ! o ) { return false }
    let c = o.className
    c = c.replace(/ selected/,'').trim()
    o.className = c
    return true
  }
  get nombre_brins_displayed ()
  {
    this._nb_displayed || (
      this._nb_displayed = this.ULlisting.querySelectorAll('li.brin').length
    )
    return this._nb_displayed
  }
  get imax_brin ()
  {
    this._imax_brin || ( this._imax_brin = this.nombre_brins_displayed - 1)
    return this._imax_brin
  }
  /** ---------------------------------------------------------------------
    *   Toutes les méthodes qui réagissent aux touches clavier
    *   définies dans le MapLetter ci-dessus
  *** --------------------------------------------------------------------- */
  // Sélectionne le brin suivant dans le panneau
  selectNext (evt) {
    const my = this
    if ( evt.metaKey ) return my.currentBrinDown(evt) ;
    if ( my.iselected >= my.imax_brin ) { return false }
    evt || ( evt = {} ) // pour les tests, au moins
    const increm = evt.shiftKey ? 10 : 1
    let newi = my.iselected + increm
    if ( newi > my.imax_brin ) { newi = my.imax_brin }
    my.iselected = newi // pseudo-méthode
    return true
  }

  /**
  * Déplace le brin vers le bas
  *
  * Commentaire  * N0004
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0004
  * N0005 (pour tout savoir sur les déplacements)
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0005
  **/
  currentBrinDown (evt)
  {
    // console.log("-> currentBrinDown")
    const my = this
    const hasParent = !!my.selected.hasParent()

    if ( hasParent )
    {
      my.ULlisting.insertBefore(my.selected.LI, my.selected.parent.LI.nextSibling)
      my.selected.update({parent_id: null})
    }
    else
    {
      const nextNode = my.selected.LI.nextSibling

      if ( nextNode )
      {
        // console.log("  Pas de parent mais un noeud suivant")
        const nextIsTitreType = 'DIV' == nextNode.tagName

        if ( nextIsTitreType )
        {
          const newType = Number(nextNode.getAttribute('data-type'))
          // console.log('newType de brin #%d mis à =', my.selected.id, newType)
          my.selected.update.call(my.selected, {type: newType})
          UILog(`Le nouveau type du brin est « ${Brin.TYPES.get(newType).hname} »`)
          my.ULlisting.insertBefore(my.selected.LI, nextNode.nextSibling)
        }
        else // next is Brin
        {
          // console.log("Le prochain est un brin")
          if ( my.selected.hasChildren() )
          {
            // console.log("Je place le brin après le prochain")
            my.ULlisting.insertBefore(my.selected.LI, nextNode.nextSibling)
          }
          else
          {
            const nextBrin = Brins.get(my.brin_LI_2_ID(nextNode))
            my.selected.update({parent_id: nextBrin.id})
            nextBrin.ULChildren.appendChild(my.selected.LI)
          }
        }
      }
    }
    my._iselected = my.getIndexOfLI(my.selected.LI)
  }

  // Sélectionne le brin précédent dans le panneau
  selectPrevious (evt) {
    const my      = this
    evt || ( evt = {} ) // pour les tests, au moins
    if ( evt.metaKey ) return my.currentBrinUp(evt) ;
    if ( my.iselected == 0 ) { return false }
    const increm  = evt.shiftKey ? 10 : 1
    let newi = my.iselected - increm
    if ( newi < 0 ) { newi = 0 }
    my.iselected = newi // le sélectionne vraiment
    return true
  }
  /**
  * Remonte le brin courant.
  *
  * N0004
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0004
  * N0005 (pour tout savoir sur les déplacements)
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0005
  **/
  currentBrinUp (evt)
  {
    const my = this
    const hasParent = !!my.selected.hasParent()

    if ( hasParent )
    {
      my.ULlisting.insertBefore(my.selected.LI, my.selected.parent.LI)
      my.selected.update({parent_id: null})
      UILog(`Brin #${my.selected.id} sorti de son brin parent.`)
    }
    else
    {
      const previousNode = my.selected.LI.previousSibling

      if ( previousNode )
      {
        if ( 'DIV' == previousNode.tagName )
        {
          my.ULlisting.insertBefore(my.selected.LI, previousNode)
          // Trouver le nouveau type
          let o = my.selected.LI
          let newType = null
          while( o = o.previousSibling) {
            if ('DIV' == o.tagName){
              newType = Number(o.getAttribute('data-type')) ; break
            }
          }
          if ( null === newType) newType = 0 ; // quand on passe au-dessus du premier
          my.selected.update({type: newType})
          UILog(`Type du brin #${my.selected.id} défini à « ${Brin.TYPES.get(newType).hname} ».`)
        }
        else
        {
          if ( my.selected.hasChildren() )
          {
            my.ULlisting.insertBefore(my.selected.LI, previousNode)
          }
          else
          {
            const previousBrin = Brins.get(my.brin_LI_2_ID(previousNode))
            previousBrin.ULChildren.appendChild(my.selected.LI)
            my.selected.update({parent_id: previousBrin.id})
          }
        }
      }
    }
    my._iselected = my.getIndexOfLI(my.selected.LI)
  }
  // Choisit le brin courant dans le panneau
  // Mais attention : si le parag possède ce brin, il faut lui retirer,
  // dans le cas contraire il faut liu ajouter.
  chooseCurrent (evt) {
    const my = this
    const para = my.currentParag
    if ( ! para ) { return }
    const brin = my.selected
    const oBrin = my.ULlisting.querySelector(`li#brin-${brin.id}`)
    const forAjout = my.current_brin_ids.indexOf(brin.id) < 0

    /*- On procède à la marque de l'ajout ou retrait du parag -*/

    let mess = `Le brin « ${brin.titre} » a été `
    if ( forAjout )
    {
      let nombre_chosen = my.ULlisting.querySelectorAll('li.brin.chosen').length
      if ( nombre_chosen >= Brin.NOMBRE_BRINS_MAX ) {
        alert(`Vous avez atteint le nombre maximum de brins (${Brin.NOMBRE_BRINS_MAX}).`)
      }
      else {
        my.current_brin_ids && my.current_brin_ids.push( brin.id )
        DOM.addClass(oBrin, 'chosen')
        UILog(`${mess}ajouté.`)
      }
    } else {
      my.current_brin_ids && my.current_brin_ids.splice(my.current_brin_ids.indexOf(brin.id), 1)
      DOM.removeClass(oBrin, 'chosen')
      UILog(`${mess}retiré.`)
    }
  }

  /**
  * Méthode appelée par le raccourci 'e' qui met en édition le parag
  * courant, donc sélectionné.
  **/
  editCurrent ()
  {
    this.currentBrin && this.showForm(this.currentBrin)
  }

  // Touche Enter => Les brins sont attribués au parag
  confirmerChoix ( evt ) {

    // console.log("-> Brins#confirmerChoix")
    const my = this

    if ( ! my.currentParag ) { return }

    let old_ids = (my.currentParag.brin_ids||[]).map(bid => {return bid})
    let new_ids = my.current_brin_ids

    new_ids = new_ids.filter( bid => {
      if ( old_ids.indexOf(bid) < 0 )
      {
        // <= L'ancienne liste ne connait pas cet ID
        // => C'est un nouveau brin
        return true
      }
      else
      {
        // <= L'ancienne liste connait cet ID
        // => Il n'y a rien à faire puisqu'il est encore dans la nouvelle.
        //    Donc on le retire de la liste.
        old_ids.splice(old_ids.indexOf(bid), 1)
        return false
      }
    })

    // Ici, `new_ids` contient les nouveaux ID de brins et `old_ids` contient
    // les brins qui n'appartiennent plus au parag

    // Ajout des nouveaux brins
    new_ids.forEach( bid => { Brins.get(bid).addParag( my.currentParag ) })
    // Retrait des anciens brins
    old_ids.forEach( bid => { Brins.get(bid).removeParag(my.currentParag) })

    if ( new_ids.length || old_ids.length ) {
      UILog('Nouveaux brins assignés au paragraphe.')
    }

    this.hidePanneau()

  }

  // Touche Escape => On renonce à choisir les brins
  renoncerChoix ( evt ) {
    // On a juste à fermer le tableau sans rien faire
    this.hidePanneau()
  }

  // Touche b => Nouveau brin demandé
  wantsNew (evt) {
    const my = this
    my.showForm( null /*brin à éditer*/, {callback_oncreate: my.onCreateNew.bind(my) })
  }
  /**
  * Méthode appelée quand on revient de la création d'un brin
  * Ici, on le sélectionne et on l'ajoute automatiquement.
  **/
  onCreateNew ()
  {
    const my = this
    let newBrin = Brins.get(Brin._lastID)
    my.reset()
    my.iselected = my.getIndexOfBrin(newBrin)
    my.currentParag && my.chooseCurrent()
  }

  // Touche @ => Aide concernant les brins
  afficherAide (evt) {
    return ipc.send('want-help', { current_window: 'projet', anchor: 'gestion_des_brins' })
  }

  /** ---------------------------------------------------------------------
    *
    *
    *     PANNEAU DES BRINS
    *
    *
  *** --------------------------------------------------------------------- */

  hidePanneau ()
  {
    const my = this

    my.panneau.setAttribute('style', 'display:none')
    my.panneau.opened = false
    Tabulator.unsetAsTabulator(my.panneau)
  }
  /**
  * @return {HTMLElement} La section du panneau des brins
  **/
  get panneau ()
  {
    this._panneau || this.buildPanneau()
    return this._panneau
  }
  /**
  * @property {HTMLElement} Listing des brins
  **/
  get ULlisting () {
    this._ULlisting || ( this._ULlisting = this.panneau.querySelector('ul#brins'))
    return this._ULlisting
  }

  buildDivTitre (typeId)
  {
    return DOM.create('div', {class:'titre', 'data-type': String(typeId), inner: Brin.TYPES.get(typeId).hname})
  }
  /**
  * Construction du panneau des brins
  **/
  buildPanneau ()
  {
    let h = DOM.create('section', {id:'panneau_brins'})
    let newo, listing

    newo = DOM.create('div', {id: 'titre_panneau_brins', class:'titre', inner: "Liste des brins"})
    h.appendChild(newo)


    let typesTraited = []
    // On conserve une liste des types qui vont être traités par
    // les brins existants pour ajouter les types manquants à la
    // suite afin de pouvoir faire entrer les brins dedans en les
    // déplaçant.

    // On classe
    let bsg = new Map()
      , lt  = []

    Brins.items.forEach((v,k) => {
      if (undefined === bsg.get(v.type))
        { bsg.set(v.type,[]);lt.push(v.type) }
      bsg.get(v.type).push(v)
    })
    lt.sort(function(a,b){ return a - b})
    let brins_grouped = lt.map(type => { return bsg.get(type) })

    listing = DOM.create('ul', {class:'brins', id: 'brins'})
    brins_grouped.forEach( grpBrins => {
      let typeId = grpBrins[0].type
      listing.appendChild(this.buildDivTitre(typeId))
      typesTraited.push(typeId)
      grpBrins.forEach( brin => { listing.appendChild(brin.buildAsLI()) } )
    })
    h.appendChild(listing)

    // Maintenant qu'on a construit tous les brins, on peut les mettre
    // dans leur parent (en supposant bien entendu qu'ils appartiennent
    // au même groupe/type de brins)
    Brins.items.forEach( (b, bid) => {
      if ( ! b.hasParent() ) return ;
      b.parent.ULChildren.appendChild(b.LI)
    })

    /*- Ajout des titres de type non traités (i.e. qui ne possèdent pas
        encore de brins) -*/

    Brin.TYPES.forEach( (dType, type) => {
      if ( typesTraited.includes(type) ) return ;
      listing.appendChild(this.buildDivTitre(type))
    })

    let explication = `
<shortcut>↑</shortcut> <shortcut>i</shortcut> <shortcut>↓</shortcut> <shortcut>k</shortcut> = sélectionner brin.
<shortcut>↑</shortcut> <shortcut>↓</shortcut> + <code>cmd</code> = déplacer le brin (voir l'explication de l'effet dans l'aide).
<shortcut>←</shortcut> <shortcut>j</shortcut> <shortcut>→</shortcut> <shortcut>l</shortcut> = entrer/sortir le brin du parag (si parag édité).
<br><shortcut>e</shortcut> = éditer le brin courant, <shortcut>@</shortcut> = aide.
<shortcut>Enter</shortcut> ou <shortcut>Escape</shortcut> pour quitter le panneau.

    `
    newo = DOM.create('div', {class:'explication', inner: explication})
    h.appendChild(newo)

    this._panneau = h
    this._panneau.opened = false
  }

  /****** =================================================================== */
  /****** ------------------------------------------------------------------- */
  /******                                                                     */
  /******                                                                     */
  /******   FORMULAIRE DE BRIN (ÉDITION/CRÉATION)
  /******                                                                     */
  /******                                                                     */
  /******-------------------------------------------------------------------- */
  /******==================================================================== */


  /**
  * Affichage du formulaire pour le brin (nouveau ou édition)
  *
  * @param {Brin}   brin Le brin à éditer (ou null pour un nouveau)
  * @param {Objet}  params Les paramètres transmis
  *       params.callback   Méthode à appeler après la définition du brin.
  **/
  showForm ( brin, params )
  {
    const my = this
    currentPanneau.section.appendChild(my.form)
    my.form.displayed = true
    my.form.setAttribute('style','')
    my.form.opened = true

    /*- On mémorise les paramètres transmis -*/
    my.formParams = params || {}

    /*- Map des autres lettres -*/

    let mapLetters = new Map([
        ['Enter',   brin ? my.updateCurrent.bind(my) : my.createNew.bind(my)]
      , ['Escape',  my.cancelEdition.bind(my)]
      , ['@',       my.helpWanted.bind(my)]
      , ['B',       my.showPanneau.bind(my)]
      , ['j',       ()=>{return false} /* pour le désactiver*/]
    ])

    /*- Divers préparations et réglage pour l'édition -*/

    let mapTab = {} // pour setupAsTabulator
    Brin.PROPERTIES.forEach((d, k) => {
      if ( false == d.editable ) return ;
      mapTab[k] = my.editProperty.bind(my,k)}
    )

    my.setFormValues(brin ? brin : 'default')
    // Si un brin est défini, il faut mettre ses valeurs dans les champs
    // Sinon, on met les valeurs par défaut

    // On la rend tabularisable
    Tabulator.setupAsTabulator(my.form, {
          Map         : mapTab
        , MapLetters  : mapLetters
      }
      , true // pour forcer l'actualisation, même si le formulaire est connu
    )
  }
  /**
  * Ferme le formulaire de création du brin.
  **/
  hideForm ()
  {
    const my = this
    my.form.setAttribute('style','display:none')
    my.form.opened = false
    Tabulator.isTabulatorized(my.form) && Tabulator.unsetAsTabulator(my.form)
  }

  /**
  * Pour redéfinir les propriétés à l'aide du formulaire d'édition
  **/
  editProperty (property)
  {
    const my  = this
    const obj = DOM.get(`brin_${property}`)
    my.projet.ui.activateEditableField(obj)
  }


  /**
  * @return {Object} contenant les données modifiées du brin (à créer ou édité)
  *
  * Soit ces valeurs sont celles dans le formulaire, soit ce sont celles
  * modifiées (mais bon, on aurait pu prendre toujours celles du formulaire)
  **/
  getFormValues ()
  {
    const my = this
    let dataBrin = {}
    Brin.PROPERTIES.forEach( (dProp, prop) => {
      if ( ! dProp.editable ) return ;
      dataBrin[prop] = my.getFormValue(prop).trim()
      if ( dataBrin[prop] == '' ) dataBrin[prop] = null
    })

    return dataBrin
  }
  /**
  * Pour mettre les valeurs de +brin+ dans le formulaire avant l'édition
  * Si brin = 'default', on met les valeurs par défaut.
  *
  * @param {Brin|String} brin Le brin ou 'default'
  **/
  setFormValues ( brin )
  {
    const my = this
    Brin.PROPERTIES.forEach((d, k)=>{
      if ( false === d.editable ) return ;
      let val = ('default' === brin) ? d.default : brin[k]
      my.setFormValue(k, val)
    })
  }
  getFormValue(prop)
  {
    return this.form.querySelector(`span#brin_${prop}`).innerHTML
  }
  setFormValue(prop, value)
  {
    this.form.querySelector(`span#brin_${prop}`).innerHTML = value || ''
  }
  /**
  * Traite la valeur modifiée et la remet dans le champ
  **/
  updateFormValue(prop, nv)
  {
    this.setFormValue(prop, UI.epureEditedValue(nv))
  }
  /**
  * 4 méthodes appelée par le formulaire d'édition du brin quand
  * on modifie les valeurs.
  **/
  redefine_brin_titre (nv)        { this.updateFormValue('titre', nv)       }
  redefine_brin_description (nv)  { this.updateFormValue('description', nv) }
  redefine_brin_parent_id (nv)    { this.updateFormValue('parent_id', nv)   }
  // redefine_brin_type (nv)         { this.updateFormValue('type', nv)        }

  onChooseTypeBrin ()
  {
    const my = this
    let type = my.form.querySelector('select#types_brin').value
    my.form.querySelector('span#brin_type').innerHTML = type
  }

  setTitreFormTo (newTitre)
  {
    const my = this
    if (undefined === newTitre) {
      newTitre = my.currentParag ? `Brins du parag #${my.currentParag.id}` : 'Formulaire de brin'
    }
    my.form.querySelector('div#titre-form-brin').innerHTML = newTitre
  }

  /**
  * @return {HTMLElement} La section du formulaire d'édition.
  **/
  get form ()
  {
    this._form || this.buildForm()
    return this._form
  }


  /**
  * Construction du formulaire d'édition des brins
  **/
  buildForm ()
  {
    const my = this

    let h = DOM.create('section', {id:'form_brins'})
    let newo = null

    newo = DOM.create('div', {id:'titre-form-brin', class:'titre', inner:'Formulaire de brin'})
    h.appendChild(newo)

    Brin.PROPERTIES.forEach( (dprop, prop) => {
      if ( ! dprop.editable ) return ;
      newo = DOM.create('div', {class:'row'})
      let label = dprop.hname || prop.titleize()
      let lab  = DOM.create('label', {for:`brin_${prop}`, inner: label})

      let spanData ;

      if ( prop != 'type' ) {
        spanData = {
            'data-tab'      : prop
          , 'owner'         : 'currentProjet.brins'
          , 'class'         : 'editable'
        }
      } else { spanData = {} }

      spanData.id = `brin_${prop}`

      dprop.default       && ( spanData.inner = dprop.default )
      dprop.enableReturn  && ( spanData['enable-return'] = 'true' )
      let span = DOM.create('span', spanData)
      newo.appendChild(lab)
      newo.appendChild(span)
      h.appendChild(newo)
    })


    let explication = `
<p class="small">Pour placer un brin dans un autre, ou pour choisir son <em>type</em>, déplacer le brin créé dans le listing à l'aide de CMD + <shortcut>↑</shortcut> et <shortcut>↓</shortcut></p>
    `
    let textExp = `
<shortcut>t</shortcut> = choisir le type, <shortcut>q</shortcut> <shortcut>s</shortcut>
… = éditer (ordre des champs) <shortcut>B</shortcut> = Liste des brins.
<shortcut>Enter</shortcut> = enregistrer les données du brin (ou le créer).
<shortcut>Escape</shortcut> = renoncer.`
    newo = DOM.create('div', {class:'explication', inner: explication + textExp})
    h.appendChild(newo)

    this._form = h
    currentProjet.ui.observeEditablesIn(this._form)
    this._form.opened = false

    return this._form
  }

}

module.exports = Brins
