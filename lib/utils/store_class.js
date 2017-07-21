/*
J'essaie de "détacher" la classe Store de requirejs (cf. store.js) pour pouvoir la tester, en attendant de savoir aussi requérer des trucs en requirejs dans PTests
*/

let path = require('path')
  , fs   = require('fs-extra')

class Store
{
  /**
  * @return {Number}  Un identifiant pour le nouveau store (surtout pour les
  *                   tests pour le moment)
  **/
  static newId (){
    if (undefined == this._lastId ){ this._lastId = 0 }
    this._lastId ++
    return this._lastId
  }
  /**
  *   Instance d'enregistrement dans un fichier
  *   @usage
  *     store = new Store('affixe fichier'[, {donnees défaut}])
  *     store.set(prop, val)
  *     store.get(prop)
  *
  * @param {String} faffixe L'affiche du fichier
  * @param {Object} defaults Le contenu par défaut
  * @param {AnyClass}  owner  Le propriétaire du store. Par exemple, c'est
  *           le panneau qui s'occupe du synopsis.
  *           Si ce owner est défini, il peut contenir une propriété `modified`
  *           qui définit s'il est modifié ou non. Cette méthode est mise à
  *           true à la fin de l'enregistrement asynchrone.
  *           Il peut également posséder une méthode `saving` qui sera mise
  *           à true pendant la sauvegarde.
  *
  **/
  constructor (faffixe, defaults, owner)
  {
    if ( ! faffixe )
    { throw new Error("Il faut impérativement fournir le path relatif du fichier de données.")}
    this.id       = Store.newId()
    this.faffixe  = faffixe
    this.fname    = `${faffixe}.json`
    this.defaults = defaults || {}
    this.owner    = owner
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
  set (key, value, synchronously)
  {
    if ( 'object' === typeof key && !value)
    {
      for(let k in key){ if(key.hasOwnProperty(k)){this.data[k] = key[k]} }
    }
    else
    {
      this.data[key] = value
    }
    if(undefined == synchronously){synchronously = false}
    return this.save(synchronously)
  }

  // /fin API
  // ---------------------------------------------------------------------

  save (synchronously)
  {
    const my = this
    try
    {
      my.saving = true
      my.saved  = false
      my.owner && ( my.owner.saving = true )
      my.ensureFolder()
      fs.existsSync(my.fpath) && fs.unlinkSync(my.fpath)
      if ( synchronously )
      {
        //
        // EN SYNCHRONE
        //
        fs.writeFileSync(my.fpath, this.data_json, {encoding:'utf8'})
        if (my.owner) { my.owner.onFinishSave() }
        my.saved  = true
        my.saving = false
    }
      else
      {
        //
        // EN ASYNCHRONE
        //
        var wstream = fs.createWriteStream(my.fpath);
        wstream.on('finish', function () {
          my.saved  = true
          my.saving = false
          if (my.owner) { my.owner.onFinishSave() }
        })
        wstream.write(this.data_json)
        wstream.end()
      }
      return true
    }
    catch(erreur)
    {
      // throw(new Error(erreur))
      throw(erreur)
    }
  }

  get data_json ()
  {
    return JSON.stringify(this.data)
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
    ( this._data && {} !== this._data ) || this.getData()
    return this._data
  }
  /**
  * @return {Object} Des data, soient prises dans le fichier, soit
  *                   dans les données par défaut transmises.
  **/
  getData ( loadingMethod, endingMethod ) {
    if ( fs.existsSync(this.fpath) )
    {
      // Si le fichier est en cours d'écriture, il faut remettre sa lecture
      // à plus tard
      if ( this.saving ) {
        this.timerSaving = setTimeout(this.getData.bind(this), 200)
      } else {
        this.timerSaving && clearTimeout(this.timerSaving)
        if ( 'function' === typeof loadingMethod )
        {
          // Chargement asynchrone
          let rstream = fs.createReadStream(this.fpath, {encoding:'utf8', bufferSize: 10 * 1024 /*64 * 1024*/})
          rstream
            .on('data', ( chunk ) => {
              console.log(`Received ${chunk.length} bytes of data.`)
              loadingMethod( chunk )
            })
            .on('end', () => {
              console.log(`Fin de la lecture du fichier ${this.fpath}`)
              endingMethod && endingMethod.call()
            })
        }
        else
        {
          // Chargement synchrone
          this._data = JSON.parse(fs.readFileSync(this.fpath))
          endingMethod && endingMethod.call()
          return this._data
        }
      }
    }
    else
    {
      if('function' == typeof endingMethod){
        endingMethod.call()
      }
      else
      {
        return this.defaults
      }
    }
  }
  // Chemin d'accès au fichier de données
  get fpath () {
    if ( undefined === this._file_path ) {
      this._file_path = path.join(Store.user_data_folder,this.fname)
    }
    return this._file_path
  }

  // Chemin d'accès au dossier
  // Noter que parfois le @fname est un chemin relatif
  get folder () {
    return path.dirname(this.fpath)
  }
  /**
  * S'assure que le dossier pour mettre le fichier de data existe
  **/
  ensureFolder() { fs.ensureDirSync(this.folder) }

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

  /**
  * @return {Application} L'application
  * dans le projet qui utilise Store, essayer plutôt de définir
  * `Store._app = app` plutôt que de laisser cette méthode la chercher par
  * elle-même, ce qui ne provoque pas de résultats heureux.
  **/
  static get app ()
  {
    if ( undefined === this._app )
    {
      let   electron  = require('electron')
          , {remote}  = require('electron')
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
