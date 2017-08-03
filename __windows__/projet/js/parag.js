
class DataValidityError extends Error {
  constructor(message) {
    super ( message )
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

/** ---------------------------------------------------------------------
  *   Parag (classe)
  *   --------------
  *   Classe des textes en tant qu'entité {Parag}
  *   Dans l'application, tous les textes des projets sont des Parag(s),
  *   que ce soit un paragraphe de synopsis ou un évènement du scénier.
  *
  *   Despite its name, a <Parag> can own several real paragraphs.
  *
*** --------------------------------------------------------------------- */
let Kramdown    = require(path.resolve(path.join('.','lib','utils','kramdown_class.js')))

class Parag
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
  * Définition des DATA du PARAG telles qu'elles seront enregistrées dans
  * le fichier PARAGS.txt à longueur fixe.
  *
  * Ce fichier permet d'atteindre n'importe quel paragraphe en connaissant
  * sont ID.
  **/
  static get DATA ()
  {
    this.__data || (
      this.__data = {
        // length: Longueur de la donnée dans le fichier
        // Types
        // -----
        // n: number, s:string, u:unicode, b:boolean
        //
        // Le type 'e' suit le type 'd', date, mais seulement YYMMJJ
        //
          'id'          : {length: 8  , type: 'n' }
        , 'panneau_let' : {length: 1  , type: 's', default: 'n'     }
        , 'ucontents'   : {length: 512, type: 's', default: ''      }
        , 'duration'    : {length: 4  , type: 'n', default: 60      }
        , 'created_at'  : {length: 6  , type: 'e', default: moment().format('YYMMDD') }
        , 'updated_at'  : {length: 6  , type: 'e', default: moment().format('YYMMDD')  }
        , 'position'    : {length: 6  , type: 'n', default: null    }
        , 'type'        : {length: 4  , type: 's', default: '0000'  }
        , 'brins_ids'   : {length: 16 , type: 's', default: ''      }
        // Les nouvelles données doivent obligatoirement être ajoutées après et il
        // faut retirer la longueur à 'vide' ci-dessous pour ne pas avoir à tout
        // recalculer
        , 'vide'        : {length: 68 , type: 's', default: ''}
      }
    )
    return this.__data
  }

  /**
  * Retourne la longueur exacte d'une donnée de paragraphe dans le fichier
  * de tous les paragraphes en la calculant par rapport à Parag.DATA
  *
  * (1) Les 2 retours chariot à la fin de la donnée
  **/
  static get dataLengthInFile ()
  {
    if ( undefined === this._dataLengthInFile )
    {
      let n = 0, p
      for(p in this.DATA){ n += this.DATA[p].length + 1 }
      this._dataLengthInFile = n + 2 // (1)
    }
    return this._dataLengthInFile
  }

  /**
  * @return {Number} Un nouvel identifiant pour un paragraphe. C'est un ID
  * absolu et universel qui doit être fourni, unique à tous les panneaux
  * confondus.
  *
  * Il est enregistré dans la propriété last_parag_id des données
  * générales du projet.
  **/
  static newID ()
  {
    const curProjet = Projet.current

    // console.log("-> Parag.newID", this._lastID)
    if( undefined === this._lastID) { this._lastID = curProjet.data.last_parag_id }
    ++ this._lastID
    // On enregistre toujours le nouveau dernier ID dans les données
    // du projet
    curProjet.data.last_parag_id = this._lastID
    curProjet.data.save()

    /* Retourne le nouvel ID après l'avoir enregistré */

    return this._lastID
  }






  /** ---------------------------------------------------------------------
    *
    *   INSTANCE Parag
    *
  *** --------------------------------------------------------------------- */


  /**
  * Instanciation d'un Parag
  *
  * @param {Object} data  Données du Parag, complètes ou incomplètes.
  *     Doit obligatoirement définir `id`
  *     Peut ensuite définir toutes les propriétés propres voulues.
  *
  * (1) L'identifiant doit toujours exister à l'instanciation.
  *
  * (2) Dans tous les cas, l'instance est ajoutée à Parags.items qui permettra
  *     de récupérer le Parag par `Parags.get(<parag id>)` sans précision de
  *     panneau.
  **/
  constructor (data)
  {

    this.id     = data.id // (1)
    this.projet = Projet.current
    for(let p in data){if(data.hasOwnProperty(p)){this[p] = data[p]}}
    Parags.add(this) // (2)

  }

  /* - public - */

  /**
  * Sauve le parag dans le fichier à longueurs fixes.
  *
  * @return {Promise} Pour le chainage
  **/
  save ()
  {
    const my        = this
    const openFlag  = fs.existsSync(my.parags_file_path) ? 'r+' : 'w'

    if ( my.dataAreValid() )
    {
      return new Promise( (ok, ko) => {
          fs.open(my.parags_file_path, openFlag, (err, fd) => {
            if ( err ) throw err
            fs.write(fd, my.data_infile, my.startPos, 'utf8', (err, sizew, writen) => {
              if (err) { ko(err) }
              else {
                my.modified = false
                ok()
              }
            })
          })
      })
    }
    else
    {
      // <= Les données sont invalides
      // => On n'enregistre pas la donnée et on ajoute un message
      //    d'erreur au rapport
      my.projet.savingReporter.push({type:'error', message: `Le parag #${my.id} n'a pas pu être enregistré : ${my.savingError}`})
      return Promise.resolve()
    }

  }

  /**
  * @return {String} Le path du fichier texte contenant tous les paragraphes
  * en longueur fixe (appartient à tout le projet).
  *
  **/
  get parags_file_path () { return Projet.current.parags_file_path }

  /** ---------------------------------------------------------------------
    *
    * STATE Methods
    *
  *** --------------------------------------------------------------------- */

  /**
  * Indique l'état du parag. Cette donnée est capitale puisque c'est elle
  * qui déterminera si le Parag est à sauver ou non.
  *
  * Si le Parag est mis à "modifié", le panneau aussi, ce qui par cascade
  * mettra aussi le projet à "modifié"
  **/
  get modified () { return this._modified || false }
  set modified (v){
    this._modified = v
    this._modified && this.panneau && ( this.panneau.modified = true )
  }



  /**
  * Test la validité des données avant l'enregistrement et
  * produit l'erreur savingError ({String} contenant le message d'erreur) en
  * cas d'erreur
  **/
  dataAreValid ()
  {
    // DataValidityError
    const my    = this
    const dData = Parag.DATA

    try
    {
      if ( 'number' != typeof my.id ){
        throw new DataValidityError('L’ID devrait être un nombre.')
      }
      if ( String(my.id).length > dData.id.length ) {
        throw new DataValidityError(`L’ID ${my.id} est trop grand.`)
      }

      /*- Le texte unicode ne doit pas être plus long que prévu -*/

      if ( my.ucontents.length > dData['ucontents'].length )
      {
        throw new DataValidityError("Le texte est trop long.")
      }

      if ( 'string' != typeof(my.panneau_let)){
        throw new DataValidityError('La lettre du panneau devrait être un string')
      }
      if ( my.panneau_let.length != 1 ){
        throw new DataValidityError('La lettre du panneau devrait ne faire qu’une seule lettre')
      }

      if ( 'number' != typeof my.duration ) {
        throw new DataValidityError(`La durée devrait être un nombre. Or, ${my.duration} est un ${typeof my.duration}`)
      }
      if ( String(my.duration).length > dData.duration.length ) {
        throw new DataValidityError(`La durée ${my.duration} est trop longue (${dData.duration.length} caractères max attendus)`)
      }

      if ( String(my.position).length > dData.position.length ) {
        throw new DataValidityError(`La position ${my.position} est trop longue (max chiffres : ${dData.position.length})`)
      }

      if ( my.type.length != 4 ) {
        throw new DataValidityError(`Le type ${my.type} devrait faire exactement 4 caractères`)
      }

      if ( my.brins_ids.length > dData.brins_ids.length ) {
        throw new DataValidityError(`La donnée brins (brins_ids) est trop longue. Elle ne devrait pas excéder ${dData.brins_ids.length} caractères`)
      }

      /*- Tout est OK -*/

      return true

    }
    catch(err)
    {
      if ( 'DataValidityError' == err.name ) {
        my.savingError = `${err.message}.`
        return false
      } else {
        throw err
      }
    }
  }
  /** ---------------------------------------------------------------------
  *
  *   DATA Methods
  *
  * --------------------------------------------------------------------- */

  /** ---------------------------------------------------------------------
  * Les propriétés enregistrées dans le fichier PARAGS.txt
  *
  * Toutes ces propriétés doivent être définies dans Parag.DATA (cf. plus haut)
  * pour savoir comment les enregistrer dans le fichier de data à longueur fixe.
  *
  * (1) C'est ma propre méthode String (dans lib/utils/String)
  *
  **/
  get ucontents   () {
    this._ucontents || (this._ucontents = this.contents.toUnicode()) // (1)
    return this._ucontents
  }
  set ucontents (v){
    this._ucontents = v
    v = v.replace(/\n/g, '[[RC]]')
    v = JSON.parse(`"${v.trim()}"`)
    v = v.replace(/\[\[RC\]\]/g,"\n")
    this._contents  = v
  }
  get panneau_let ()  {
    if (undefined === this._panneau_let && this.panneau_id )
    {
      this._panneau_let = PanProjet.oneLetterOf(this.panneau_id)
    }
    return this._panneau_let
  }

  set panneau_let (v) {
    this._panneau_let = v
    this._panneau_id = Projet.PANNEAUX_DATA[v]
  }

  get duration    ()  { return this._duration   || 60 }
  get position    ()  { return this._position   || -1 }
  get type        ()  { return this._type       || '0000' }
  get brins_ids   ()  { return this._brins_ids  || ''    }
  get updated_at  ()  { return this._updated_at   }
  get created_at  ()  { return this._created_at   }

  set duration    (v) { this._duration = v    }
  set position    (v) {
    if ( v == '-1' || v == 'auto' ){ this._position = -1 }
    else { this._position = v }
  }
  set type        (v) { this._type = v        }
  set brins_ids   (v) { this._brins_ids = v   }
  set updated_at  (v) { this._updated_at = v  }
  set created_at  (v) { this._created_at = v  }


  /** ---------------------------------------------------------------------
  * Les propriétés volatiles
  **/
  /**
  * Le contenu textuel du Parag. Il est transformé en Unicode pour être
  * enregistré et est décodé dans cette propriété qui permet de l'afficher
  * lorsqu'on édite le Parag.
  *
  *       ucontents   <----- contents -----> contentsFormated
  *
  *     Enregistrement        Édition         Affichage dans les
  *     dans le fichier.                      panneaux.
  *
  **/
  get contents    ()  { return this._contents    }
  set contents    (v) {
    v && ( v = v.replace(/\n/g,'<br>') )
    this._contents = v ; this.reset()
  }
  get panneau_id  ()  { return this._panneau_id   }
  set panneau_id  (v) { this._panneau_id = v      }

  get loaded () {
    (undefined === this._loaded) && ( this._loaded = 'string' == typeof(this.contents) )
    return this._loaded
  }




  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES GÉNÉRALES
    *
  *** --------------------------------------------------------------------- */

  /**
  * Méthode qui charge le paragraphe si nécessaire et retourne une promesse.
  *
  * Si le paragraphe est déjà chargé, on retourne tout de suite le résultat,
  * sinon on utilise une promesse pour le charger.
  *
  * @return {Promise}
  **/
  PRload ()
  {
    const my = this

    if ( my.loaded )
    {
      return Promise.resolve()
    }
    else
    {
      return my.PRloadInFile()
        .then(my.PRparse.bind(my))
        .catch((err) => { throw err })
    }
  }

  /**
  * Méthode affichant le parag dans son panneau et retournant une promesse
  *
  * NOTE Pour le moment, on en fait une méthode synchrone (dans un cycle de
  * méthode asynchrone) mais ensuite on pourra imaginer que le paragraphe
  * sera entièrement construit par ce biais, et donc qu'il faudra charger
  * d'autres parags pour compléter l'affichage.
  *
  * @return {Promise}
  *
  **/
  PRdisplay ()
  {
    const my = this
    my.panneau.container.appendChild( my.mainDiv )
    return Promise.resolve()
  }

  PRloadInFile ()
  {
    const my = this
    return new Promise( (ok, notok) => {
      let startPos = my.id * Parag.dataLengthInFile
      let buffer   = new Buffer(Parag.dataLengthInFile)
      fs.open(my.projet.parags_file_path, 'r', (err, fd) => {
        fs.read(fd, buffer, 0, Parag.dataLengthInFile, startPos, (err, bsize, buf) => {
          if ( err ) { throw err }
          ok( buf.toString() )
        })
      })
    })
  }

  PRparse ( code )
  {
    this.parse_data_infile( code )
    return Promise.resolve()
  }

  /**
  * Méthode qui initialise tout pour forcer le recalcul des valeurs,
  * après une modification.
  *
  * Il faut maintenant utiliser la méthode `update` pour actualiser le
  * Parag dans l'affichage.
  **/
  reset ()
  {
    const my = this
    delete my._ucontents
    delete my._contents_formated
    delete my._contents_simple
    delete my._duration_formated
    delete my._loaded
    delete my._relatives
    delete my._relatifs

    // delete my.sync_after_save
    // Ne surtout pas mettre ça ici, car s'il est mis à true au cours du
    // programme, une méthode quelconque (par exemple `contents=`) pourrait
    // remettre cette valeur à undefined. Ce type de reset doit être effectué
    // là où il n'agit plus (en l'occurrence, après la synchronisation)

    my.formated = false
  }

  /**
  * Actualise le paragraphe dans l'affichage, s'il est modifié et que
  * son panneau est le panneau courant.
  **/
  update ()
  {
    const my = this
    my.reset()
    my.panneau && my.panneau.isCurrent() && my.updateDisplay()
  }

  /**
  * Méthode affichant le parag dans son panneau.
  *
  * C'est la méthode principale.
  **/
  display (callback)
  {
    const my = this
    console.log("<#Parag %d>#display()", my.id)
    if ( ! my.displayed )
    {
      my.panneau.container.appendChild(my.mainDiv)
      my.displayed = true
    }
    callback && callback.call()
  }

  PRsync ()
  {
    const my = this

    my.projet.busy = true
    // Il faut indiquer au projet qu'on est occupé pour qu'aucune
    // sauvegarde ne se fasse pendant ce temps

    /*- Liste pour synchroniser tous les parags -*/

    my.parags2sync_list = [my]

    /*- On procède à la synchronisation -*/

    return my.PRloadAllPanneaux()
      .then( my.PRsyncAllPanneaux.bind(my) )
      .then( my.PRendSync.bind(my) )
      .catch( err => { my.projet.busy = false ; throw err } )

  }

  /**
  * Méthode chargeant les données de tous les panneaux
  *
  * @return {Promise} pour chainage
  **/
  PRloadAllPanneaux ()
  {
    const my = this
    return Promise.all( my.allPanneauxButMine.map( panid => {
      return Projet.current.panneau(panid).PRloadData()
    }))
  }

  /**
  * Méthode synchronisant tous les panneau sauf le panneau courant
  *
  * @return {Promise} Pour le chainage
  **/
  PRsyncAllPanneaux ()
  {
    const my = this
    return Promise.all( my.allPanneauxButMine.map( panid => {
      return my.PRsyncInPanneau.bind(my, panid).call()
    }))
  }

  /**
  * Pour terminer la synchronisation
  *
  * @return {Promise} Pour le chainage
  **/
  PRendSync ()
  {
    const my = this
    my.projet.busy = false

    /*- Associer les différents parags créés -*/

    my.projet.relatives.associateWithNoReferent(my.parags2sync_list)

    my.reset()
    delete my.sync_after_save
    // surtout pas dans my.reset (voir l'explication dans my.reset())

    return Promise.resolve()
  }

  /**
  * @return {Array} Une liste de tous les IDENTIFIANTS des panneaux
  * synchronisables à part celui du parag courant.
  **/
  get allPanneauxButMine ()
  {
    if ( undefined === this._allPanneauxButMine )
    {
      const thispanId = this.panneau_id
      this._allPanneauxButMine =
        Projet.PANNEAUX_SYNC.filter(panid => {return panid != thispanId})
    }
    return this._allPanneauxButMine
  }
  /** ---------------------------------------------------------------------
    *
    *   Méthodes d'I/O permettant d'enregistrer les données paragraphe
    *   dans le fichier à longueur unique puis de les parser en retour.
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {String} La donnée à enregistrer dans le fichier de données
  **/
  get data_infile ()
  {
    let d = '', p
    for(let p in Parag.DATA) { d += this.xBytesData(p) }
    return d + "\n\n"
  }

  /**
  * Méthode qui récupère la valeur brute de la donnée dans le fichier à
  * longueur fixe et qui la parse pour renseigner toutes les données du
  * paragraphe.
  **/
  parse_data_infile ( datainfile )
  {
    // console.log('-> Parag#parse_data_infile')
    const my = this
    my.reading = false
    let prop, dProp, len, val, typ
    let pos = 0
    for(prop in Parag.DATA)
    {
      dProp = Parag.DATA[prop]
      len = dProp.length
      typ = datainfile.substr(pos, 1)
      val = datainfile.substr(pos+1, len).trim()
      // console.log('prop %s len %d type %s valeur %s', prop, len, typ, val)
      pos += len + 1
      // Transformation de la valeur
      switch(typ)
      {
        case 'e': // date YYMMDD
          val = val
          break
        case 'n':
          val = Number(val.trim())
          break
        case 'b':
          val = val == '1' ? true : false
      }
      // console.log("Prop '_%s' mise à %s", prop, val)
      this[`_${prop}`] = val

      // console.log(`Propriété '${prop}' mise à `, this[prop])
    }
    // Traitement spécial de la valeur contents, dont les caractères
    // spéciaux ont été transformés en caractères unicode
    this.ucontents = this._ucontents // pour forcer this.contents

    this.parsed = true

    if ( 'function' == typeof this.after_read_callback )
    {
      this.after_read_callback.call()
    }
  }

  /**
  * @property Pointer du paragraphe dans le fichier contenant tous les
  * paragraphes.
  **/
  get startPos ()
  {
    this._startPos || ( this._startPos = this.id * Parag.dataLengthInFile )
    return this._startPos
  }

  /** ---------------------------------------------------------------------
    *
    * / Fin des méthode pour le fichier à longueur unique
    *
  *** --------------------------------------------------------------------- */

  /**
  * Cette méthode actualise l'affichage du paragraphe s'il existe dans son
  * conteneur.
  **/
  updateDisplay ()
  {
    if ( this.panneau && this.panneau.isCurrent() && this.divContents )
    {
      // console.log(`Parag#${this.id} -> updateDisplay()`)
      this.divContents.innerHTML = ''
      this.divContents.innerHTML = this.contentsFormated
    }
    else { return false }
  }
  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES DE FORMATAGE (HELPERS)
    *
  *** --------------------------------------------------------------------- */

  /**
  * Le texte tel qu'il doit être affiché dans la page
  *
  **/
  get contentsFormated ( ) {
    // console.log(`Parag#${this.id} -> contentsFormated()`)
    if ( !this._contents_formated )
    {
      if ( !this.formated )
      {
        this.formateContents() /* peut être asynchrone */
      }
      else
      {
        this._contents_formated = `[Parag#${this.id} mal formaté]`
      }
    }
    return this._contents_formated
  }

  /**
  * @property {String} Le contenu sans balises ni retours chariots ni
  * tabulation, pour affichage en tant que title d'un lien.
  **/
  get contentsSimple () {
    this._contents_simple || (
      this._contents_simple =
          (this.contentsFormated || '')
            .replace(/[\n\r]/g,' ')
            .replace(/\t/g, ' ')
            .replace(/<(.*?)>/g, '')
            .replace(/"/g, "\\\"")
            .replace(/  +/g, ' ') // deux espaces ou + remplacé par une espace
            .trim()
    )
    return this._contents_simple
  }


  /**
  * @return {String} Le parag comme lien qui doit remplacer la balise
  *                   PARAG#<this id>
  *
  * @param {Object} options   Des options de formatage
  *       options.titre     Le titre à donner au lien
  *                         Le titre par défaut est "#<this id>"
  *
  *
  **/
  as_link (options) {
    if (options)
    {
      options.titre || ( options.titre = `#${this.id}` )
      options.title || ( options.title = this.contentsSimple )
      return this.buildLinkWith(options)
    }
    else
    {
      this._as_link || (
        this._as_link = this.buildLinkWith({titre:`#${this.id}`,title:this.contentsSimple})
      )
      return this._as_link
    }
  }
  /**
  * Méthode qui construit le lien
  *
  * @return {String} Le lien construit
  *
  * (1) Class CSS 'p-al' pour 'parag as link'
  *
  * (2) Quand le parag n'est pas encore chargé (mais que son instance
  *     existe), on met un texte provisoire pour dire qu'on est en train
  *     de le charger.
  *
  * (3) Le "p-<id>" permettra de remplacer tous les title des balises lorsque
  *     le parag sera chargé, s'il n'était pas chargé au moment de la
  *     construction du lien.
  *
  **/
  buildLinkWith ( data )
  {
    return  '<a href="#"'
          + ` onclick="return showParag(${this.id})"`
          + ` class="p-al p-${this.id}"` // (1) (3)
          + ` title="${data.title/* (2) */}">${data.titre}</a>`
  }

  /**
  * @property {String} La durée formatée
  **/
  get durationFormated () {
    if ( ! this._duration_formated ) {
      if( undefined === this.duration){
        this._duration_formated = '---'
      } else {
        this._duration_formated = Number[this.projet.option('dureepage')?'pages':'s2h'](this.duration)
      }
    }
    return this._duration_formated
  }

  /**
  * Méthode qui formate le contenu à afficher du paragraphe
  *
  * @return {String} Le contenu formaté
  * @produit this._contents_formated
  *
  **/
  formateContents ( callback )
  {
    const my = this

    // console.log(`Parag#${this.id} -> formateContents()`)
    if ( ! my.contents ) {
      if ( 'function' === typeof callback ) { callback.call() }
      return ''
    }
    let c = Kramdown.parse(my.contents)

    // === Les balises PARAG#xxx ===
    // Pour mettre la liste des paragraphes qui n'ont pas été trouvés
    // de côté.
    // Si le paragraphe existe (i.e. est déjà chargé), on met directement
    // son lien d'affichage, sinon, on conserve l'identifiant dans la liste
    // missing_parags_list pour le charger plus tard et on met en attendant
    // une marque __Pxxx__ à remplacer après le chargement des paragraphes.
    let missing_parags_list = []
      , p
    c = c.replace(/PARAG#([0-9]+)/g, (found, pid) => {
      p = Parags.get( Number(pid) )

      /*
       3 cas peuvent se produire ici :

        1.  Le parag est connu et chargé. C'est le cas simple, on inscrit
            simplement son lien.

        2.  Le parag n'est pas connu, p est undefined. Dans ce cas, on
            construit une instance provisoire, on inscrit un lien avec un
            title provisoire et on enregistre l'identifiant pour savoir qu'on
            devra chargé le parag après pour modifier le title provisoire (qui
            doit afficher le contents du parag)

        3.  Le parag est passé par le cas 2, donc une instance a été créé.
            Dans ce cas, on met le texte provisoire mais on n'enregistre pas
            le parag puisqu'il a déjà été enregistré pour chargement.
      */
      if ( undefined !== p )
      {

        if ( p.loaded )
        {
          /*  Le parag est chargé, on écrit son lien par défaut */

          return p.as_link()
        }
        else
        {
          /*  Cas 3 ci-dessus  */
          return p.as_link({title:'Chargement du contenu en cours…'})
        }

      }
      else
      {

        /*  Le parag n'est pas encore chargé, on met un contenu provisoire */

        missing_parags_list.push(pid)
        return (new Parag({id:pid})).as_link(
          {title: `Chargement du parag #${pid} en cours…`}
        )

      }
    })
    c = c.trim()
    my._contents_formated = c
    my.formated           = true

    if ( missing_parags_list.length > 0 )
    {

      // <= des paragraphes n'étaient pas chargés.
      // => Il faut charger ces paragraphes pour remplacer les titles dans
      //    les liens.

      my.loadAndReplaceTitleInLinks( missing_parags_list, callback )

    }
    else
    {
      if ( 'function' === typeof callback ) { callback.call() }
    }

  }

  /**
  *
  * @param  {Array} ids   Liste des identifiants des parags à charger et
  *                       traiter.
  * @param  {Function|Null} callback Méthode de callback
  *
  * Au cours du formatage du paragraphe (`formateContents`), certaines marques
  * de parags PARAG#<id> n'ont pas pu être remplacées par un lien complet
  * vers le parag correspondant car il n'était pas chargé.
  * Cette méthode va charger ces paragraphes et remplacer les `titles` dans
  * les liens, qui affichent le contenu du parag lié au survol de la souris.
  *
  **/
  loadAndReplaceTitleInLinks (pids, callback)
  {
    let p
    let promises = pids.map( pid => {
      p = Parags.get(pid)
      return p.PRload()
              .then(p.updateTitleInItsLink.bind(p, this))
              .catch( err => { throw err } )
    })
    return Promise.all(promises)
  }

  /**
  * Méthode qui remplace le `title` du lien du parag par son contenu
  * simple.
  * Cette méthode est utile lorsque le parag n'était pas encore chargé au
  * moment où un autre parag contenait un lien vers lui.
  *
  * @param {Parag} destParag  Le Parag qui possède le lien vers le parag
  *                           courant.
  **/
  updateTitleInItsLink (destParag)
  {
    const my = this // le parag lié (courant)
    const pan = destParag.panneau

    /*- Correction dans le panneau -*/

    let as = pan.container.querySelectorAll(`a.p-${my.id}`)
    as.forEach( a => a.setAttribute('title', my.contentsSimple) )

    /*- Correction dans le texte formaté du destinataire -*/

    let re = new RegExp(`title="Chargement du parag #${my.id} en cours…"`, 'g')
    destParag._contents_formated =
      destParag._contents_formated.replace(re, `title="${my.contentsSimple}"`)

    return Promise.resolve()
  }

  /** ---------------------------------------------------------------------
    *
    *     RELATIVES
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {Object} de {Parag}, la liste des relatifs du parag courant
  *         tels que définis dans les données Relatives du projet
  *         dans deux class 'as_referent' et 'as_relatifs' qui contiennent
  *         chacune une liste des référents ou des relatifs.
  *
  * @note Pour une version plus simple, cf. this.relatives qui est une simple
  *       Map contenant les parags associés avec en clé leur ID et en valeur
  *       leur instance Parag ou Null s'ils ne sont pas encore chargés.
  *       La méthode this.isRelativeOf(<id>) retourne true si les deux
  *       parags sont associés.
  **/
  get relatifs ()
  {
    if ( undefined === this._relatifs )
    {
      let drelatifs = this.data_relatives
      let arr = {as_referent: [], as_relatifs: []}
        , pan_arr
        , is_referent

      for ( let pan in drelatifs['r'] )
      {
        pan_arr = drelatifs['r'][pan]
        // On détermine si le parag courant est référent en déterminant le nombre
        // d'élément dans sa donnée panneau.
        // Par exemple, si la donnée "n" (notes) contient 2 identifiants, alors
        // on considère que le parag courant est référent et que ces deux
        // notes sont les relatifs purs
        is_referent = pan_arr.length > 1
        // On enregistre les relatifs dans la liste as_relatifs si le parag
        // est référent est dans la liste as_referent dans le cas contraire
        if ( is_referent )
        {
          pan_arr.forEach( pid => arr.as_relatifs.push(Parags.get(Number(pid))))
        }
        else
        {
          arr.as_referent.push(Parags.get(Number(pan_arr[0])))
        }
      }
      this._relatifs = arr
    }
    return this._relatifs
  }

  get data_relatives ()
    { return this.projet.relatives.all[String(this.id)] }

  set data_relatives (v) {
    this.projet.relatives.all[String(this.id)] = v
  }
  /**
  * Retourne l'index du paragraphe dans le panneau, s'il est chargé,
  * ou dans la liste des ids dans le cas contraire.
  **/
  get index ()
  {
    const my = this
    if ( my.panneau.loaded )
    {
      return Array.prototype.indexOf.call(my.panneau.container.childNodes, my.mainDiv)
    }
    else
    {
      return my.panneau.parags._ids.indexOf(my.id)
    }
  }

  /**
  * @return {Parag} le paragraphe qui suit le parag, ou nul s'il n'y en a pas
  *
  * Depuis que les parags ne sont pas chargés par défaut, il faut soit
  * utiliser le DOM soit utiliser la liste _ids de la liste des parags.
  **/
  get next ()
  {
    const pano = this.panneau
    if ( pano.loaded )
    {
      if (this.mainDiv.nextSibling){
        return pano.parags.instanceFromElement(this.mainDiv.nextSibling)
      }
    }
    else
    {
      let thisIndex = pano.parags._ids.indexOf(this.id)
      return Parags.get(pano.parags._ids[thisIndex + 1])
    }
  }
  /**
  * @return {Parag} le paragraphe qui précède le paragraphe courant
  *                 ou nul s'il n'y en a pas
  **/
  get previous ()
  {
    const pano = this.panneau

    if ( pano.loaded )
    {
      if (this.mainDiv.previousSibling){
        return pano.parags.instanceFromElement(this.mainDiv.previousSibling)
      }
    }
    else
    {
      let thisIndex = pano.parags._ids.indexOf(this.id)
      return Parags.get(pano.parags._ids[thisIndex - 1])
    }
  }

  /**
  * Méthode appelée pour éditer le parag
  **/
  edit ()
  {
    this.doEdit.bind(this)()
  }

  // syncAllPanneaux( callback )
  // {
  //   // console.log('-> syncAllPanneaux')
  //   const my      = this
  //       , proj    = my.projet
  //
  //   let pan_id  = null
  //
  //   // - index du panneau à synchroniser -
  //
  //   my.i_panneau_sync || ( my.i_panneau_sync = 0 )
  //
  //   pan_id = Projet.PANNEAUX_SYNC[my.i_panneau_sync++]
  //   if ( pan_id == my.panneau_id ) {
  //     pan_id = Projet.PANNEAUX_SYNC[my.i_panneau_sync++] }
  //
  //   if ( pan_id )
  //   {
  //     /*  Il reste des panneaux à traiter  */
  //
  //     // Note : les données seront effectivement chargées seulement
  //     //        si elles ne l'ont pas encore été.
  //
  //     proj.panneau(pan_id).loadData( my.syncInPanneau.bind(my, pan_id, callback) )
  //
  //   }
  //   else
  //   {
  //     //
  //     // On achève la synchronisation
  //     //
  //     // En enfin, on procède à l'association de tous les paragraphes
  //     // créés
  //     // puts(`Paragraphes à associer : ${this.parags2sync_list.map(p=>{return p.id})}`)
  //     // console.log("Fin de la synchronisation de tous les panneaux synchronisables.")
  //     proj.busy = false
  //     delete this.i_panneau_sync
  //
  //     if ( 'function' === typeof callback ) { callback.call() }
  //   }
  // }

  /**
  * Méthode qui synchronise le paragraphe courant dans le panneau pan_id
  *
  * @param {String} pan_id    Identifiant du panneau (p.e. 'scenier')
  *
  * (1) Les données du panneau ont été chargées dans la méthode appelante.
  *
  * Note
  **/
  PRsyncInPanneau ( pan_id )
  {
    // console.log("-> PRsyncInPanneau(%s)", pan_id)
    const my = this
    // console.log("[Parag#syncInPanneau] Début de synchronisation du parag#%d dans le panneau '%s'", this.id, pan_id)
    let newParagSync
      , pano
      , nombre_parags = my.panneau.parags.count
      , myindex       = my.index
      , ipar
      , iparag
      , paragAfter_id
      , paragAfter // le paragraphe avant lequel ajouter le parag synchronisé
      , optionsAdd

    // puts(`* ÉTUDE DU PANNEAU ${pan_id} *`)
    // Si le paragraphe courant est déjà en relation avec un paragraphe
    // du panneau +pan_id+, il n'y a rien à faire
    if ( my.firstRelativeInPanneau(pan_id) ) { return true }

    pano = my.projet.panneau(pan_id)

    paragAfter = undefined

    /*  On passe en revue les parags après le courant pour
        trouver un parag associé dans le panneau */

    for(ipar = myindex+1; ipar < nombre_parags ; ++ipar){
      iparag = my.panneau.parags.items[ipar] // (1)
      if ( null !== (paragAfter_id = iparag.firstRelativeInPanneau(pan_id)) )
      {
        paragAfter = Parags.get(Number(paragAfter_id))
        break
      }
    }

    /*  Si un parag après n'a pas été trouvé, on regarde si le parag juste
        avant est associé à un parag et on le prend si c'est le cas       */
    if ( !paragAfter
        && my.previous
        && (paragAfter_id = my.previous.lastRelativeInPanneau(pan_id))
    )
    {
      paragAfter = Parags.get( Number(paragAfter_id) ).next
    }

    /*  On ajoute le nouveau parag associé à son panneau */

    optionsAdd = {display: false, before: paragAfter || undefined }

    newParagSync = pano.parags.createNewParag({
          contents    : `[Relatif du paragraphe PARAG#${my.id}]`
        , duration    : my.duration
      }
      , optionsAdd
    )

    // console.log(`[syncInPanneau] Ajout du parag#${newParagSync.id} en synchro avec parag#${this.id} dans le panneau '${pan_id}'`)

    /*  Ajout du paragraphe à la liste des paragraphes qui seront associés
        quand on les aura tous créés. */

    my.parags2sync_list.push(newParagSync)
    // console.log("[syncInPanneau] Liste des parags à synchroniser", my.parags2sync_list.map(p=>{return p.id}))

    return Promise.resolve()
  }


  /**
  * @return {Number|Null} ID du premier parag associé au parag courant dans le
  *                       panneau +pan_id+
  * @param {String} pan_id  L'ID du panneau
  *
  **/
  firstRelativeInPanneau ( pan_id ) { return this.relInPan(pan_id,true) }

  /**
  * @return {Number|Null} ID du dernier parag associé au parag courant dans le
  *                       panneau +pan_id+
  * @param {String} pan_id  L'ID du panneau
  **/
  lastRelativeInPanneau ( pan_id ) { return this.relInPan(pan_id, false) }

  /**
  * Méthode appelée quand on blur le champ contents pour actualiser
  * le contenu du paragraphe **et que la valeur a changé**
  *
  * À la création du paragraphe, c'est cette méthode qui crée
  * les paragraphes synchronisés si le paragraphe a réellement
  * été créé (this.sync_after_save est alors à true).
  **/
  onChangeContents ()
  {
    const my = this
    // console.log('-> onChangeContents')
    my.contents = my.newContents

    /*- Marquer le parag (+ panneau + projet) modifié -*/

    my.modified = true

    /*- Synchronisation automatique -*/

    my.sync_after_save && my.PRsync.bind(my).call()

  }

  /** ---------------------------------------------------------------------
    * DOM Methods
  **/

  /**
  * @return {PanProjet} Le panneau courant, auquel appartient le paragraphe
  **/
  get panneau ()
  {
    this._panneau || (this._panneau = this.projet.panneau(this.panneau_id))
    return this._panneau
  }
  /**
  * @return {HTMLElement} Le container du paragraphe dans le panneau
  * C'est un raccourci de Projet.current_panneau.container.
  **/
  get container ()
  {
    this._container || ( this._container = this.panneau.container )
    return this._container
  }
  /**
  * @return {HTMLDivElement} Le div principal du Parag
  *
  * Note : le construit si nécessaire.
  **/
  get mainDiv ()
  {
    let o
    if ( ! this._main_div ){
      if (o = this.container.querySelector(`div#p-${this.id}`)) {
        this._main_div = o
      } else {
        this._main_div = this.build()
      }
    }
    return this._main_div
  }

  /**
  * @return {HTMLElement} Div du contenu textuel du paragraphe.
  **/
  get divContents ()
  {
    if (!this._div_contents)
    {this._div_contents=this.mainDiv.getElementsByClassName('p-recto')[0]}
    return this._div_contents
  }

  /**
  * Sélection du paragraphe courant.
  * Note : au moment de sa sélection, on le met également en courant
  * mais ce comportement pourra être révisé si c'est nécessaire.
  **/
  select ()
  {
    // console.log(`-> Parag.select #${this.id}`)
    DOM.addClass(this.mainDiv,'selected')
    this.selected = true
    // console.log(`<- Parag.select #${this.id}`)
    return this
  }
  deselect ()
  {
    // console.log(`-> Parag.deselect #${this.id}`)
    if ( this.relatifsExergued ) { this.unexergueRelatifs() }
    DOM.removeClass(this.mainDiv, 'selected')
    this.selected = false
    // console.log(`<- Parag.deselect #${this.id}`)
    return this
  }


  exergue (as_referent)
  {
    if ( this.exergued ) { return this }
    DOM.addClass(this.mainDiv, as_referent ? 'referent' : 'relatif')
    this.exergued = true
    return this
  }
  unexergue ()
  {
    if ( ! this.exergued ) { return this }
    DOM.removeClass(this.mainDiv, 'referent')
    DOM.removeClass(this.mainDiv, 'relatif')
    this.exergued = false
    return this
  }

  /* Private */

  /**
  * Ne jamais appeler directement
  **/
  setCurrent ()
  {
    DOM.addClass(this.mainDiv,'current')
    this.current = true
    return this
  }
  unsetCurrent ()
  {
    DOM.removeClass(this.mainDiv,'current')
    this.current = false
    return this
  }

  /**
  * Build Dom element for parag
  *
  * @return {HTMLDivElement} L'élément construit.
  **/
  build ()
  {

    let
          div_id    = `p-${this.id}`
        , div       = DOM.create('div', {class:'p', id: div_id, 'data-id':String(this.id)})
        , divCont   = DOM.create('div', {class:'p-recto',id:`${div_id}-recto`, 'enable-return': 'true', inner:this.contentsFormated})
        , divVerso  = DOM.create('div', {class:'p-verso hidden', id: `p-${this.id}-verso`})
    // Ajout du contenu textuel

    div.appendChild(divCont)
    div.appendChild(divVerso)
    this.observe_div(div)
    this.observe_contents(divCont)
    return div
  }

  /**
   * Méthode qui reconstruit le DIV du parag après certaines modifications
   * (par exemple le type)
   */
  rebuild ()
  {
    const my  = this
    my.desobserve_div()
    my.desobserve_contents()
    const div = my.build()
    my.panneau.container.replaceChild(my.build, DOM.get(`p-${this.id}`))
  }

  observe_div (div)
  {
    div || (div = this.mainDiv)
    div.addEventListener('click', this.onClick.bind(this))
  }
  desobserve_div ( div )
  {
    div || (div = this.mainDiv)
    div.removeEventListener('click', this.onClick.bind(this))
  }
  observe_contents (divCont)
  {
    const my = this
    divCont || (divCont = my.divContents)
    divCont.addEventListener('click', my.doEdit.bind(my))
    divCont.addEventListener('blur',  my.undoEdit.bind(my))
  }
  desobserve_contents (divCont)
  {
    const my = this
    divCont || (divCont = my.divContents)
    divCont.removeEventListener('click', this.doEdit.bind(my))
    divCont.removeEventListener('blur',  this.undoEdit.bind(my))
  }

  /**
  * Méthode appelée lorsque l'on clique sur le div principal
  * Pour le moment, ça n'agit que lorsque la touche Méta (CMD) est pressée,
  * pour ne pas rentrer en collision avec le clique sur le divContents qui
  * met le paragraphe en édition.
  **/
  onClick (evt)
  {
    if (evt.metaKey)
    {
      // CMD Click
      if ( this.projet.mode_double_panneaux )
      {
        // <= CMD Click mode double panneaux
        if ( this.selected ){
          this.deselect()
          this.unexergueRelatifs()
        }
        else {
          this.select()
          this.exergueRelatifs()
        }
      }
      return DOM.stopEvent(evt)
    }
  }

  // --- private ---

  /**
  * Méthode qui met en exergue tous les relatifs du paragraphe
  * Plus précisément, la méthode va regarder si le paragraphe est un relatif
  * ou un référent et mettre les paragraphes dans le style en fonction.
  * Le paragraphe est un référent s'il est seul dans la données de ses
  * relatif et il est relatif s'il n'est pas seul dans cette donnée.
  **/
  exergueRelatifs ()
  {
    // Il faut régler la classe du paragraphe cliqué en fonction
    // de son statut dans les doubles panneaux, referent ou relatif
    let statutDblPan = this.statutDoublePanneau
    if(statutDblPan !== 'none')
    {
      // Si le parag courant cliqué est un relatif, alors il faut mettre en
      // exergue tous les relatifs du référent pour mettre en exergue les
      // frère de ce parag.
      // Noter que la propriété `this.referent_id` est tout à fait provisoire
      // et dépend entièrement des panneaux qui sont activés.
      if ( statutDblPan == 'relatif' )
      {
        Parags.get(this.referent_id).exergueRelatifs()
      }
      else
      {
        // Le parag est un référent
        DOM.addClass(this.mainDiv, statutDblPan)
        this.relatifs.as_relatifs.forEach( iparag => iparag.exergue(false) )
      }
    }
    this.relatifsExergued = true
  }
  /**
  * Méthode qui sert de l'exergue tous les relatifs du paragraphe
  **/
  unexergueRelatifs ()
  {
    let statutDblPan = this.statutDoublePanneau
    if ( statutDblPan != 'none' )
    {
      if ( statutDblPan == 'relatif'){
        Parags.get(this.referent_id).unexergueRelatifs()
      }
      else
      {
        // Le parag est un référent
        this.relatifs.as_relatifs.forEach( iparag => iparag.unexergue() )
        DOM.removeClass(this.mainDiv, statutDblPan)
      }
    }
    this.relatifsExergued = false
  }

  /**
  * Propriété statut du parag dans le mode double panneau actuel
  * En fonction des deux panneaux choisis, le paragraphe peut avoir trois
  * status différents :
  *     'none'      Il n'a pas de relatives
  *     'referent'  Il est le référent de plusieurs paragraphes de l'autre
  *                 panneau.
  *     'relatif'   Il est relatif, avec d'autres paragraphes à côté de
  *                 lui, d'un référent de l'autre panneau.
  **/
  get statutDoublePanneau ()
  {
    if ( ! this.projet.mode_double_panneaux ) { return 'none' }
    let pan_letter = Projet.PANNEAUX_DATA[this.panneau_id].oneLetter
    // console.log(`pan_letter du parag ${this.id} : ${pan_letter}`)
    // Il faut récupérer les deux panneaux activés
    let other_panneau
    if ( this.projet.alt_panneau.name == this.panneau_id ){
      other_panneau = this.projet.current_panneau.name
    } else {
      other_panneau = this.projet.alt_panneau.name
    }
    // console.log(`Nom de l'autre panneau : ${other_panneau}`)
    let other_pan_letter = Projet.PANNEAUX_DATA[other_panneau].oneLetter
    // console.log(`Lettre de l'autre panneau : ${other_pan_letter}`)
    let drelatives = this.data_relatives
    // console.log(`Données relative : ${JSON.stringify(drelatives)}`)
    if (undefined === drelatives['r'][other_pan_letter]) {return 'none'}
    // console.log(`drelatives['r']['${other_pan_letter}'] = ${drelatives['r'][other_pan_letter].join(', ')}`)
    if ( drelatives['r'][other_pan_letter].length > 1){
      // console.log("=> referent")
      return 'referent' // ce paragraphe est le référent
    } else {
      // Ce paragraphe est un relatif
      // On va plutôt renvoyer le travail d'afficher les relatifs à son
      // référent pour que tous les relatifs soient bien affichés.
      this.referent_id = drelatives['r'][other_pan_letter][0]
      // console.log("=> relatif")
      return 'relatif'
    }
  }

  // Passer le champ contents en mode édition (sauf si la touche CMD est
  // pressée)
  // On conserve la valeur actuelle du champ pour la comparer à la nouvelle
  // et savoir s'il y a eu un changement.

  doEdit (evt)
  {
    if ( evt && evt.metaKey ) { return true }
    const my = this
    let o = my.divContents
    let realContents
    o.contentEditable = 'true'
    try
    {
      realContents = my.contents.replace(/<br>/g,"\n")
    }
    catch(err)
    {
      // console.log(`[doEdit] ERREUR avec parag#${this.id}`, err)
      // console.log(`[doEdit] Le parag#{this.id} contient (data) :`,this.data)
      realContents = ''
    }
    o.innerHTML = realContents

    UI.setSelectionPerOption(o, my.projet.option('seloneditpar') ? 'all' : false)

    my.projet.mode_edition = true // C'est ça qui change les gestionnaires de keyup
    my.actualContents = String(my.contents)
  }
  // Sortir le champ contents du mode édition (et enregistrer
  // la nouvelle donnée si nécessaire)
  undoEdit (evt)
  {
    this.contentsHasChanged() && this.onChangeContents.bind(this)()
    this.endEdit()
  }


  /**
  * Sortir du champ contents en mode édition
  * Soit cette méthode est appelée par `undoEdit` lorsque l'édition a été
  * faite complètement, soit on passe directement ici pour une annulation de
  * l'édition avec ESCAPE.
  **/
  endEdit (evt)
  {
    this.divContents.contentEditable = 'false'
    this.divContents.innerHTML = this.contentsFormated
    this.panneau.select(this) // on le remet toujours en courant
    this.projet.mode_edition = false
  }

  /**
  * @return true si le contenu, après édition, a été modifié. On en profite
  *         aussi pour définir le nouveau contenu dans this.newContents
  **/
  contentsHasChanged () {
    this.defineNewContents()
    return this.actualContents != this.newContents
  }

  /**
  * @return {String} Le nouveau contenu (non formaté, donc pour enregistrement)
  *
  * L'idée est d'obtenir un texte où les retours-chariots sont tous remplacés
  * par des <br>, pour ne pas avoir à les corriger lorsqu'on parse par JSON et
  * pour ne pas avoir à ajouter les <br> chaque fois qu'on inscrit le parag
  * dans la page.
  **/
  defineNewContents ()
  {
    let c = this.divContents.innerHTML
    c = c.replace(/<\/div>/g,'').trim()
    c = c.replace(/<div>/g, "\n").trim()
    c = c.replace(/\r/g, "\n")
    c = c.replace(/\n\n+/g, "\n") // pas de double-retours
    c = c.replace(/\n/g,'<br>') // on garde des BR pour simplifier
    this.newContents = c
  }


  /**
  * Méthode qui "longuarise" une donnée pour l'enregistrer dans le fichier
  * par longueur.
  *
  * @return {String}  La valeur à enregistrer dans le fichier, de la bonne
  *                   longeur et avec en première lettre le type de la
  *                   donnée.
  *
  * @param {String} p Nom de la propriété, par exemple 'id' ou 'contents'
  *                   Elle doit correspondre à une entrée dans Parag.DATA
  *
  * (1) La donnée est toujours enregistrée avec en toute première lettre
  *     le type de la donnée.
  **/
  xBytesData(p)
  {

    /*  Les données absolues de la propriété  */

    const d = Parag.DATA[p]

    /*  La valeur initiale  */

    let v = this[p]
    if ( v === undefined || v === null ) { v = d.default }

    let t = d.type
    if ( t == 'b' ){
      v = v ? '1' : '0'
    } else {

      /* Allongement de la donnée à la bonne longueur */
      // TODO Plus tard, on pourra utiliser padStart ?

      let dif, suf = '', i = 0
      v = String(v)
      for(dif = (d.length-v.length) ; i < dif; ++i){ suf += ' '}
      v = suf + v

    }
    return t + v // (1)
  }

  /**
  * Méthode qui retourne le paragraphe avant lequel le paragraphe courant est
  * en relation dans le panneau courant.
  *
  * Noter que cette méthode ne
  *
  * @param  {String} pan_id   L'ID du panneau (entier, donc 'manuscrit')
  * @param {Boolean} firstOne Si true, on doit renvoyer le premier, sinon,
  *                           on renvoie le dernier.
  *
  * @return {Number}  L'ID du paragraphe avant lequel insérer le nouveau
  *                   paragraphe ou NULL s'il doit être inséré à la fin.
  **/
  relInPan ( pan_id, firstOne )
  {
    const my = this

    const panRels = my.relativeParagsInPanneau(pan_id)

    /*  Pas de données relatives pour ce panneau => null */

    if ( undefined === panRels ) { return null }

    /*  On retourne soit le premier soit le dernier élément */

    return firstOne ? panRels[0] : panRels[panRels.length - 1]
  }

  /**
  * @return {Array} Liste des {Parag}s associés au parag courant dans le panneau
  *                 d'identifiant +pan_id+.
  *                 Note : la liste est classée dans l'ordre (ce qui est
  *                 nécessaire puisque les identifiants sont ajoutés sans
  *                 ordre précis dans les relatives)
  *
  * @param {String} pan_id Identifiant du panneau.
  *
  **/
  relativeParagsInPanneau ( pan_id )
  {
    const my = this

    /*  La lettre correspond au panneau */

    const panLetter = PanProjet.oneLetterOf(pan_id)

    /*  Relatives du parag courant pour le panneau */

    let panRels = my.data_relatives['r'][panLetter]

    /*  On classe la liste des parags si elle est définie */

    if ( panRels ) {
      panRels.sort((p1,p2)=>{return Parags.get(p1).index-Parags.get(p2).index})
    }

    return panRels

  }

  /**
  * @return {Boolean} true si le parag est associé au parag d'ID +pid+
  *
  * @param {Number|Parag} pid Soit l'ID du parag soit le parag lui-même.
  **/
  isRelativeOf ( pid )
  {
    if ( 'Parag' == pid.constructor.name ) { pid = pid.id }
    return undefined !== this.relatives.get(pid)
  }
  hasRelative ( pid ) { return this.isRelativeOf(pid) }

  get relatives ()
  {
    if ( undefined === this._relatives )
    {
      const my = this
      let panLetters = Object.getOwnPropertyNames(my.data_relatives['r'])
      this._relatives = new Map()
      panLetters.forEach( pl => {
        my.data_relatives['r'][pl].forEach( pid => {
          this._relatives.set(pid, Parags.get(pid) || null /* pas undefined */)
        })
      })
    }
    return this._relatives
  }


  /** ---------------------------------------------------------------------
    *
    *   GESTION INTÉGRALE DES TYPES DU PARAG
    *
  *** --------------------------------------------------------------------- */
  get types () {
    this._types || ( this._types = new ParagTypes(this) )
    return this._types
  }

  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES POUR LE VERSO DU DIV (PROPS)
    *
  *** --------------------------------------------------------------------- */

  /**
  * @property {HTMLElement} Le div du recto du parag
  **/
  get recto ()
  {
    this._recto || (this._recto = this.mainDiv.querySelector('div.p-recto'))
    return this._recto
  }

  /**
  * @property {HTMLElement} Le div du verso du parag
  **/
  get verso ()
  {
    this._verso || ( this._verso = this.mainDiv.querySelector('div.p-verso'))
    return this._verso
  }

  isRecto ()
  {
    if ( undefined === this._isRecto ) { this._isRecto = true }
    return this._isRecto
  }

  /**
  * Méthode principale qui bascule l'affiche du parag en fonction de
  * son état actuel.
  **/
  toggleRectoVerso ()
  {
    this[ this.isRecto() ? 'showVerso' : 'showRecto' ].call(this)
  }

  /**
   * Méthode qui demande l'affichage du recto du parag
   *
   * Elle commence par mettre le formulaire général dans le div.verso du
   * mainDiv du parag.
   */
  showVerso ()
  {
    const my = this

    my.mainDiv.querySelector('div.p-verso').appendChild(Parag.paragVersoForm)
    Parag.paragVersoForm.style.display = 'block'
    my.recto.className = 'p-recto hidden'
    my.verso.className = 'p-verso'
    my._isRecto = false

    /*- On met les 4 menus des types -*/

    if ( ! Parag.paragVersoForm.querySelector('#parag_type1') )
    {
      let selects = my.types.buildSelects()
      for( let xtype = 1 ; xtype < 5 ; ++ xtype )
      {
        let ospan = Parag.paragVersoForm.querySelector(`span#span-type${xtype}`)
        ospan.innerHTML = ''
        ospan.appendChild(selects[-1 + xtype])
      }
    }

    /*- Renseignement du formulaire avec valeurs parag -*/

    ;(new Map([
        ['id',        my.id]
      , ['duration',  (my.duration||60).as_duree()]
      , ['position',  (my.position < 0 ? 'auto' : my.position.as_horloge())]
      , ['type1',     my.types.type1]
      , ['type2',     my.types.type2]
      , ['type3',     my.types.type3]
      , ['type4',     my.types.type4]
    ])).forEach( (v, k) => {
      let o = Parag.paragVersoForm.querySelector(`#parag_${k}`)
      v = String(v) // attention quand on utilisera des checkbox
      switch(o.tagName.toLowerCase())
      {
        case 'select':
          o.value = v
          break
        default:
          o.innerHTML = v
      }
    })


    /*- Définition pour le Tabulator -*/


    let mesLettres = new Map([
        ['b',           my.createNewBrin.bind(my)]
      , ['ArrowLeft',   my.showRecto.bind(my)]
    ])

    if (DOM.get('parag_verso_form')) // pas pour les tests
    {
      Tabulator.setupAsTabulator('parag_verso_form', {
        Map:{
            'duration'  : my.editProperty.bind(my, 'duration')
          , 'position'  : my.editProperty.bind(my, 'position')
          , 'type1'     : my.editProperty.bind(my, 'type1')
          , 'type2'     : my.editProperty.bind(my, 'type2')
          , 'type3'     : my.editProperty.bind(my, 'type3')
          , 'type4'     : my.editProperty.bind(my, 'type4')
        }
        , MapLetters: mesLettres
      })
    }
    return true
  }


  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES D'ÉDITION DES DONNÉES
    *
  *** --------------------------------------------------------------------- */

  createNewBrin ()
  {
    this.projet.brins.showForm()
  }
  editProperty ( property )
  {
    const my  = this
    const obj = DOM.get(`parag_${property}`)
    switch(obj.tagName.toLowerCase())
    {
      case 'select':
        obj.focus()
        break
      default:
        my.projet.ui.activateEditableField(obj)
    }
  }

  redefine_parag_duration (nv)
  {
    this.duration = nv.as_seconds()
    DOM.get('parag_duration').innerHTML = this.duration.as_duree()
    this.reset()
    this.modified = true
  }

  redefine_parag_position (nv)
  {
    if ( nv === 'auto' || nv === '-1')
    {
      this.position = -1
      DOM.get('parag_position').innerHTML = 'auto'
    }
    else
    {
      this.position = nv.as_seconds()
      DOM.get('parag_position').innerHTML = this.position.as_horloge()
    }
    this.reset()
    this.modified = true
  }

  /**
  * Quand on choisit une nouvelle valeur dans un des 4 menus de type
  **/
  onChangeType( xType, nv )
  {
    const my = this

    my.types[`type${xType}`]= parseInt(nv)
    // modifie aussi la donnée générale

    my.modified = true

    // TODO remettre : this.rebuild()
    // On doit peut-être reconstruire le parag, car les styles influent
    // fortement sur le style.
  }

  showRecto ()
  {
    const my = this
    if ( false === my._isRecto )
    {
      // <= C'est une vraie remise au verso, après affichage du verso
      // => Il faut sortir le traitement de la gestion par le Tabulator
      if ( DOM.get('parag_verso_form') /* inconnu en test unitaire */ ) {
        Tabulator.unsetAsTabulator('parag_verso_form')
      }
    }
    my.recto.className = 'p-recto'
    my.verso.className = 'p-verso hidden'
    my._isRecto = true
  }

  static get paragVersoForm ()
  {
    if ( undefined === this._paragVersoForm )
    {
      const my = this
      my._paragVersoForm = undefined
      // Je le cherche dans une des sections des panneaux
      // Noter qu'on pourrait le rechercher dans le document, mais que

      my._paragVersoForm = document.querySelector('form#parag_verso_form')

      if ( ! my._paragVersoForm )
      {
        Projet.PANNEAU_LIST.forEach( (panid) => {
          if ( my._paragVersoForm ) { return }
          else {
            let container = Projet.current.panneau(panid).section
            my._paragVersoForm = container.querySelector('form#parag_verso_form')
          }
        })
      }
    }
    return this._paragVersoForm
  }

}

module.exports = Parag
