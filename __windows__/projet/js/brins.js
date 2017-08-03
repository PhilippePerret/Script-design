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

  /**
  * Nouveau brin demandé pour le projet propriétaire
  **/
  new ()
  {

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
  **/
  add ( dataBrin )
  {
    const my = this
    dataBrin.id = Brin.newID()
    new Brin(dataBrin)
    return my.PRsave()
  }

  PRsave ()
  {
    const my = this
    my.prepareData()
      .then( my.store.save.bind(my.store) )
      .then( () => {
        UILog("Brins du projet enregistrés.")
      })
      .catch( err => { throw err })
  }

  prepareData ()
  {
    const my = this
    return new Promise( (ok, ko) => {
      let hdata = {
          created_at: my.created_at || moment().format()
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

  showPanneau ()
  {
    currentPanneau.section.appendChild(this.panneau)
    this.panneau.setAttribute('style', '')
  }
  hidePanneau ()
  {
    this.panneau.setAttribute('style', 'display:none')
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
    Tabulator.unsetAsTabulator(this.form.id)
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
    this.formBuilt || this.buildForm()
    return this._form
  }

  /**
  * Construction du panneau des brins
  **/
  buildPanneau ()
  {
    let h = DOM.create('section', {id:'panneau_brins'})
    let newo

    newo = DOM.create('div', {class:'titre', inner: "Liste des brins"})
    h.appendChild(newo)

    Brins.items.forEach( (brin, bid) => {
      h.appendChild(brin.build())
    })

    // Maintenant qu'on a construit tous les brins, on peut les mettre
    // dans leur parent
    Brins.items.forEach( (brin, bid) => {
      if ( ! brin.parent_id ) { return }
      brin.parent.divChildren.appendChild(brin.div)
    })

    newo = DOM.create('div', {class:'explication', inner: "<b>Enter</b> ou <b>Escape</b> pour quitter le panneau."})
    h.appendChild(newo)

    this._panneau = h
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
    this.formBuilt = true
  }

}

module.exports = Brins
