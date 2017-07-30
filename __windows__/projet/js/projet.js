/** ---------------------------------------------------------------------
  *   API Projet
  *
*** --------------------------------------------------------------------- */
/*

  Projet API
  ----------

*/
// let
//       fs      = require('fs')
//     , moment  = require('moment')
// moment.locale('fr')

// log, DOM et Select sont utiles

  //   C.LOG_MODULE_PATH
  // , C.DOM_MODULE_PATH     // => DOM
  // , C.SELECT_MODULE_PATH  // => Select

/** ---------------------------------------------------------------------
  *
  *   class Projet
  *   ------------
  *   Gestion générale du projet.
  *
*** --------------------------------------------------------------------- */
class Projet
{
  /**
  * Pour faire comme en ruby : Projet.new(<projet id>)
  **/
  static new (projet_id )
  {
    return new Projet(projet_id)
  }


  static get PANNEAU_LIST () {
    this._panneaulist || (this._panneaulist = ['data','personnages','notes','synopsis','scenier','treatment','manuscrit'])
    return this._panneaulist
  }
  // Liste des panneaux qui peuvent être synchronisés les uns avec les autres
  static get PANNEAUX_SYNC () {
    this._panneauxSync || this.resetPanneauxSync()
    return this._panneauxSync
  }
  /**
  * Détaché pour être utilisé par les tests
  **/
  static resetPanneauxSync ()
  {
    this._panneauxSync = ['notes','synopsis','scenier','treatment','manuscrit']
  }

  /**
  *
  *
  * Pour obtenir ces données absolues, il suffit de faire :
  *
  *   projet.panneau(panneau_id).absData
  **/
  static get PANNEAUX_DATA ()
  {
    this._panneauData || (
      this._panneauData = {
          'data'        : {synchronizable: false, oneLetter: 'd'/* pour relatives*/ }
        , 'd' : 'data'
        , 'manuscrit'   : {synchronizable: true, oneLetter: 'm'}
        , 'm' : 'manuscrit'
        , 'notes'       : {synchronizable: true, oneLetter: 'n'}
        , 'n' : 'notes'
        , 'personnages' : {synchronizable: false, oneLetter: 'p'}
        , 'p' : 'personnages'
        , 'scenier'     : {synchronizable: true, oneLetter: 's'}
        , 's' : 'scenier'
        , 'treatment'   : {synchronizable: true, oneLetter: 't'}
        , 't' : 'treatment'
        , 'synopsis'    : {synchronizable: true, oneLetter: 'y'}
        , 'y' : 'synopsis'
      }
    )
    return this._panneauData
  }

  static UIprepare ()
  {

  }

  /**
  *   Chargement du projet data.projet_id
  *
  * La méthode regarde aussi s'il y a d'autres choses à faire, comme mettre
  * en route la boucle de sauvegarde en fonction des options.
  * TODO Plus tard, on pourra aussi avoir des notes à rappeler à l'ouverture,
  * par exemple.
  **/
  static load (data)
  {
    this.current = new Projet(data.projet_id)
    this.current.load.bind(this.current)()
  }

  /**
  * Méthode appelée par le tabulator des panneaux pour ouvrir un ou plusieurs
  * panneaux
  *
  * @param {Array} keys Liste des id-panneaux (un ou deux seulement) définissant
  *                     le ou les panneaux à ouvrir.
  **/
  static activatePanneauByTabulator ( keys )
  {
    const curProj = this.current
    // console.log('-> loadPanneauByTabulator avec:', keys)
    if ( keys.length == 1 )
    {
      curProj.activatePanneau(keys[0])
    }
    else
    {
      curProj.activateDoublePanneaux(...keys)
    }
  }

  static newID ()
  {
    this._lastid || ( this._lastid = 0 )
    this._lastid ++
    return this._lastid
  }


  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor (projet_id)
  {
    this.id = projet_id
    this.__ID = Projet.newID()
  }

  /** ---------------------------------------------------------------------
    *
    *   Propriétés générales
    *
  *** --------------------------------------------------------------------- */

  // Détermine si on se trouve en mode édition, c'est-à-dire dans un contenu
  // éditable. Ce mode détermine surtout l'action des raccourcis-clavier
  // uno-touche.
  get mode_edition () { return !!this._mode_edition }
  set mode_edition (v){ this._mode_edition = !!v }

  /**
  * La méthode d'annulation courante du projet.
  *
  * C'est la méthode qui sera interrogée par la combinaison CMD+Z pour
  * savoir si une cancellisation doit être exécutée.
  * Pour le moment, elle n'est implémentée que pour la suppression de
  * paragraphes.
  **/
  get cancelableMethod () { return this._cancelableMethod }
  set cancelableMethod (v){ this._cancelableMethod = v    }


  get modified () { return this._modified || false }
  set modified (v)
  {
    this._modified = v
    if (v) { this.ui.setProjetModifed()     }
    else   { this.ui.setProjetUnmodified()  }
  }
  set saving (v) {
    this._saving = v
    if (v) { this.ui.setProjetSaving() }
  }

  /**
  * Méthode appelée après chaque sauvegarde de panneau (ou autre) qui
  * vérifie l'état de sauvegarde du projet en général.
  * C'est également la méthode qui est appelée par la boucle de sauvegarde
  * automatique.
  * Noter que cette méthode ne fait rien d'autre, en soi, que vérifier l'état
  * général et de régler l'indicateur de sauvegarde dans l'interface.
  **/
  checkModifiedState ()
  {
    let my  = this
      , mod = false // Sera mis à true si on trouve quelque chose modifié
    Projet.PANNEAU_LIST.forEach( (pan_id) => {
      my.panneau(pan_id).modified && ( mod = true )
    })
    this.modified = mod // changera l'indicateur de sauvegarde
  }

  /* --- publiques --- */

  afficherStatistiques ()
  {
    alert("Pour le moment, je ne sais pas encore afficher les statistiques du projet.")
  }

  /**
  * Chargement du projet
  * Note : ce sont les données qui s'affichent toujours en premier, pour
  * le moment.
  **/
  load ()
  {

    this.set_title()
    this.set_authors()
    this.set_summary()
    this.set_created_at()
    this.set_updated_at()

    this.observeEditableFields()
    this.options.load(this.prepareSuivantOptions.bind(this))
  }

  /** ---------------------------------------------------------------------
    *
    *   méthodes PANNEAUX
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {PanProjet} Le panneau courant (qui est beaucoup plus qu'un panneau)
  * Par défaut, c'est le panneau des données générales du projet.
  **/
  get current_panneau () {
    this._current_panneau || ( this._current_panneau = this.panneaux['data'] )
    return this._current_panneau
  }
  set current_panneau (v) { this._current_panneau = v }

  panneau (pan_id) {
    return this.panneaux[pan_id]
  }
  get panneaux () {
    this._panneaux || this.definePanneauxAsInstances()
    return this._panneaux
  }

  // Crée les instances panneaux pour le projet courant
  definePanneauxAsInstances ()
  {
    let my = this
    // my._panneaux = {}
    // Pour la transition de Projet.panneaux à projet.panneaux
    my._panneaux = {}
    Projet.PANNEAU_LIST.forEach( (panid) => {
      my._panneaux[panid] = new PanProjet(panid, my)
    })
  }

  /**
  * Méthode fonctionnelle chargeant le plateau voulu
  **/
  activatePanneau (panneau_id, evt)
  {
    const my = this
    // console.log(`-> Projet#loadPanneau(${panneau_id})`)

    my.desactiveAllCurrents()
    // Si on était en mode double panneau, il faut en sortir, même
    // si on va y revenir tout de suite

    my.current_panneau = my.panneau(panneau_id)
    my.current_panneau.activate()
    my.mode_double_panneaux = false

    // console.log("<- #activatePanneau %s", panneau_id)
  }



  /**
  * Méthode fonction passant en mode double panneau
  **/
  activateDoublePanneaux (pan1_id, pan2_id)
  {
    const my = this
    // Désactiver les panneaux courants (if any)
    my.desactiveAllCurrents()

    my._current_panneau = curProj.panneau(pan2_id)
    my.current_panneau.activate()
    my.current_panneau.setModeDouble('right')

    my.alt_panneau = curProj.panneau(pan1_id)
    my.alt_panneau.activate()
    my.alt_panneau.setModeDouble('left')

    my.mode_double_panneaux = true
  }


  /**
  * Désactive le ou les panneaux affichés, en les repassant dans leur
  * mode normal (en mode double panneaux, ils sont rétrécis et placés à
  * gauche et à droite)
  **/
  desactiveAllCurrents ()
  {
    const my = this
    if ( my.mode_double_panneaux )
    {
      my.alt_panneau.desactivate()
      my.alt_panneau.unsetModeDouble()
      my.current_panneau.unsetModeDouble()
    }
    my.current_panneau && my.current_panneau.desactivate()
  }

  //
  //  FIN MÉTHODES PANNEAUX
  // ---------------------------------------------------------------------


  /**
  * Place les observers pour les contenus éditables
  **/
  observeEditableFields ()
  {
    let
        editables = document.getElementsByClassName('editable')
      , len       = editables.length
      , i         = 0
      , my        = this
    for(;i<len;++i){
      editables[i].addEventListener('click', (evt) => {
        let o = evt.target
        o.contentEditable = 'true'
        o.focus()
        this.mode_edition = true
      })
      editables[i].addEventListener('blur', (evt) => {
        let o = evt.target
        my.onChangeData.bind(my)(o)
        o.contentEditable = 'false'
        this.mode_edition = false
      })
    }
  }

  /**
  * Méthode qui prépare l'interface et le programme en fonction des options
  * choisies par l'auteur. Par exemple, c'est cette méthode qui met en route
  * la sauvegarde automatique si nécessaire.
  **/
  prepareSuivantOptions ()
  {
    console.log('-> Projet#prepareSuivantOptions')
    if ( this.option('autosave') )
    {
      console.log('   * activation de l’autosave')
      this.options.activateAutosave()
    }
    console.log('<- Projet#prepareSuivantOptions')
  }

  /**
   * Méthode appelée quand la sauvegarde automatique est enclenchée
   */
  doAutosave () {
    if ( this.mode_edition || this.busy ) { return false }
    this.checkModifiedState()
    this.modified && this.saveAll()
    return true
  }
  /**
  * Sauve tout
  * ----------
  * Pour le moment, ça ne sauve que les panneaux et les relatives.
  *
  * Noter que l'appel de la sauvegarde des relatives et le check du nouvel
  * état du projet est inutile puisque ces deux méthodes sont appelées à
  * chaque sauvegarde de panneau. Et ici, normalement, il ne doit pas y
  * avoir plus de deux panneaux modifiés en même temps, en tout cas en
  * mode de sauvegarde automatique.
  **/
  saveAll ( callback )
  {
    const my = this

    // console.log("-> <#Projet %s>#saveAll()")

    my.saving = true
    my.saved  = false

    /*- Sauvegarde des données du projet (synchrone) -*/

    // my.saveData()
    // console.log("Après saveData")

    /*- Sauvegarde de tous les panneaux modifiés -*/

    my.saveEachPanneau( () => {

      // console.log("callback de la sauvegarde des panneaux.")

      /*- Sauvegarde de tous les parags -*/

      this.saveParags( () => {

        // console.log("Callback de la sauvegarde des paragraphes.")

        my.saving = false
        my.saved  = true

        callback && callback.call()

      })

    })

    // console.log("<- <#Projet %s>#saveAll()")

  }

  saveData ()
  {
    const my = this

    my.store_data.save(true)
  }

  saveEachPanneau ( callback )
  {
    const my = this
    let pano = null

    if ( undefined === my.panneaux2save )
    {
      my.panneaux2save = []
      Projet.PANNEAU_LIST.forEach( (pan_id) => {
        my.panneau(pan_id)._modified && my.panneaux2save.push( my.panneau(pan_id) )
      })
    }

    if ( pano = my.panneaux2save.shift() )
    {

      /*- On sauve le panneau -*/

      pano.save.bind(pano, my.saveEachPanneau.bind(my, callback) )

    }
    else
    {

      /*= Tous les panneaux modifiés ont été enregistrés =*/

      callback && callback.call()

    }

  }


  /** ---------------------------------------------------------------------
    *
    *     NOUVELLES MÉTHODES D'ENREGISTREMENT ET DE SAUVEGARDE
    *
    *
    *     Cf. le fichier Sauvegarde_length_fixe.md pour le détail
    *
  *** --------------------------------------------------------------------- */

  saveParags (callback )
  {
    this.writeParags(undefined, callback)
  }
  /**
  * Main méthode appelée pour sauver les paragraphes dans le fichier de
  * données des paragraphes.
  * La méthode prend soit la liste +parag_list+ soit relève tous les paragraphes
  * qui ont été modifiés.
  *
  * Après l'enregistrement, la méthode +callback+, si elle est spécifiée,
  * est appelée.
  **/
  writeParags (parag_list, callback)
  {
    const my = this
    my.saving = true
    my.saved  = false
    my.saved_parags_count = 0

    if ( ! parag_list )
    {
      my.defineListeParagsToSave()
    }
    else
    {
      my.liste_parags_to_save = parag_list
    }
    // console.log("Liste des paragraphes à sauver", this.liste_parags_to_save)

    my.methode_after_saving = callback // même si non défini

    const openFlag = fs.existsSync(my.parags_file_path) ? 'r+' : 'w'

    fs.open(my.parags_file_path, openFlag, (err, filedescriptor) => {
      if ( err ) {
        console.log("Une erreur est survenue, je dois renoncer à l'enregistrement :", err)
        throw err
      }
      my.writeNextParag(filedescriptor)
    })

  }
  /**
  * Méthode de boucle qui procède à l'écriture du paragraphe courant de la
  * liste this.liste_parags_to_save, soit en termine avec l'enregistrement
  *
  **/
  writeNextParag (fd)
  {
    const my = this
    let iparag = my.liste_parags_to_save.shift()
    if ( undefined !== iparag )
    {
      if ('number' === typeof iparag) { iparag = Parags.get(iparag) }
      my.writeParag(fd, iparag)
    }
    else
    {
      // console.log("=== Tous les paragraphes ont été sauvés. ===")

      /*- On appelle le callback -*/

      my.methode_after_saving && my.methode_after_saving.call()
    }
  }


  writeParag( fd, iparag )
  {
    const my = this
    fs.write(fd, iparag.data_infile, iparag.startPos, 'utf8', (err, sizew, writen) => {
      if (err){ throw err }
      iparag.modified = false
      my.saved_parags_count += 1
      // console.log("Longueur copiée dans le fichier", sizew)
      // On passe au paragraphe suivant
      my.writeNextParag(fd)
    })
  }

  /**
  * Méthode qui place dans this.liste_parags_to_save et @return la liste
  * des paragraphes à sauver, c'est-à-dire ceux qui ont été modifiés.
  **/
  defineListeParagsToSave ()
  {
    // let arr = this.items.filter( p => { return p._modified === true })
    const my = this
    let arr = []
      , p, pid
    for ( pid = 0 ; pid <= Parag._lastID ; ++pid )
    {
      if ( p = Parags.get(pid) )
      {
        if ( p._modified === true ) { arr.push( p ) }
      }
    }
    my.liste_parags_to_save = arr
    return arr
  }

  // ---------------------------------------------------------------------
  //  MÉTHODES DE LECTURE DES PARAGRAPHES

  /**
  * Méthode principale qui charge la liste des parags définis dans
  * +ids+, en fait des instances ou les renseigne en lisant le fichier
  * de données, puis appelle la méthode +callback+
  *
  * @param {Array} ids Liste des identifiants à charger (ou un seul)
  * @param {Function} callback  La méthode à appeler à la fin.
  **/
  readParags ( ids, callback )
  {
    // console.log('-> Projet#readParags')
    const my = this

    my.loading = true
    my.loaded  = false

    if ('number' === typeof ids) { ids = [ids]}
    my.list_parags_to_read  = ids
    my.after_reading_parags = callback
    fs.open(my.parags_file_path, 'r', (err, fd) => {
      if ( err ) { throw err }
      my.readNextParag(fd)
    })
  }

  /**
  * Méthode fonctionnelle, utilisée par `readParags` ci-dessus, qui lit
  * un paragraphe dans le fichier de données et le parse.
  **/
  readNextParag (fd)
  {
    const my = this
    let parag_id = my.list_parags_to_read.shift()
    if ( undefined !== parag_id )
    {
      my.readParag( fd, parag_id )
    }
    else
    {
      // console.log("J'ai fini de lire les paragraphes, je peux continuer.")
      my.loading = false
      my.loaded  = true   // sauf si erreur
      if ( 'function' === typeof my.after_reading_parags )
      {
        my.after_reading_parags.call()
      }
    }
  }

  /**
  * Lit les données du paragraphe dans le fichier de données
  *
  * La méthode appelle ensuite la méthode qui parse la donnée pour en
  * faire une vraie instance Parag
  *
  * NOTE Doit devenir OBSOLÈTE avec l'utilisation des Promises
  * (cf. Parag#PRload)
  **/
  readParag (fd, pid)
  {
    const my = this
    let startPos = pid * Parag.dataLengthInFile
    let buffer   = new Buffer(Parag.dataLengthInFile)
    fs.read(fd, buffer, 0, Parag.dataLengthInFile, startPos, (err, bsize, buf) => {
      if ( err ) { throw err }
      my.parseParag(fd, pid, buf.toString() )
    })
  }
  parseParag( fd, pid, rawdata )
  {
    const my = this
    let parag = Parags.get(pid)
    parag || ( parag = new Parag({id: pid}) )
    parag.parse_data_infile( rawdata )
    // On peut poursuivre en s'occupant du paragraphe suivant, ou en
    // poursuivant avec la méthode de callback
    my.readNextParag(fd)
  }

  /**
  * Méthode appelée quand on change de donnée par l'interface
  **/
  onChangeData (o)
  {
    let
          prop = o.id // par exemple 'authors' ou 'title'
        , newValue = o.innerHTML.replace(/<br>/,"\n").trim()

    // Traitement des valeurs pour certains champs spéciaux
    switch(prop)
    {
      case 'authors':
        newValue = newValue.split(/[ ,]/).map(p =>{return p.trim()}).filter(p => {return p != ''})
        break
    }
    // On enregistre la donnée et on l'actualise dans l'affichage
    let d2u = { updated_at: moment().format() }
    d2u[prop] = newValue
    this.store_data.set(d2u)
    this[`set_${prop}`]()
    this.set_updated_at()
  }

  /**
  * @return {Relatives} L'instance gérant les relatives du projet
  * Les relatives, ce sont les relations entre les différents parags entre
  * les différents panneaux. Par exemple, ce sont les relatives qui permettent
  * de savoir que tels paragraphes du scénier correspondent à tel paragraphe
  * du synopsis
  **/
  get relatives ()
  {
    this._relatives || ( this._relatives = new Relatives(this) )
    return this._relatives
  }
  get options ()
  {
    this._options || ( this._options = new ProjetOptions(this) )
    return this._options
  }
  get ui ()
  {
    this._ui || ( this._ui = new ProjetUI(this) )
    return this._ui
  }
  // ----------------- OPTIONS ---------------------

  /**
  * Raccourci servant au tabulator (car on ne peut pas utiliser `projet.options`
  * dans le départ)
  **/
  define_options ( arg ) { this.options.define( arg ) }

  option ( prop, value )
  {
    if ( 'string' == typeof prop )
    {
      if ( undefined === value ) { return this.options.get(prop) }
      else {
        let h = {} ; h[prop] = value ; this.options.set(h)
      }
    }
    else if ( 'object' == typeof prop )
    {
      this.options.set(prop)
    }
    else
    {
      throw new Error('Mauvais argument pour projet#option')
    }
  }

  /**
  * Méthode qui enregistre et affiche le titre. Si @new_title est défini, elle
  * enregistre le nouveau titre. Sinon, elle l'affiche (dans la barre de titre et
  * dans le document)
  *
  * Noter que le nom de ces méthodes ne doivent pas être modifiée, car elles
  * sont appelées de façon dynamique en construisant "set_<propriété>"
  *
  **/
  set_title (v) {
    this.title = v
    DOM.setTitle(v)
    DOM.inner('title', v)
  }
  set_authors (v) {
    this.authors = v
    DOM.inner('authors', v.join(', '))
  }
  set_summary (v) {
    this.summary = v
    DOM.inner('summary', v.split("\n").join('<br>'))
  }
  set_created_at(){
    let c = moment(this.created_at)
    DOM.inner('created_at', `${c.format('LLL')} (${c.fromNow()})`)
  }
  set_updated_at(){
    let c = moment(this.updated_at)
    DOM.inner('updated_at', `${c.format('LLL')} (${c.fromNow()})`)
  }

  // Les différents stores du projet
  get store_data        () {
    if(!this.id){throw new Error("Impossible de récupérer le fichier data : id est indéfini")}
    return new Store(`projets/${this.id}/data`)
  }

  /**
  * @return {String} Le path du fichier TEXT contenant tous les paragraphes
  * en longueur fixe.
  **/
  get parags_file_path ()
  {
    this._parags_file_path || (this._parags_file_path = path.join(Store.user_data_folder,'projets',this.id,'PARAGS.txt'))
    return this._parags_file_path
  }

  /**
  * @return {String} Le dossier du projet dans les librairies.
  * Normalement, on ne doit pas y avoir accès, mais pour des raisons de
  * programmation, on permet de l'ouvrir avec une commande.
  **/
  get folder ()
  {
    this._folder || ( this._folder = this.store_data.folder )
    return this._folder
  }

  // Les données remontées des différents stores
  get data_generales    () { return this.store_data.data }

  get title       (){ return this.data_generales.title  || "Projet sans titre" }
  get authors     (){ return this.data_generales.authors || [] }
  get summary     (){ return this.data_generales.summary || '[Résumé à définir]'}
  get created_at  (){ return this.data_generales.created_at}
  get updated_at  (){ return this.data_generales.updated_at}

}// fin class Projet

module.exports = Projet
