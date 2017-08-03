class Brin
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static get MAX_TITRE_LENGTH       () { return 99 }
  static get MAX_DESCRIPTION_LENGTH () { return 256 }

  static newID ()
  {
    const curProjet = projet()

    this._lastID || ( this._lastID = curProjet.last_brin_id || -1 )
    ++this._lastID
    if ( this._lastID > 1023 ) {
      throw new Error("Désolé, mais on ne peut pas créer plus de 1024 brins.")
    }
    curProjet.data.last_brin_id = this._lastID
    curProjet.data.save()
    return this._lastID
  }


  /** ---------------------------------------------------------------------
    *
    *   INSTANCES
    *
  *** --------------------------------------------------------------------- */
  constructor (data)
  {
    this.data = data

    Brins.items.set(this.id, this)
  }

  get modified () { return this._modified }
  set modified (v){
    this._modified = v
    v && ( this.projet.modified = true )
  }

  get id32 ()
  {
    if ( undefined === this._id32) { this._id32 = this.id.toBase32() }
    return this._id32
  }

  get id () { return this.data.id   }
  set id (v){ this.data.id = Number(v)  }

  get titre       ()  { return this.data.titre        || 'Titre du brin par défaut'   }
  get description ()  { return this.data.description  || 'Description brin par défaut'}
  get parent_id   ()  { return this.data.parent_id  }
  get type        ()  { return this.data.type         || 0 }

  // ---------------------------------------------------------------------
  // Propriétés volatiles

  get projet () { return projet }
  get parent () {
    this.parent_id && (this._parent = Brins.get(this.parent_id))
    return this._parent
  }
  get div () {
    this._div || this.build()
    return this._div
  }
  get divChildren () {
    this._divChildren || ( this._divChildren = this.div.querySelector('div.children'))
    return this._divChildren
  }
  /**
   * Noter que les méthodes suivantes, jusqu'à besoin contraire, ne doivent être
   * appelées que pour la MODIFICATION des données. Elles entraineronts
   * l'enregistrement du brin.
   */
  set titre       (v){
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
    if ( v == '' ) { v = null }
    this.data.description = v
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
      this.data.parent_id = undefined
    }
    this.modified = true
  }

  /**
  * Définit le type du brin
  **/
  set type (v) {
    this.data.type = v
    this.modified = true
  }

  reset ()
  {
    this._id32 = undefined
  }


  /** ---------------------------------------------------------------------
    *
    *   Méthodes parags
    *
  *** --------------------------------------------------------------------- */

  addParag( pid )
  {
    if ( pid
         && (typeof(pid) == 'number' || pid.constructor.name == 'Parag'))
    {
      typeof(pid) == 'number' || ( pid = pid.id )
      this._parag_ids || ( this._parag_ids = [] )
      this._parag_ids.push( pid )
    }
    else
    {
      throw  new Error("Il faut fournir le parag (ou son ID) à ajouter au brin.")
    }
  }

  get parag_ids () { return this._parag_ids || [] }


  /** ---------------------------------------------------------------------
    *
    *   Méthodes d'helper
    *
  *** --------------------------------------------------------------------- */

  /**
  * Construit le DIV pour l'affichage dans le listing du brin
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
    let divbrin = DOM.create('div', {class: 'brin', id: divb_id})
    let divtitre = DOM.create('div',
        {class:'titre editable', id: `${divb_id}-titre`, inner: this.titre
          , 'data-tag':"brin_titre"
        })
    divbrin.appendChild(divtitre)
    let divchild= DOM.create('div', {class: 'children', id: `${divb_id}-children`})
    divbrin.appendChild(divchild)
    this._div = divbrin
    return this._div
  }

}


module.exports = Brin
