/** ---------------------------------------------------------------------
  *
  *   Class ProjetOptions
  *   -------------------
  *   Pour la gestion des options du projet
  *
  *   instance <projet>#options
  *
*** --------------------------------------------------------------------- */
class ProjetOptions
{
  constructor ( projet )
  {
    this.projet = projet
    this.load()
  }


  /* -publique- */
  define (arg)
  {
    console.log(arg)
  }

  /* -private- */

  get data ()
  {
    this._data || this.load()
    return this._data
  }
  /**
  * Sauvegarde des options du projet
  **/
  save ()
  {
    this.store_options.save()
  }

  /**
  * Chargement des données des options
  *
  * La méthode définit this._data
  **/
  load ()
  {
    this._data = this.store_options.data
  }

  /**
  * Définition des options
  *
  * @param  {Object} hd Les données à actualiser
  **/
  set ( hd )
  {
    for( let p in hd ) {
      if( ! hd.hasOwnProperty(p) ) { continue }
      this.data[p] = hd[p]
    }
    this.save()
  }

  get ( prop )
  {
    return this.data[prop]
  }

  /* -private - */
  get store_options     () {
    this._store_options || (this._store_options = new Store(`projets/${this.projet.id}/options`) )
    return this._store_options
  }

}

module.exports = ProjetOptions
