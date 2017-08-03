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


  add ()
  {

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
    // On la rend tabularisable
    Tabulator.setupAsTabulator(my.form, {
      Map:{
          'titre'       : my.redefineProperty.bind(my, 'titre')
        , 'description' : my.redefineProperty.bind(my, 'description')
        , 'parent_id'   : my.redefineProperty.bind(my, 'parent_id')
        , 'type'        : my.redefineProperty.bind(my, 'type')
      }
    })
  }
  /**
  * Pour redéfinir les propriétés à l'aide du formulaire d'édition
  **/
  redefineProperty (property, nv)
  {
    console.log("Propriété %s mis à %s", property, nv)
  }
  hideForm ()
  {
    this.form.setAttribute('style','display:none')
    Tabulator.unsetAsTabulator(my.form.id)
  }

  /**
  * @return {HTMLElement} La section du panneau des brins
  **/
  get panneau ()
  {
    this.panneauBuilt || this.build_panneau()
    return this._panneau
  }

  /**
  * @return {HTMLElement} La section du formulaire d'édition.
  **/
  get form ()
  {
    this.formBuilt || this.build_form()
    return this._form
  }

  /**
  * Construction du panneau des brins
  **/
  build_panneau ()
  {
    let h = DOM.create('section', {id:'panneau_brins'})

    Brins.items.forEach( (brin, bid) => {
      h.appendChild(brin.build())
    })

    // Maintenant qu'on a construit tous les brins, on peut les mettre
    // dans leur parent
    Brins.items.forEach( (brin, bid) => {
      if ( ! brin.parent_id ) { return }
      brin.parent.divChildren.appendChild(brin.div)
    })

    this._panneau = h
    this.panneauBuilt = true
  }

  /**
  * Construction du formulaire d'édition des brins
  **/
  build_form ()
  {
    let h = DOM.create('section', {id:'form_brins'})

    let props = new Map([
        ['titre',       {inner: 'Titre provisoire'}]
      , ['description', {inner: 'Description provisoire'}]
      , ['parent_id',   {label: 'Brin parent'}]
      , ['type',        {label: 'Type de brin'}]
    ])
    props.forEach( (dprop, prop) => {
      let row   = DOM.create('div', {class:'row'})
      let label = dprop.label || prop.titleize()
      let lab  = DOM.create('label', {for:`brin_${prop}`, inner: label})
      let inner = dprop.inner || ''
      let span = DOM.create('span', {id:`brin_${prop}`, 'data-tab':prop, class: 'editable', inner: inner})
      row.appendChild(lab)
      row.appendChild(span)
      h.appendChild(row)
    })

    this._form = h
    currentProjet.ui.observeEditablesIn(this._form)
    this.formBuilt = true
  }

}

module.exports = Brins
