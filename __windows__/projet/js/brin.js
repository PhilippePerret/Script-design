class Brin
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
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

  get id32 ()
  {
    this._id32 || ( this._id32 = this.id.toBase32() )
    return this._id32
  }
  get id () { return this._id       }
  set id (v){ this._id = Number(v)  }
}

module.exports = Brin
