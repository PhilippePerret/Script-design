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
}

module.exports = Brins
