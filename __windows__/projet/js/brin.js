class Brin
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static get MAX_TITRE_LENGTH       () { return 99  }
  static get MAX_DESCRIPTION_LENGTH () { return 256 }

  static get NOMBRE_BRINS_MAX       () { return 8   }

  static get TYPES () {
    this._types || (
      this._types = new Map([
          [0 , {hname: 'Non défini'}]
        , [10, {hname: 'Personnage'}]
        , [11, {hname: 'Relation de personnage'}]
        , [12, {hname: 'Protagoniste'}]
        , [20, {hname: 'Intrigue'}]
        , [30, {hname: 'Accessoire'}]
        , [31, {hname: 'Décor'}]
        , [60, {hname: 'Thématique'}]
        , [61, {hname: 'Documentation'}]
        , [99, {hname: 'Autre'}]
      ])
    )
    return this._types
  }

  static get PROPERTIES () {
    this._properties || (
      this._properties = new Map([
          ['titre',       {hname: 'Titre',        editable: true, default: 'Titre du brin'}]
        , ['description', {hname: 'Description',  editable: true, default: 'Description du brin', enableReturn: true}]
        , ['parent_id',   {hname: 'Brin parent',  editable: false}]
        , ['type',        {hname: 'Type brin',    editable: false}]
      ])
    )
    return this._properties
  }

  static newID ()
  {
    if ( undefined === this._lastID )
    {
      this._lastID = undefined === currentProjet.data.last_brin_id
                      ? -1
                      : currentProjet.data.last_brin_id
    }
    ++ this._lastID
    if ( this._lastID > 1023 ) {
      throw new Error("Désolé, mais on ne peut pas créer plus de 1024 brins.")
    }
    currentProjet.data.last_brin_id = this._lastID
    currentProjet.modified = true
    return this._lastID
  }


  static get menu_types ()
  {
    this._menu_types || this.buildMenuTypes()
    return this._menu_types
  }

  static buildMenuTypes ()
  {
    let s = DOM.create('select', {id:'parag_type', 'data-tab':'type'})
      , o
    this.TYPES.forEach( (dType, typeId) => {
      o = DOM.create('option', {value: typeId, inner: dType.hname})
      s.appendChild(o)
    })
    this._menu_types = s
  }

  /****** =================================================================== */
  /****** ------------------------------------------------------------------- */
  /******                                                                     */
  /******   INSTANCE
  /******                                                                     */
  /******-------------------------------------------------------------------- */
  /******==================================================================== */

  constructor (data)
  {
    this.projet = data.projet || currentProjet
    delete data.projet
    this._data = data
    Brins.items.set(this.id, this)
  }

  get modified () { return this._modified || false }
  set modified (v){
    this._modified = v
    v && ( this.projet.brins.modified = true )
  }

  get data () { return this._data }

  get id32 ()
  {
    if ( undefined === this._id32) { this._id32 = this.id.toBase32() }
    return this._id32
  }

  get id () { return this.data.id   }
  set id (v){ this.data.id = Number(v)  }

  get titre       ()  { return this.data.titre        || 'Titre du brin par défaut'   }
  get description ()  { return this.data.description  || 'Description brin par défaut'}
  get parent_id   ()  {
    if ( 'undefined' === this.data.parent_id ) this.data.parent_id = null ;
    return this.data.parent_id
  }
  get type        ()  {
    if ( undefined === this._type ) {
      this._type = Number(this.data.type || 0)
      if ( isNaN(this._type) ) this._type = 0
    }
    return this._type
  }
  get parag_ids   ()  { return this.data.parag_ids    || [] }

  // ---------------------------------------------------------------------
  // Propriétés volatiles

  get parent () {
    if ( undefined === this._parent && 'number' == typeof(this.parent_id) )
    {
      this._parent = Brins.get(this.parent_id)
    }
    return this._parent
  }
  /**
  * Tous les parags sous forme d'instance, sauf si elles ne sont pas
  * chargées.
  **/
  get parags () {
    this._parags || ( this._parags = this.parag_ids.map( pid => { return Parags.get(pid) }))
    return this._parags
  }
  get div () {
    if ( ! this._div ) {
      this.build()
      this._div = projet.brins.ULlisting.querySelector(`div#brin-${this.id}`)
    }
    return this._div
  }

  get LI () {
    this._li || ( this._li = projet.brins.ULlisting.get(`li#brin-${this.id}`))
    return this._li
  }

  get ULChildren () { return this.LI.querySelector(`ul#brin-${this.id}-children`) }

  /**
   * Noter que les méthodes suivantes, jusqu'à besoin contraire, ne doivent être
   * appelées que pour la MODIFICATION des données. Elles entraineronts
   * l'enregistrement du brin.
   */
  set titre (v){
    if ( ! v )        { throw "Il faut définir le titre !" }
    v = v.trim()
    if (v.trim == '') { throw "Il faut définir le titre !" }
    if (v.length > Brin.MAX_TITRE_LENGTH) {
      throw `Le titre du brin ne doit pas excéder les ${Brin.MAX_TITRE_LENGTH} caractères !`
    }
    this.data.titre = v
    this.modified   = true
  }
  set description (v){
    v || ( v = '' )
    v = v.trim()
    if ( v.length > Brin.MAX_DESCRIPTION_LENGTH) {
      throw `La description ne doit pas excéder les ${Brin.MAX_DESCRIPTION_LENGTH} caractères !`
    }
    if ( v == '' ) v = null ;
    this.data.description = v
    this.modified = true
  }
  set parent_id (v) {
    this.data.parent_id = v
    this.modified = true
  }
  /**
  * @param {Brin|Null} v Le brin parent ou null
  **/
  set parent (b) {
    if ( b && b.constructor.name == 'Brin') {
      this.data.parent_id = b.id
    } else if ( 'number' === typeof b ) {
      this.data.parent_id = Number(b)
    } else {
      this.data.parent_id = null
    }
    this.modified = true
  }

  hasParent ()
  {
    return 'number' === typeof this.parent_id
  }
  /**
  * @return {Boolean} True si le brin possède des enfants.
  *
  * Il y a deux manières de le savoir : si le LI du brin est construit dans
  * le listing, il suffit de compter son nombre d'enfants. Sinon, plus long,
  * on passe en revue tous les brins pour savoir lequel a pour parent_id ce
  * brin.
  **/
  hasChildren ()
  {
    const my = this
    if ( currentProjet.brins._panneau )
    {
      return my.ULChildren.childNodes.length > 0
    }
    else
    {
      let n = 0
      Brins.items.forEach( (brin, bid) => {
        if ( my.id === brin.parent_id ) n ++ ;
      })
      return n
    }
  }

  /**
  * Définit le type du brin
  **/
  set type (v) {
    if ( undefined !== v && null !== v ) v = Number(v) ;
    this.data.type = v
    this._type = v
    this.modified  = true
  }

  reset ()
  {
    this._id32      = undefined
    this._parent    = undefined
    this._brin_ids  = undefined
    this._type      = undefined
  }

  /**
  * Méthode appelée par le formulaire de brin pour confirmer les
  * nouvelles données et les enregistrer (en fait : marquer le brin modifié)
  *
  * @param {Map} newData  La map des nouvelles données du brin.
  **/
  update ( newData )
  {
    const my = this
    if ( newData )
    {
      my.reset()
      newData && forEach(newData, (v, k) => { my[k] = v })
      my.modified = true
    }
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes parags
    *
  *** --------------------------------------------------------------------- */

  /**
  * Ajoute le parag d'ID +pid+ à la liste des parags du brin
  *
  * @return {Boolean} True si le parag a été ajouté, false dans le cas
  *                   contraire (s'il existait déjà)
  * @param {Number|Parag} pid Soit l'ID du parag soit l'instance Parag.
  *
  **/
  addParag( pid )
  {
    const my = this

    pid && ('Parag' == pid.constructor.name) && ( pid = pid.id )
    if ( 'number' == typeof pid )
    {
      const parag = Parags.get(pid)
      let brin_ids = parag.brin_ids || []
      if ( brin_ids.includes(my.id) ) return false ;

      my.data.parag_ids || ( my.data.parag_ids = [] )
      my.data.parag_ids.push( pid )
      brin_ids.push(my.id)
      parag.brin_ids  = brin_ids
      parag.modified  = true
      my.modified     = true

      return true
    }
    else
    {
      throw  new Error("Il faut fournir le parag (ou son ID) à ajouter au brin.")
    }
  }

  removeParag (pid)
  {
    if ( pid && 'Parag' == pid.constructor.name ) { pid = pid.id }
    if ( 'number' === typeof pid )
    {
      const my    = this
      const parag = Parags.get(pid)

      let decBrin   = parag.brin_ids.indexOf(my.id)
      if ( decBrin < 0 ) { return false } // faux retrait
      let decParag  = my.parag_ids.indexOf(pid)

      parag._brin_ids.splice(decBrin, 1)
      my.data.parag_ids.splice(decParag, 1)

      my.modified     = true
      parag.modified  = true

      return true
    }
    else { throw new Error("La méthode Brin#removeParag attend un Parag ou son identifiant.")}
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes d'helper
    *
  *** --------------------------------------------------------------------- */

  /**
  * Construit le DIV pour l'affichage hors du listing du panneau
  *
  * Noter que ce div est éditable, pour pouvoir modifier le titre
  * du brin facilement, sans l'éditer.
  *
  * @return {HTMLElement} Le div construit
  **/
  build ()
  {
    const bid = this.id

    let divb_id = `brin-${bid}`
    let divbrin = DOM.create('div', {class: 'brin', id: divb_id, 'data-id': String(bid)})
    let divtitre = DOM.create('div',
        {class:'titre editable', id: `${divb_id}-titre`, inner: this.titre
          , 'data-tag':"brin_titre"
        })
    divbrin.appendChild(divtitre)
    let divchild= DOM.create('ul', {class: 'children', id: `${divb_id}-children`})
    divbrin.appendChild(divchild)
    this._div = divbrin
    return this._div
  }

  /**
  * Fabrique l'élément LI du brin, pour affichage dans une liste UL
  *
  * @return {HTMLElement} Le LI contenant le titre et l'UL des enfants
  **/
  buildAsLI ()
  {
    const bid = this.id

    let li_id = `brin-${bid}`
    let librin = DOM.create('li', {class: 'brin', id: li_id, 'data-id': String(bid)})
    let divtitre = DOM.create('div',
        {class:'titre editable', id: `${li_id}-titre`, inner: this.titre
          , 'data-tag':"brin_titre"
        })
    librin.appendChild(divtitre)
    let liChild = DOM.create('ul', {class: 'children', id: `${li_id}-children`})
    librin.appendChild(liChild)
    this._li = librin
    return this._li

  }

}


module.exports = Brin
