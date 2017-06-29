/*
J'essaie de "détacher" la classe Store de requirejs (cf. store.js) pour pouvoir la tester, en attendant de savoir aussi requérer des trucs en requirejs dans PTests
*/

let
    fs        = require('fs')
  , path      = require('path')

class Store
{
  /**
  *   Instance d'enregistrement dans un fichier
  *   @usage
  *     store = new Store('affixe fichier'[, {donnees défaut}])
  *     store.set(prop, val)
  *     store.get(prop)
  *
  **/
  constructor (faffixe, defaults)
  {
    if ( ! faffixe )
    { throw new Error("Il faut impérativement fournir le path relatif du fichier de données.")}
    this.faffixe  = faffixe
    this.fname    = `${faffixe}.json`
    this.defaults = defaults || {}
  }

  // API
  // #get Obtenir une clé ou un ensemble de clé
  // Retourne la valeur, si c'est une clé seule ou un dictionnaire
  // de valeurs si c'est une liste ou un dictionnaire de clé
  get (key)
  {
    if ( 'string' === typeof key)
    {
      return this.data[key] || this.defaults[key]
    }
    else if ( 'function' === typeof key.length )
    {
      // => Liste de clés passées en argument
      let h = {}
      key.map( (k) => { h[k] = this.data[k] || this.defaults[k] })
      return h
    }
    else
    {
      // => Dictionnaire de clés (avec valeurs par défaut)
      for( k in key ){
        let v = this.data[k]
        if ( key[k] === null && !v) v = this.defaults[k]
        key[k] = v
      }
      return key
    }

  }
  // #set Pour définir une valeur ou un tableau de valeurs
  set (key, value)
  {
    if ( 'object' === typeof key && !value)
    {
      for(let k in key){ this.data[k] = key[k]}
    }
    else
    {
      this.data[key] = value
    }
    this.save()
  }

  // /fin API
  // ---------------------------------------------------------------------

  save ()
  {
    try
    {
      fs.writeFileSync(this.fpath, JSON.stringify(this.data));
    }
    catch(erreur)
    {
      // throw(new Error(erreur))
      throw(erreur)
    }
  }

  /**
  * @property data Données du fichier ou données par défaut
  *
  * @usage
  *   store = new Store(...)
  *   let data = store.data
  **/
  get data ()
  {
    if ( fs.existsSync(this.fpath) )
    {
      return JSON.parse(fs.readFileSync(this.fpath))
    }
    else
    {
      return this.defaults
    }
  }
  // Chemin d'accès au fichier de données
  get fpath () {
    if ( undefined === this._file_path ) {
      this._file_path = path.join(Store.user_data_folder,this.fname)
    }
    return this._file_path
  }
  // @return le dossier des data de l'utilisateur
  static get user_data_folder () {
    if(undefined===this._udf){
      if ( 'undefined' !== typeof(USER_DATA_PATH) )
      {
        this._udf = USER_DATA_PATH // dans les tests, ou app n'est pas défini
      } else {
        this._udf = this.app.getPath('userData')
      }
    }
    return this._udf
  }
  static get app ()
  {
    if ( undefined === this._app )
    {
      let electron  = require('electron')
      this._app = electron.app || remote.electron.app
    }
    return this._app
  }

  // Pour définir certaines choses
  static setup (opts)
  {
    if ( opts.app ) { this._app = opts.app }
  }
}// fin class Store

module.exports = Store
