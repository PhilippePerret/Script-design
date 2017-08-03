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
  reset ()
  {
    this._id32 = undefined
  }
}


module.exports = Brin
