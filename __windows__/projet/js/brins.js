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
  static get (bid)
  {
    return this.items.get(Number(bid))
  }

  /**
  * @return {Brin} l'instance Brin d'ID 32 +bid32+
  * @param {String} bid32 Identifiant du brin exprimé en base 32.
  **/
  static getWithId32 ( bid32 )
  {
    return this.get( bid32.fromBase32() )
  }

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
    const my = this

    let dataBrin = my.getFormValues()
    my.add( dataBrin )
    my.modified = true
    // console.log("Création d'un nouveau brin avec les données :", dataBrin)

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

    if ( brin.parent_id ) {
      console.log("brin.parent_id = ", brin.parent_id)
      let parent  = my.ULlisting.querySelector(`li#brin-${brin.parent_id}`)
      container   = parent.querySelector('ul.children')
    } else {
      container = my.ULlisting
    }
    container.appendChild( brin.buildAsLI() )
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

      /*- Suppression dans ses Brins -*/
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
        console.log("= Fichier brins sauvé")
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
    console.log("-> PRloadData")
    if ( my.store.exists() )
    {
      console.log("PRloadData, le store existe")
      let res = my.store.load() // définit my._data
      console.log("my.store.load est de class ", res.constructor.name)
      return res
    }
    else
    {
      console.log("PRloadData, le store `%s` n'existe par.", my.store.path)
      my._data = my.defaultData
      return Promise.resolve()
    }
  }
  PRdispatchData ()
  {
    const my = this
    let brin

    my.reset()
    return new Promise( (ok, ko) => {
      my.data.items.forEach( hbrin => {
        hbrin.projet = my.projet
        brin = new Brin( hbrin )
      })
      ok()
    })
  }

  reset ()
  {
    const my = this

    Brins._items  = new Map()
    my._store     = undefined
    my._panneau   = undefined
    my._form      = undefined
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
      console.log("= Données brins préparés")
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
      dataBrin[prop] = my.getFormValue(prop).trim()
      if ( dataBrin[prop] == '' ) dataBrin[prop] = null
    })
    dataBrin.type && ( dataBrin.type = Number(dataBrin.type) )
    return dataBrin
  }
  /**
  * Pour mettre les valeurs de +brin+ dans le formulaire avant l'édition
  **/
  setFormValues ( brin )
  {
    const my = this
    Brin.PROPERTIES.forEach( (dProp, prop) => {
      my.setFormValue(prop, brin[prop])
    })
  }
  getFormValue(prop)
  {
    return this.form.querySelector(`span#brin_${prop}`).innerHTML
  }
  setFormValue(prop, value)
  {
    this.form.querySelector(`span#brin_${prop}`).innerHTML = value
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
  redefine_brin_type (nv)         { this.updateFormValue('type', nv)        }

  helpWanted ()
  {
    return ipc.send('want-help', { current_window: 'projet', anchor: 'formulaire_brin' })
  }

  /**
  * Appelée quand on abandonne l'édition (Escape)
  **/
  cancelEdition ()
  {
    this.hideForm()
  }

  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES D'HELPER
    *
  *** --------------------------------------------------------------------- */

  showPanneau ( params )
  {
    const my = this

    params || ( params = {} )

    if ( params.parag ) {
      my.oldBrinIds = params.parag.brin_ids.map( bid => { return bid })
      my.currentParag = params.parag

      // La listes qui vont permettre de gérer provisoirement les
      // ajouts et les retraits.
      // C'est cette liste, comparée à la liste initiale, qui va déterminer
      // les ajouts et les retraits produits.
      // La méthode `preparePanneauForCurrentParag` va la renseigner avec
      // les ids courants du parag.
      my.current_brin_ids = []

      my.preparePanneauForCurrentParag()
    }
    // Si la méthode showPanneau est appelée par un parag (verso de sa fiche),
    // on doit le préparer, c'est-à-dire sélectionner tous ses brins.

    currentPanneau.section.appendChild(my.panneau)
    my.panneau.setAttribute('style', '')

    if ( my.iselected ) { my.selectBrinCurrent() }
    else { my.iselected = 0 /* pseudo-méthode qui appelle selectBrinCurrent */}

    // La formule ci-dessus fait que lorsqu'on ré-ouvre le panneau, c'est
    // toujours le même brin qui est sélectionné. Peut-être qu'à l'usage il
    // faudra toujours remettre my.iselected à 0 ou TODO mettre une option

    // TODO Il faut toujours désélectionner le sélectionné précédent ?

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
        , ['Enter',       my.adopterChoix.bind(my)]
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
      if ( ids.indexOf(bid) < 0 )
      {
        o.className = 'brin'
      }
      else
      {
        o.className = 'brin chosen'

        // On mémorise cet ID de brin qui appartient au parag édité
        // (if any)
        my.current_brin_ids && my.current_brin_ids.push(bid)

      }
    })
  }

  get iselected () { return this._iselected }
  set iselected (v){
    this._iselected = v
    this._selected = undefined
    this.selectBrinCurrent()
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

  selectBrinCurrent ()
  {
    const my = this
    my.deselectBrinSelected()
    const o = my.ULlisting.querySelectorAll('li.brin')[my.iselected]
    o && ( o.className += ' selected' )
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
  /** ---------------------------------------------------------------------
    *   Toutes les méthodes qui réagissent aux touches clavier
    *   définies dans le MapLetter ci-dessus
  *** --------------------------------------------------------------------- */
  // Sélectionne le brin suivant dans le panneau
  selectNext (evt) {
    const my    = this
    const ilast = my.nombre_brins_displayed - 1
    if ( my.iselected >= ilast ) { return false }
    evt || ( evt = {} ) // pour les tests, au moins
    const increm = evt.shiftKey ? 10 : 1
    let newi = my.iselected + increm
    if ( newi >= ilast ) { newi = ilast }
    my.iselected = newi // pseudo-méthode
    return true
  }

  // Sélectionne le brin précédent dans le panneau
  selectPrevious (evt) {
    const my      = this
    if ( my.iselected == 0 ) { return false }
    evt || ( evt = {} ) // pour les tests, au moins
    const increm  = evt.shiftKey ? 10 : 1
    let newi = my.iselected - increm
    if ( newi < 0 ) { newi = 0 }
    my.iselected = newi // le sélectionne vraiment
    return true
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

    if ( forAjout )
    {
      my.current_brin_ids && my.current_brin_ids.push( brin.id )
      DOM.addClass(oBrin, 'chosen')
    } else {
      my.current_brin_ids && my.current_brin_ids.splice(my.current_brin_ids.indexOf(brin.id), 1)
      DOM.removeClass(oBrin, 'chosen')
    }
  }

  /**
  * Méthode appelée par le raccourci 'e' qui met en édition le parag
  * courant, donc sélectionné.
  **/
  editCurrent ()
  {
    // Cas : il n'y a pas de sélectionné
  }

  // Touche Enter => Les brins sont attribués au parag
  adopterChoix ( evt ) {

    if ( ! this.currentParag ) { return }

    const my = this

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

  }
  // Touche Escape => On renonce à choisir les brins
  renoncerChoix ( evt ) {
    // On a juste à fermer le tableau sans rien faire
    this.hidePanneau()
  }
  // Touche b => Nouveau brin demandé
  wantsNew (evt) {
    const my = this
    my.showForm( null /*brin à éditer*/, {callback: my.onCreateNew.bind(my) })
  }
  /**
  * Méthode appelée quand on revient de la création d'un brin
  * Ici, on le sélectionne et on l'ajoute automatiquement.
  **/
  onCreateNew ()
  {
    const my = this

    let newBrin = Brins.get(Brin._lastID)

    // On le sélectionne en le mettant en courant
    let iselected = 0
      , librins = my.ULlisting.querySelectorAll('li.brin')
      , librin  = null

    for(let len = librins.length ; iselected < len ; ++iselected) {
      let librin = librins[iselected]
      if ( Number(librin.getAttribute('data-id')) == newBrin.id ) break
    }
    my.iselected = iselected
    my.chooseCurrent()

  }
  // Touche @ => Aide concernant les brins
  afficherAide (evt) {
    return ipc.send('want-help', { current_window: 'projet', anchor: 'gestion_des_brins' })
  }


  hidePanneau ()
  {
    const my = this

    my.panneau.setAttribute('style', 'display:none')
    my.panneau.opened = false
    Tabulator.unsetAsTabulator(my.panneau)
  }

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
    my.form.setAttribute('style','')

    /*- On mémorise les paramètres transmis -*/
    my.formParams = params || {}

    /*- Map des autres lettres -*/

    let mapLetters = new Map([
        ['Enter',   brin ? brin.update.bind(brin) : my.createNew.bind(my)]
      , ['Escape',  my.cancelEdition.bind(my)]
      , ['@',       my.helpWanted.bind(my)]
      , ['l',       my.showPanneau.bind(my)]
      , ['j',       ()=>{return false} /* pour le désactiver*/]
    ])

    /*- Divers préparations et réglage pour l'édition -*/

    let mapTab = {} // pour setupAsTabulator
    Brin.PROPERTIES.forEach( (dProp, prop) => {
      mapTab[prop] = my.editProperty.bind(my, prop)
    })
    // Si un brin est défini, il faut mettre ses valeurs dans les champs
    brin && my.setFormValues(brin)

    // On la rend tabularisable
    Tabulator.setupAsTabulator(my.form, {
        Map         : mapTab
      , MapLetters  : mapLetters
    })
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
  * Ferme le formulaire de création du brin.
  **/
  hideForm ()
  {
    const my = this
    my.form.setAttribute('style','display:none')
    Tabulator.isTabulatorized(my.form) && Tabulator.unsetAsTabulator(my.form)
    my.formParams && my.formParams.callback && my.formParams.callback.call()

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

  /**
  * @return {HTMLElement} La section du formulaire d'édition.
  **/
  get form ()
  {
    this._form || this.buildForm()
    return this._form
  }

  /**
  * Construction du panneau des brins
  **/
  buildPanneau ()
  {
    let h = DOM.create('section', {id:'panneau_brins'})
    let newo, listing

    newo = DOM.create('div', {class:'titre', inner: "Liste des brins"})
    h.appendChild(newo)


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
      let divTitre = DOM.create('div', {class:'titre', inner: Brin.TYPES.get(typeId).hname})
      listing.appendChild(divTitre)
      grpBrins.forEach( brin => { listing.appendChild(brin.buildAsLI()) } )
    })
    h.appendChild(listing)

    // Maintenant qu'on a construit tous les brins, on peut les mettre
    // dans leur parent (en supposant bien entendu qu'ils appartiennent
    // au même groupe/type de brins)
    Brins.items.forEach( (brin, bid) => {
      if ( ! brin.parent_id ) { return }
      brin.parent.divChildren.appendChild(brin.div)
    })

    newo = DOM.create('div', {class:'explication', inner: "<b>Enter</b> ou <b>Escape</b> pour quitter le panneau."})
    h.appendChild(newo)

    this._panneau = h
    this._panneau.opened = false
  }

  /**
  * Construction du formulaire d'édition des brins
  **/
  buildForm ()
  {
    let h = DOM.create('section', {id:'form_brins'})
    let newo = null

    newo = DOM.create('div', {class:'titre', inner:'Formulaire de brin'})
    h.appendChild(newo)

    Brin.PROPERTIES.forEach( (dprop, prop) => {
      newo = DOM.create('div', {class:'row'})
      let label = dprop.hname || prop.titleize()
      let lab  = DOM.create('label', {for:`brin_${prop}`, inner: label})
      let inner = dprop.default || ''
      let spanData = {
          id              : `brin_${prop}`
        , 'data-tab'      : prop
        , inner           : inner
        , 'owner'         : 'currentProjet.brins'
        , 'class'         : 'editable'
      }
      dprop.enableReturn && (spanData['enable-return'] = 'true')
      let span = DOM.create('span', spanData)
      newo.appendChild(lab)
      newo.appendChild(span)
      h.appendChild(newo)
    })

    let textExp = "'<b>q</b>', '<b>s</b>', '<b>d</b>', '<b>f</b>'… pour éditer dans l'ordre des champs.</b>. '<b>l</b>' : liste des brins. <b>Enter</b> : enregistrer les données du brin (ou le créer). <b>Escape</b> : renoncer."
    newo = DOM.create('div', {class:'explication', inner: textExp})
    h.appendChild(newo)

    this._form = h
    currentProjet.ui.observeEditablesIn(this._form)
    this._form.opened = false

    return this._form
  }

}

module.exports = Brins
