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

    my.hideForm()

    my._panneau = undefined // pour forcer sa reconstruction
    console.log("Création d'un nouveau brin avec les données :", dataBrin)
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
      new Brin(refBrin)
    }

    if ( options.save ) { return my.PRsave() }
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

    if ( my.store.exists() )
    {
      return my.store.load() // définit my._data
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
      dataBrin[prop] = (my[`${prop}_modified`] || my.getFormValue(prop)).trim()
      if ( dataBrin[prop] == '' ) dataBrin[prop] = null
    })
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
  updateFormValue(prop, nv)
  {
    nv = UI.epureEditedValue(nv)
    this[`${prop}_modified`] = nv
    this.setFormValue(prop, nv)
  }
  /**
  * 4 méthodes appelée par le formulaire d'édition du brin quand
  * on modifie les valeurs.
  **/
  redefine_brin_titre (nv) {
    this.updateFormValue('titre', nv)
  }
  redefine_brin_description (nv) { this.updateFormValue('description', nv)}
  redefine_brin_parent_id (nv)
  {
    this.updateFormValue('parent_id', nv)
  }
  redefine_brin_type (nv)
  {
    this.updateFormValue('type', nv)
  }

  helpWanted ()
  {
    alert("L'aide n'est pas encore implémentée pour ce panneau.")
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

    params.parag && my.preparePanneauFor( params.parag )
    // Si la méthode showPanneau est appelée par un parag (verso de sa fiche),
    // on doit le préparer, c'est-à-dire sélectionner tous ses brins.

    currentPanneau.section.appendChild(my.panneau)
    my.panneau.setAttribute('style', '')

    my.ibrin_selected || ( my.ibrin_selected = 0 )
    my.panneau.querySelectorAll('ul#brins > li.brin')[my.ibrin_selected].className += ' selected'
    // La formule ci-dessus fait que lorsqu'on ré-ouvre le panneau, c'est
    // toujours le même brin qui est sélectionné. Peut-être qu'à l'usage il
    // faudra toujours remettre my.ibrin_selected à 0 ou TODO mettre une option

    // TODO Il faut toujours désélectionner le sélectionné précédent ?

    my.panneau.opened = true
    // Tabulator.setupAsTabulator('ul#brins', {
    //   MapLetters: new Map([
    //       ['ArrowDown',   my.selectNext.bind(my)]
    //     , ['ArrowUp',     my.selectPrevious.bind(my)]
    //     , ['ArrowRight',  my.chooseCurrent.bind(my)]
    //     , ['ArrowLeft',   my.unchooseCurrent.bind(my)]
    //     , ['Enter',       my.adopterChoix.bind(my)]
    //     , ['Escape',      my.renoncerChoix.bind(my)]
    //     , ['b',           my.createNew.bind(my)]
    //     , ['@',           my.afficherAide.bind(my)]
    //   ])
    // })
  }

  preparePanneauFor ( parag )
  {
    const my = this
    const ids = parag.brin_ids || []

    let o = null
    Brins.items.forEach( (brin, bid) => {
      o = my.panneau.querySelector(`li#brin-${bid}`)
      if ( ! o ) { return /* brin introuvable */}
      if ( ids.indexOf(bid) < 0 )
      {
        o.className = 'brin'
      }
      else
      {
        o.className = 'brin chosen'
      }
    })
  }

  selectBrinCurrent ()
  {
    const my = this
    my.deselectBrinSelected()
    const o = my.panneau.querySelectorAll('ul#brins > li.brin')[my.ibrin_selected]
    o.className += ' selected'
  }
  deselectBrinSelected ()
  {
    const my = this
    const o = my.panneau.querySelector('ul#brins > li.selected')
    if ( ! o ) { return false }
    let c = o.className
    c = c.replace(/ selected/,'').trim()
    o.className = c
    return true
  }
  get nombre_brins_displayed ()
  {
    this._nb_displayed || (
      this._nb_displayed = this.panneau.querySelectorAll('ul#brins > li.brin').length
    )
    return this._nb_displayed
  }
  /** ---------------------------------------------------------------------
    *   Toutes les méthodes qui réagissent aux touches clavier
    *   définies dans le MapLetter ci-dessus
  *** --------------------------------------------------------------------- */
  // Sélectionne le brin suivant dans le panneau
  selectNext (options) {
    const my = this
    if ( my.ibrin_selected >= my.nombre_brins_displayed - 1) { return false }
    ++ my.ibrin_selected
    my.selectBrinCurrent()
    return true
  }

  // Sélectionne le brin précédent dans le panneau
  selectPrevious (evt) {
    const my = this
    if ( my.ibrin_selected == 0 ) { return false }
    -- my.ibrin_selected
    my.selectBrinCurrent()
    return true
  }
  // Choisit le brin courant dans le panneau
  chooseCurrent (evt) {console.log("Choisir le courant (à implémenter)")}
  // Retire le brin courant de la liste
  unchooseCurrent (evt) { console.log("Retirer le courant (à implémenter)") }
  // Touche Enter => Les brins sont attribués au parag
  adopterChoix ( evt ) { console.log("Adopter la liste courante (à implémenter)") }
  // Touche Escape => On renonce à choisir les brins
  renoncerChoix ( evt ) { this.hidePanneau() }
  // Touche b => Nouveau brin
  createNew (evt) { console.log("Création d'un nouveau brin (à implémenter)")}
  // Touche @ => Aide concernant les brins
  afficherAide (evt) { console.log("Affichage de l'aide sur les brins demandée")}


  hidePanneau ()
  {
    const my = this

    my.panneau.setAttribute('style', 'display:none')
    my.panneau.opened = false
    Tabulator.unsetAsTabulator('ul#brins')
  }
  showForm ()
  {
    const my = this
    currentPanneau.section.appendChild(my.form)
    my.form.setAttribute('style','')

    /*- Map des autres lettres -*/

    let brin = null // pour le moment (TODO)
    // TODO (dans Brin#update())
    // Utiliser la méthode projet.brins.getFormValues() pour obtenir
    // les nouvelles données éditées dans le formulaire.
    //
    let mapLetters = new Map([
        ['Enter',   brin ? brin.update.bind(brin) : my.createNew.bind(my)]
      , ['Escape',  my.cancelEdition.bind(my)]
      , ['@',       my.helpWanted.bind(my)]
      , ['l',       my.showPanneau.bind(my)]
      , ['j',       ()=>{return false} /* pour le désactiver*/]
    ])

    // Si un brin est défini, il faut mettre ses valeurs dans les champs
    brin && my.setFormValues(brin)

    // On la rend tabularisable
    Tabulator.setupAsTabulator(my.form, {
      Map:{
          'titre'       : my.editProperty.bind(my, 'titre')
        , 'description' : my.editProperty.bind(my, 'description')
        , 'parent_id'   : my.editProperty.bind(my, 'parent_id')
        , 'type'        : my.editProperty.bind(my, 'type')
      },
      MapLetters: mapLetters
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
  hideForm ()
  {
    this.form.setAttribute('style','display:none')
    Tabulator.unsetAsTabulator(this.form)
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

    let props = new Map([
        ['titre',       {inner: 'Titre provisoire'}]
      , ['description', {inner: 'Description provisoire', enableReturn: true}]
      , ['parent_id',   {label: 'Brin parent'}]
      , ['type',        {label: 'Type de brin'}]
    ])

    props.forEach( (dprop, prop) => {
      newo = DOM.create('div', {class:'row'})
      let label = dprop.label || prop.titleize()
      let lab  = DOM.create('label', {for:`brin_${prop}`, inner: label})
      let inner = dprop.inner || ''
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
