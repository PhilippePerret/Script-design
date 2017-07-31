/** ---------------------------------------------------------------------
  *
  *   Classe Store
  *   ------------
  *   Utilisée pour lire et écrire des données dans des fichiers avec des
  *   facilités. Cf. le fichier Store.md
  *
  *   Note : `path` et `fs` doivent avoir été globalisé, donc on
  *   n'en a pas besoin.
  *
*** --------------------------------------------------------------------- */


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
  *     store = new Store('affixe fichier'[, owner])
  *     store.save()
  *     store.loadSync()
  *
  * @param {String} faffixe L'affiche du fichier
  * @param {AnyClass}  owner  Le propriétaire du store. Par exemple, c'est
  *           le panneau qui s'occupe du synopsis.
  *           Si ce owner est défini, il peut contenir une propriété `modified`
  *           qui définit s'il est modifié ou non. Cette méthode est mise à
  *           true à la fin de l'enregistrement asynchrone.
  *           On mettra également une propriété `saving` à true pendant la
  *           sauvegarde.
  *
  **/
  constructor (faffixe, owner)
  {
    if ( ! faffixe )
    { throw new Error("Il faut impérativement fournir le path relatif du fichier de données.")}
    this.id       = Store.newId()
    this.faffixe  = faffixe
    this.fname    = `${faffixe}.json`
    this.defaults = {} // les définir après si nécessaire
    this.owner    = owner
  }

  /**
  * @return true si le fichier existe, false dans le cas contraire
  * Note : c'est une méthode synchrone
  **/
  exists ()
  {
    return fs.existsSync(this.path)
  }
  /**
  * Sauvetage synchrone des données
  **/
  saveSync ()
  {
    const my = this
    let data2save = null
    my.saving = true
    my.owner && (my.owner.saving = true)
    my.ensureFolder()
    fs.writeFileSync(my.path, my.data2save(), {encoding:'utf8'})
    my.saved  = true
    my.saving = false
    if (my.owner) {
      my.owner.saving   = false
      my.owner.modified = false
    }
  }

  data2save ()
  {
    const my = this
    let d
    if ( my.owner )
    {
      if ( undefined !== my.owner.data.updated_at ) {
        my.owner.data.updated_at = moment().format()
      }
      d = my.owner.data
    }
    else { d = my.data }
    return JSON.stringify(d)
  }

  /**
  * Sauvegarde asynchrone des données
  *
  * Si `owner` est défini, c'est `owner.data` qui est enregistré, après avoir
  * été jsonné, sinon, c'est this.data, mais qu'il faut alors définir.
  *
  * @return {Promise}
  **/
  save ()
  {
    const my = this
    my.saving = true
    my.owner && ( my.owner.saving = true )
    return new Promise( (ok, ko) => {
      fs.writeFile(my.path, my.data2save(), 'utf8', (err) => {
        if (err) ko(err)
        else {
          my.saving = false
          if ( my.owner )
          {
            my.owner.saving   = false
            my.owner.modified = false
          }
          ok(true)
        }
      });

    })
  }

  /**
  * Charge les données du fichier en synchrone.
  *
  * Si le propriétaire est défini (owner), les données sont mises à
  * sa propriété `_data` (owner._data)
  *
  **/
  loadSync ()
  {
    const my = this

    my.loading = true
    my.owner && ( my.owner.loading = true )

    my.data = JSON.parse(fs.readFileSync(my.path, 'utf8') || '""')

    if ( my.owner )
    {
      my.owner._data   = my.data
      my.owner.loading = false
    }
    my.loading = false
    return my.data
  }

  load ()
  {
    const my = this
    my.loading = true
    my.owner && ( my.owner.loading = true )
    let allchunks = []
    return new Promise( (ok, ko) => {
      let rstream = fs.createReadStream(this.path, {encoding:'utf8', highWaterMark: 32 * 1024 /*64 * 1024*/})
      rstream
        .on('data', ( chunk ) => {
          allchunks.push(chunk)
        })
        .on('end', () => {
          my.data = JSON.parse(allchunks.join(''))
          if ( my.owner ) {
            my.owner._data    = my.data
            my.owner.loading  = false
          }
          my.loading = false
          ok(true)
        })
    })
  }
  /**
  * Méthode nouvelle qui charge de façon synchrone un fichier et
  * appelle la méthode de traitement +methodTreatment+ pour le traiter
  **/
  loadAndTreatSync ( methodTreatment )
  {
    const my = this
    let data = null
    if (fs.existsSync(my.path))
    {
      data = fs.readFileSync(my.path, 'utf8')
      data != '' && ( data = JSON.parse( data ))
    }
    my.data = data

    /* - les données sont dispatchées dans l'owner- */

    for(let k in data){if (data.hasOwnProperty(k)){my.owner[k] = data[k]}}

    /*- On appelle la méthode de traitement des données si elle est fournie -*/

    methodTreatment && methodTreatment.call()

  }

  /**
  * @property data Données du fichier ou données par défaut
  *
  * @usage
  *   store = new Store(...)
  *   let data = store.data
  **/
  get data () { return this._data || {} }
  set data (v){ this._data = v }

  // Chemin d'accès au fichier de données
  get path () {
    if ( undefined === this._file_path ) {
      this._file_path = path.join(Store.user_data_folder,this.fname)
    }
    return this._file_path
  }

  // Chemin d'accès au dossier
  // Noter que parfois le @fname est un chemin relatif
  get folder () {
    return path.dirname(this.path)
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

  static get appPath () {
    this._apppath || (this._apppath = path.resolve('.'))
    return this._apppath
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
