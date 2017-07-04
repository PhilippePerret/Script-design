let RelOut

define(
  [
      C.LOG_MODULE_PATH // => log
    , C.DOM_MODULE_PATH // => DOM
    , PROJET_API_PATH   // => Projet
  ]
, function(
      log
    , DOM
    , Projet
  ){

    class Relatives
    {
      constructor (iprojet)
      {
        this.projet = iprojet
      }

      /** ---------------------------------------------------------------------
        *
        *   Méthodes publiques
        *
      *** --------------------------------------------------------------------- */
      addParag (iparag)
      {
        let newRelID = ++ this.data.lastRelativeID
        this.data.relatives[newRelID] = {}
        this.data.relatives[newRelID][iparag.panneau_id] = [iparag.id]
        this.data.id2relative[iparag.id] = newRelID
        // Non, on enregistrera les relatives que lorsqu'on sauvera
        // les paragraphes. On note simplement que relatives a été modifié
        this.modified = true
        // this.save()
      }

      /** ---------------------------------------------------------------------
        *
        *   Méthodes fonctionnelle
        *
      *** --------------------------------------------------------------------- */
      save ()
      {
        this.store.set( this.data )
      }

      get data ()
      {
        if ( undefined === this._data ) { this._data = this.store.data }
        return this._data
      }

      get defaultData () {
        return {
            "lastRelativeID"  : 0
          , "relatives"       : {}
          , "id2relative"     : {}
        }
      }

      get store ()
      {
        if (undefined === this._store)
        {
          this._store = new Store(this.relative_path, this.defaultData)
        }
        return this._store
      }
      get relative_path ()
      { return path.join('projets',this.projet.id,'relatives') }
    }

    RelOut = Relatives
    return Relatives
})

// Pour require
module.exports = RelOut
