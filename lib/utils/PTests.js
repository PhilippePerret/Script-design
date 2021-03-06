/*

  Note0001

        Ce script a deux utilisation très différentes :
        1.  Il est chargé par le module appelant les tests qui va utiliser la
            méthode `PTests.prepare` pour ouvrir la fenêtre du test.
        2.  Il est chargé par la fenêtre du test elle-même (PTests.html) pour
            gérer l'ensemble des tests.

  Note0002

        Avec le réglage de double écran tel que je l'ai mis (display à gauche
        et réglé comme écran principal), x n'est pas pris en compte. Il faut,
        une fois que la fenêtre est affichée (après un dixième de seconde), la
        repositionner avec la méthode setPosition. Chercher avec cette Note0002
        pour trouver les endroits où c'est fait.
*/
let
    fs        = require('fs-extra')
  , path      = require('path')

if(fs.existsSync(path.resolve(path.join('.','lib','constants.js')))){
  console.log("--> Chargement de C (les constantes)")
  global.C    = require('../constants')
}
if(fs.existsSync(path.resolve(path.join('.','lib','utils','dom_class.js')))){
  console.log("--> Chargement de DOM")
  global.DOM  = require('./dom_class')
}

let
    glob      = require('glob')
  , ipc       = require('electron').ipcRenderer
  , Any       = require('./PTests/Any')
  , PTestsDOM = require('./PTests/Dom')
  , root      = path.resolve('.')
  , moment    = require('moment')


// Chemin d'accès courant au dossier contenant les feuilles de tests
// pour PTest
PTESTS_FOLDER_PATH = path.resolve(path.join('.','tests','ptests'))

// ID de la section, dans le document en mode unitaire, qui va recevoir tous
// les messages du rapport.
const PTEST_RESULTS_SECTION_ID = 'ptests-results'

// Nom de production de l'application (on va lui ajouter '-TEST' pour ne pas détruire
// ou modifier des données réelles)
const OriginalProductName = require(`${root}/package`).productName || require(`${root}/package`).name
const PRODUCT_NAME = `${OriginalProductName}-TEST`
// Dossier dans lequel mettre les données pour l'application
const USER_DATA_PATH = path.join(process.env.HOME, 'Library', 'Application\ Support', PRODUCT_NAME)


String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}

// On expose la méthode log qui permettra d'écrire toujours dans la console
// principale
global.log = function(m,o){
  if (ipc /* renderer */) { ipc.send('message',m,o) }
  else /* main process */ { if(o){console.log(m,o)}else{console.log(m)}}

}

log("\n\n\n---------------------------------------------------------------------\n\n")
log(`PTests starts at ${moment().format('LLL')}\n`)
log('Nom de l’application = ', PRODUCT_NAME)
log('Path au dossier de données = ', USER_DATA_PATH)

// Class d'erreur cutomisée pour récupérer les lignes des tests
// d'erreur
class VoluntaryTestError extends Error {
  constructor(message) {
      super ( message )
      Error.captureStackTrace(this, this.constructor)
  }
}
class PTestsExpectationError extends Error {
  constructor(message){
    super(message)
    Error.captureStackTrace(this,this.constructor)
  }
}


/**
 * Class d'erreur customisée pour provoquer un message dans les
 * tests
 * @usage
 *    throw new PTestsError(<le message d'erreur>)
 *
 * @param {String} message Le message
 * @constructor
 */
class PTestsError extends Error {
  constructor(message) {
    super ( message )
    this.name = this.constructor.name // 'PTestsError'
    Error.captureStackTrace(this, this.constructor)
  }
  as_full_error ()
  {
    let stack = this.stack
    stack = stack.split("\n").join('<br>')
    return `ERREUR ÉCRITURE TEST : ${this.message}<br><br>${stack}<br><br>`
  }
}
function throwError (message)
{
  let err = new PTestsError(message)
  // log( err.as_full_error() )
  PTests.writer.write_error(err.as_full_error())
  PTests.add_error(err)
}

/** ---------------------------------------------------------------------
  *   class PTestOptions
  *   ------------------
  *   Instance de PTests.options permettant de gérer les options
  *
*** --------------------------------------------------------------------- */

class PTestOptions
{
  constructor () {}
  // Pour écrire les conteneurs des describes
  set one_line_describe (v){ this._one_line_describe = v            }
  get one_line_describe () { return this._one_line_describe || false}

}
/**
*   Classe d'un fichier de test (dans le dossier ./ptests, normalement)
**/
class PTestFile {
  constructor (relpath)
  {
    this.path           = path.resolve(relpath)
    this.relative_path  = '.' + this.path.substr(root.length, this.path.length-1)
  }
  /**
  *   On joue le fichier de test
  **/
  run ()
  {
    try
    {
      // ============> TEST <================
      // On requiert la fiche du test afin qu'il soit exécuté
      PTests.writer.write_path(this.as_link_to_line(1, this.relative_path))
      PTestContainer.init()
      require(this.path) // => définit simplement les cases sans rien tester
      PTestContainer.define_tab_levels()
      if ('function' === typeof this.beforeAll){this.beforeAll.call()}
      PTestContainer.run_lists()
      if ('function' === typeof this.afterAll){this.afterAll.call()}
      // ============  / TEST  ===============
    }
    catch(erreur) {
      console.log(erreur)
      log(erreur)
      let err = new PTestsError(`${erreur} (dans ${this.relative_path})`)
      PTests.add_error(err)
      PTests.writer.write_error(err)
    }

  }
  as_link_to_line (line, title)
  {
    if (undefined === title) { title = this.relative_path }
    return `<a href="atm://open?url=file://${this.path}&line=${line}">${title}::${line}</a>`
  }
}

/** ---------------------------------------------------------------------
  *
  *     Class PtestsWaiter
  *
*** --------------------------------------------------------------------- */
class PTestsWaiter
{
  static get MESSAGES_BY_CHECKIF () {
    if(!this._messages_by_checkif){
      this._messages_by_checkif = {
          'visible': {
            'start_attente' : "J'attends que _EXPECTED_ soit visible"
          , 'ok'            : "OK _EXPECTED_ est maintenant visible"
          , 'timeout'       : "Malheureusement, le temps est dépassé et _EXPECTED_ n'est toujours pas visible…"
        }
        , 'invisible':{
            'start_attente' : "J'attends que _EXPECTED_ ne soit plus visible"
          , 'ok'            : "OK _EXPECTED_ n'est plus visible"
          , 'timeout'       : "Malheureusement, le temps est dépassé et _EXPECTED_ est toujours visible…"
        }
        , 'is_true': {
            'start_attente'   : "J'attends que la fonction test retourne true"
          , 'ok'              : "OK la condition est TRUE"
          , 'timeout'         : "Malheureusement, la condition n'est toujours pas TRUE"
        }
        , 'is_false': {
          'start_attente'   : "J'attends que la fonction test retourne FALSE"
        , 'ok'              : "OK la condition est FALSE"
        , 'timeout'         : "Malheureusement, la condition n'est toujours pas FALSE"
        }
        , 'time-is-come':{
          'start_attente'   : "J'attends _EXPECTED_ secondes"
        , 'ok'              : "OK, le temps est passé"
        , 'timeout'         : "(n'est pas possible avec cette boucle qui ne fait qu'attendre)"
        }
      }
    }
    return this._messages_by_checkif
  }

  constructor ( expected, options )
  {
    options || ( options = {} )
    // On avertit PTests qu'un tests asynchrone a été lancé et on
    // récupère l'index retourné.
    this.index = PTests.addWaiter.bind(PTests)(this)
    switch ( typeof expected )
    {
      case 'number':
        this.expected = expected
        break
      case 'object':
        // Quand on doit chercher dans un container
        this.expected = expected
        break
      case 'string':
        this.original_expected = String(expected)
        this.expected = expected
        options.in || (options.in = document)
        // let cont = options.in ? options.in : document
        // this.expected = cont.querySelector(expected)
        // if (options.in){
        //   this.expected = options.in.querySelector(expected)
        // } else {
        //   this.expected = document.querySelector(expected)
        // }
        break
      case 'function':
        this.original_expected = '&lt;function test&gt;'
        this.expected = expected
        break
    }
    // Met les options par défaut et définit this.options
    this.defaultize_options(options)

    this.start_time = (new Date()).getTime()
    if ( options.checkIf != 'time-is-come' )
    {
      this.end_time   = this.start_time + 1000 * this.options.timeout
    }
    else
    {
      // Une simple boucle d'attente
      // pas de timeout pour une simple boucle d'attente
      this.end_time     = this.start_time + 1000 * 100000
      this.options.time = this.start_time + 1000 * expected
    }

    // Si wait est défini (attention : pas la méthode, mais l'option), alors
    // il faut attendre un peu avant d'appeler la méthode
    if (  !  this.options.wait ) { this.options.wait = 0 }
    let my = this
    this.timerTOut = setTimeout(this.wait.bind(this), 1000 * this.options.wait)
    // console.log('this.end_time',this.end_time)
  }
  /**
  * La boucle d'attente
  **/
  wait ()
  {
    // console.log('-> PTestsWaiter#wait')
    clearTimeout(this.timerTOut)
    this.logMessageByCheckIf('start_attente')
    this.timer = setInterval(this.waitMethod.bind(this), this.options.checklaps)
  }

  /**
  * Sort en console le message d'identifiant +mess_id+
  * @param {String} mess_id Identifiant du message dans Waiter::MESSAGES_BY_CHECKIF
  **/
  logMessageByCheckIf (mess_id)
  {
    let m = PTestsWaiter.MESSAGES_BY_CHECKIF[this.options.checkIf][mess_id]
    m = m.replace(/_EXPECTED_/, this.original_expected)
  }

  get isOK ()
  {
    let parentTagName
    try
    {
      switch ( this.options.checkIf )
      {
        case 'time-is-come':
          return (new Date()).getTime() > this.options.time
        case 'visible':
          return PTestsDOM
                  .actualTagContainsExpect(this.options.in, this.expected)
                  .success
          // if (!this.expected) { return false }
          // if (this.expected.parentNode){
          //   // console.log(`Noeud parent de ${this.original_expected}`,this.expected.parentNode)
          //   parentTagName = this.expected.parentNode.tagName
          //   // console.log(`Noeud parent de ${this.original_expected}`, parentTagName)
          // }
          // if ('BODY' === parentTagName) {
          //   // console.log('this.expected.offsetHeight:', this.expected.offsetHeight)
          //   return this.expected.offsetHeight > 0
          // } else {
          //   return this.expected.offsetParent !== null
          // }
        case 'not_visible':
          return !PTestsDOM
                    .actualTagContainsExpect(this.options.in, this.expected)
                    .success
          // if ( !this.expected ) { return true }
          // if (this.expected.parentNode){
          //   parentTagName = this.expected.parentNode.tagName
          // }
          // if ('BODY' === parentTagName) {
          //   // console.log('this.expected.offsetHeight:', this.expected.offsetHeight)
          //   return this.expected.offsetHeight == 0
          // } else {
          //   return this.expected.offsetParent === null
          // }
        case 'is_true':
          return this.expected.call() === true
        case 'is_false':
          return this.expected.call() === false
      }
    }
    catch(erreur)
    {
      // console.log("JE PASSE ICI")
      return false
    }
  }

  waitMethod ()
  {
    // console.log("isOK", isOK)
    if ( this.isOK )
    {
      // ========= C'EST BON ===========
      this.logMessageByCheckIf('ok')
      clearInterval( this.timer )
      this.follow()
    }
    else
    {
      if ( (new Date().getTime()) > this.end_time )
      {
        PTests.stopAllWaiters()
        clearInterval(this.timer)
        // On avertit que le test asynchrone est fini
        let err = new PTestsError(this.logMessageByCheckIf('timeout'))
        PTests.add_error(err)
        // throw err
      }
    }
  }
  stop ()
  {
    PTests.stopWaiter.bind(PTests)(this)
  }
  defaultize_options ( options )
  {
    if ( undefined === options ) { options = {} }
    if ( undefined === options.timeout )  { options.timeout = 30    }
    // Le laps de temps entre chaque vérification du DOM
    if ( undefined === options.checklaps) { options.checklaps = 100 }
    this.options = options
  }
  /**
  * Méthode publique d'utilisateur pour définir la `then_method`
  * Ne pas confondre avec la méthode `follow` ci-dessous qui elle est chargée
  * de jouer la then-method quand ça fonctionne.
  **/
  then ( method )
  {
    this.then_method = method
    return this
  }
  else ( method )
  {
    this.else_method = method
    return this
  }
  follow   () {
    try
    {
      this.then_method.call()
    }
    catch(erreur)
    {
      // this.stop()
      console.log("ERREUR DANS la then-method du waiter :",erreur)
      PTests.add_error(new PTestsExpectationError(erreur))
      PTests.add_error(erreur)
    }
    // On avertit que le test asynchrone est fini
    this.stop()
  }
  run_else () {
    try
    {
      this.else_method.call(this.error)
    }
    catch(erreur)
    {
      console.log("ERREUR DANS la else-method du waiter :",erreur)
    }
    // On avertit que le test asynchrone est fini
    this.stop()
  }
}

// --- Méthodes publiques ---
function waitFor(arg, opts) {
  opts || ( opts = {} )
  opts.checkIf = 'time-is-come'
  return new PTestsWaiter(arg, opts)
}
function waitForVisible( arg, opts) {
  opts || ( opts = {} )
  opts.checkIf = 'visible'
  return new PTestsWaiter(arg, opts)
}
function waitForNotVisible(arg,opts){
  opts || ( opts = {} )
  opts.checkIf = 'not_visible'
  return new PTestsWaiter(arg, opts)
}
function waitForTrue(fn, opts){
  if('function'!==typeof fn){throw new Error("Le premier argument de waitForTrue doit être une fonction (qui retourne la valeur à comparer à true)")}
  opts || ( opts = {} )
  opts.checkIf = 'is_true'
  return new PTestsWaiter(fn, opts)
}
function waitForFalse(fn, opts){
  if('function'!==typeof fn){throw new Error("Le premier argument de waitForFalse doit être une fonction (qui retourne la valeur à comparer à false)")}
  opts || ( opts = {} )
  opts.checkIf = 'is_false'
  return new PTestsWaiter(fn, opts)
}

/** ---------------------------------------------------------------------
  *
  *     Class PTESTS
  *     ------------
  *
  *   Class principale pour les P-Tests
  *
*** --------------------------------------------------------------------- */

class PTests {

  /**
  * @return le path absolu au dossier des tests PTests
  **/
  static get folder_test_path () {
    if ( undefined === this._folder_test_path )
    { this._folder_test_path = PTESTS_FOLDER_PATH }
    return this._folder_test_path
  }
  static get folder () { return this.folder_test_path }

  /**
  *   Utiliser par le module de lancement du test
  *   Bien avoir conscience de la Note0001
  *
  *   MÉTHODE DU MAIN PROCESS !!!
  **/
  static prepare ()
  {
    let
        {BrowserWindow} = require('electron')
      , path            = require('path')
    const fenPTests = new BrowserWindow({
      x: 40, /* malheureusement, ça ne fonctionne pas avec le double écran, cf Note0002 */
      y: 0, width:1500, height:900, show: false, devTools:true})
    // fenPTests.openDevTools()
    fenPTests.loadURL('file://'+path.join(__dirname,'PTests.html'))
    fenPTests.on('ready-to-show', (evt) => {
      fenPTests.show()
      /* Note0002 */
      let timer = setTimeout(function(){clearTimeout(timer);fenPTests.setPosition(40,0);fenPTests.focus()}, 1000)
    })
  }

  static get current_file () { return this._current_file  }
  static set current_file (v){ this._current_file = v     }

  static get root () { return root } // pour les tests

  /** ---------------------------------------------------------------------
    *
    *   RENDERER
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {PTestOptions} instance des options de PTests
  **/
  static options () {
    if ( undefined === this._options ) { this._options = new PTestOptions() }
    return this._options
  }
  /**
  * @return l'option de clé +key+ (ou undefined si non définie)
  **/
  static option (key) { return this.options[key] }

  /**
  * Permet d'écrire un texte dans le rapport
  * C'est une sorte de raccourci de `write`
  **/
  static puts (mess, args)
  {
    PTests.writer.write(mess, args)
  }

  // Raccourci pour pouvoir utiliser 'PTests.write(message)'
  static write (mess, arg2, arg3)
  {
    PTests.writer.write(mess, arg2, arg3)
  }

  /**
  *   Lance la suite de tests
  *
  *   Pour le moment, ils se trouvent dans le
  *   dossier PTESTS_FOLDER_PATH
  **/
  static run ()
  {
    this.on_start()
    this.defineTestFilesListAndRun()

  }// /run

  /**
  * Pour les tests lancés depuis l'intérieur de l'application, à l'aide
  * de :
  *     require('./lib/utils/ptests')
  *     PTests.run_folder(path/to/folder_specs/)
  *
  * Note : pour un fichier unique, c'est la méthode `run_file` ci-dessous
  * qui est utilisée.
  **/
  static run_folder (fpath)
  {
    console.log('---> Lancement du dossier de tests d’intégration', fpath)
    PTests.reporter = new Report(path.join(fpath,'folder_test_report.html'))
    console.log('--> Projet#on_start')
    this.on_start( true )
    console.log('--> PTestContainer::init')
    PTestContainer.init()
    this.options.test_folder = fpath
    console.log('--> Projet#defineTestFilesListAndRun')
    this.defineTestFilesListAndRun()
    console.log('<- Projet#run_folder')
  }
  /**
  *   Pour les tests lancés depuis l'intérieur de l'application à l'aide de
  *       require('./lib/utils/ptests')
  *       PTests.run_file(path/to/file_spec.js)
  **/
  static run_file ( fpath )
  {
    if (false === fpath.endsWith('.js')){fpath += '.js'}
    console.log('---> Lancement du test d’intégration', fpath)
    PTests.reporter = new Report(`${fpath}.html`)
    this.on_start( true )
            /** Le true ci-dessus indique qu'on est en pseudo mode
              * d'intégration. C'est-à-dire, notamment, que les résultats
              * devront être inscrits dans un fichier plutôt que dans la
              * fenêtre de résultat de l'application PTests
              */
    PTestContainer.init()
    // Requiert le fichier test
    // NOTE : ne faudrait-il pas simplement définir qu'il est le fichier
    // à jouer et lancer le reste normalement ? Notamment pour que this.file
    // des tests existe et permettent d'utiliser les beforeEach et compagnie
    this.options.test_file = fpath
    this.defineTestFilesListAndRun()
  }

  /**
  * Joue tous les fichiers tests relevés
  *
  * La méthode est appelée après avoir relevé tous les fichiers tests
  * à jouer (de façon asynchrone par glob).
  * Grâce aux waiters, on attend la fin de chaque feuille de test avant
  * de passer au suivant.
  * Donc à l'intérieur des feuilles de test il peut y avoir des chevauchements
  * mais pas entre feuilles de tests
  **/
  //
  // la liste des fichiers de tests
  static run_test_files (test_files)
  {
    let my = this
    log("Fichiers tests à jouer :", test_files)

    this.allTestFiles = test_files

    // Before suite (dans spec_helper.js)
    if ('function' === typeof this.beforeSuiteMethod)
    { this.beforeSuiteMethod.call() }

    // On lance le premier test
    this.run_test_and_wait( this.allTestFiles.shift() )

  }

  /**
  * Joue réellement le test
  **/
  static run_test_and_wait (frelpath)
  {
    let my = this
      , ftest

    console.log(`Je runne le fichier test '${frelpath}'`)
    ftest = new PTestFile(frelpath)
    my.current_file = ftest
    ftest.run()

    // Boucle d'attente avant d'appeler la feuille suivante
    this.wait_until_not_running()

  }

  static wait_until_not_running ()
  {
    let my = this
    let waitTimer = setInterval(
      // La méthode appelée toutes les demi-secondes
      () => {
        console.log("Je checke si PTests est toujours isWaiting")
        if ( my.isWaiting )
        {
          // Un test est encore en train de tourner, il faut attendre
          // avant de passer à la suite.
        }
        else
        {
          // La feuille de tests a fini, on peut passer au tests suivant
          clearInterval(waitTimer)
          if ( my.allTestFiles.length )
          {
            // <= Il reste des feuilles de test à jouer
            // => Je runne la prochaine feuille de test en la retirant
            //    de la liste des feuilles de tests à jouer.
            //
            // ==== JOUER LA FEUILLE DE TESTS SUIVANTE ===
            //
            // Il reste des tests à jouer, on le joue en le retirant
            // de la liste.
            my.run_test_and_wait(my.allTestFiles.shift())
          }
          else
          {
            // <= Il n'y a plus de feuilles de tests à jouer
            // => Je termine le test

            //
            // ==== FIN DE TOUS LES TESTS ====
            //

            console.log("Toutes les feuilles de test ont été jouées. Je finis.")
            // S'il le faut, on joue la méthode de fin de test
            if ('function' === typeof this.afterSuiteMethod)
            { this.afterSuiteMethod.call() }

            // Et on termine le test
            this.on_end()
          }
        }
      },
      // On check toutes les demi-secondes
      500
    )
  }

  /** ---------------------------------------------------------------------
    *   Méthodes pour les waiters (qui gèrent les tests asynchrones)
    *
  *** --------------------------------------------------------------------- */
  static addWaiter ( instWaiter )
  {
    if ( undefined === this._waiters ){ this._waiters = [] }
    this._waiters.push({waiter: instWaiter, running: true})
    // console.log("Ajout du waiter d'index :", this._waiters.length - 1)
    return this._waiters.length - 1
  }
  static stopWaiter ( instWaiter )
  {
    // console.log(`Arrêt du waiter d'index ${instWaiter.index}`)
    this._waiters[instWaiter.index].running = false
  }
  /**
  * Stop tous les waiters d'attente (après une erreur)
  **/
  static stopAllWaiters ()
  {
    this._waiters.forEach( w => w.running = false)
    delete this._waiters
  }
  /**
  * @return true si PTests attend encore que des tests asynchrones
  *         s'achèvent
  **/
  static get isWaiting ()
  {
    if (undefined === this._waiters) { return false }
    for(let i=0, len=this._waiters.length; i<len; ++i){
      if (this._waiters[i].running ) { return true }
    }
    // Il n'y a plus de waiters en cours
    delete this._waiters
    return false
  }

  /* --- private --- */

  /**
  *   @return La liste Array des fichiers de test
  **/
  static defineTestFilesListAndRun ()
  {
    let li

    if ( this.option('test_file') ) {
      let fullpath = path.resolve(path.join(this.folder_test_path, this.option('test_file')))
      if ( ! fs.existsSync(fullpath) )
      {
        throw new Error(`Le fichier test '${fullpath}' est introuvable.`)
      }
      else {
        this.run_test_files([fullpath])
      }
    }
    else {
      let ptests_folder
      if ( this.option('test_folder') )
      {
        let sous_folder = this.option('test_folder')
        ptests_folder = path.join(this.folder_test_path, sous_folder)
      }
      else
      {
        ptests_folder = this.folder_test_path
      }

      // On traite chaque fichier
      if ( ! fs.existsSync(ptests_folder) )
      {
        throw new Error(`Le dossier de test '${ptests_folder}' est introuvable.`)
      }
      else
      {
        let my = this
        glob(path.join(ptests_folder,'**','*_spec.js'), (err, files) => {
          if ( err ){ throw err }
          else
          {
            console.log('Nombre de fichiers tests récupérés :',files.length)
            my.run_test_files(files)
          }
        })
      }
    }
  }

  // Appelé avant toutes les feuilles de test
  /**
  * @param {Boolean} no_spec_helper Ajouté pour essai des tests d'intégration
  **/
  static on_start ( mode_in_application )
  {
    // On initialise certaines valeurs
    this._errors          = []
    this.nombre_errors    = 0
    this._pendings        = []

    // Que ce soit en mode intégré (intégration) ou en mode unitaire,
    // on charge les supports généraux de tests
    if ( fs.existsSync( this.support_file_path ) ) {
      this.require_module(this.support_file_path)
    }

    // On charge le fichier spec_helper.js s'il existe
    if ( ! mode_in_application )
    {
      // On ne charge le spec-helper qu'en mode unitaire
      if ( fs.existsSync(this.spec_helper_path) )
      { this.require_module(this.spec_helper_path) }
      // En mode unitaire (hors application), on crée le reporter ici. Dans
      // le mode intégration, il sera créé avant l'appel de cette méthode.
      PTests.reporter = new Report(PTEST_RESULTS_SECTION_ID)
    }
    let output = new PTestsWriter(PTEST_RESULTS_SECTION_ID)
    PTests.writer = output
    PTests.reporter.init_tests()//met les compteurs à 0
  }

  static get folder_tests () {
    if ( undefined === this._folder_tests )
    { this._folder_tests = path.resolve(path.join('.','tests','ptests')) }
    return this._folder_tests
  }
  static get spec_helper_path () {
    if ( undefined === this._spec_helper_path )
    { this._spec_helper_path = path.resolve(path.join(this.folder_tests,'spec_helper.js')) }
    return this._spec_helper_path
  }
  static get support_file_path () {
    if ( undefined === this._support_file_path ){
      let p = path.join(this.folder_tests,'support','common.js')
      this._support_file_path = path.resolve(p) }
    return this._support_file_path
  }
  // Requérir un module depuis une feuille de tests
  static require_module ( mpath )
  {
    return require(path.resolve(mpath))
    // TODO Mettre dans un try…catch pour intercepter les erreurs
  }

  // Appelé après toutes les feuilles de test
  static on_end ()
  {
    PTests.writer.write_final_resume.bind(PTests.writer)()
    // Noter qu'on scrolle avant d'écrire le résumé final pour se
    // trouver à l'endroit où sont résumés les résultats. En montant,
    // l'utilisateur peut trouver les tests décrits et en descendant, le
    // détail des fichiers.
    if ( document.getElementById(PTEST_RESULTS_SECTION_ID) )
    {
      let offset = document.getElementById(PTEST_RESULTS_SECTION_ID).offsetHeight
      window.scrollTo(0,offset)
    }
    this.display_pendings()
    this.display_errors()
    if (this.reporter)
    {
      // console.log('--> Report#completeFileAndOpen')
      this.reporter.completeFileAndOpen()
    }
  }


  /**
  *   Mémorisation d'une erreur
  *
  * @param {PTestExpectObject} L'instance qui permettra de récupérer toutes les
  *                            erreurs rencontrées.
  *         ou toute autre classe (par exemple une erreur fonctionnelle) qui
  *         implémente la méthode `as_full_error()` retournant le message
  **/
  static add_error ( expObj )
  {
    this._errors.push(expObj)
    ++ this.reporter.nombre_errors
  }

  /**
  *   Mémorisation d'un pending
  *
  * @param {PTestPendingObject} pendObj Instance qui permettra d'écrire les
  *                                     pendings dans le résumé de fin.
  **/
  static add_pending ( pendObj )
  {
    this._pendings.push(pendObj)
    ++ this.reporter.nombre_pendings
  }

  /**
  *   Affichage des erreurs rencontrées
  **/
  static display_errors ()
  {
    if ( 0 == this._errors.length ) { return }
    let current_numero = 0, messErr
    this._errors.map( (expObj) => {
      expObj.numero = ++ current_numero
      if ('function' === typeof expObj.as_full_error)
      {
        messErr = expObj.as_full_error()
      }
      else if (expObj.stack)
      {
        messErr = `${expObj.constructor.name} : ${expObj.message}
        <br><br>${expObj.stack.split('at ').join('<br>at ')}`
      }
      else
      {
        messErr = String(expObj)
      }
      this.write( messErr, false )
    })
  }
  /**
  * Affichage des pendings
  **/
  static display_pendings ()
  {
    if ( 0 == this._pendings.length) { return }
    let current_numero = 0
    this._pendings.map( (pendObj) => {
      pendObj.numero = ++ current_numero
      this.write(pendObj.as_full_pending(),'pending')
    })
  }

  /** ---------------------------------------------------------------------
    *   Définition des méthodes Before/After
    *
  *** --------------------------------------------------------------------- */
  static setBeforeSuite  (m) {this.beforeSuiteMethod       = m }
  static setAfterSuite   (m) {this.afterSuiteMethod        = m }
  static setBeforeAll    (m) {this.current_file.beforeAll  = m }
  static setBeforeEach   (m) {this.current_file.beforeEach = m }
  static setAfterAll     (m) {this.current_file.afterAll   = m }
  static setAfterEach    (m) {this.current_file.afterEach  = m }
  // ---------------------------------------------------------------------

  // Pour exposer les méthodes DOM dans les tests d'intégation
  static expose_dom_methods () { global.DOM = DOM }

}//PTests


/** ---------------------------------------------------------------------
  *   LE REPORT
  *   ---------
  *   Classe chargée d'écrire le rapport.
  *   Il connait deux modes d'utilisation principaux :
  *     - Mode dit "unitaire" : les tests sont lancés comme une application
  *       et possède leur propre fenêtre pour inscrire les messages.
  *     - Mode dit "intégration" : les tests sont lancés depuis l'application
  *       testée et un document est fabriqué, contenant les résultats,
  *       qui sera ouvert en fin de processus dans le navigateur par défaut.
  *
  *   Le jeu d'écriture se fait sur la méthode `appendChild` qui dans un
  *   cas est vraiment la méthode DOM connue et dans l'autre écrit le contenu
  *   dans le fichier des résultats.
  *
*** --------------------------------------------------------------------- */
class Report
{
  /**
  * @param  {String} Si le résultat doit être écrit dans un fichier
  *         {DOMElement} si c'est en test unitaire
  **/
  constructor ( container )
  {
    this.container          = container
    // console.log('container dans Report = ', container)
    this.asIntegrationTest  = container !== PTEST_RESULTS_SECTION_ID
    // console.log('asIntegrationTest:', this.asIntegrationTest)
    if ( this.asIntegrationTest )
    {
      this.relative_path  = container
      this.full_path      = path.join(PTests.folder_test_path,this.relative_path)
      this.initializeReportFile()
      // this.append = this.appendToFile.bind(this)
    }
    else
    {
      this.container = document.getElementById(PTEST_RESULTS_SECTION_ID)
      // this.append = this.container.appendChild
    }
  }

  append (ajout)
  {
    if ( this.asIntegrationTest)
    {
      // console.log('[Report#append] Texte ajouté au fichier :',ajout)
      this.appendToFile.bind(this, ajout).call()
    }
    else
    {
      this.container.appendChild(ajout)
    }
  }

  init_tests () {
    this.nombre_total_cases = 0
    this.nombre_errors      = 0
    this.nombre_succes      = 0
    this.nombre_echecs      = 0
    this.nombre_pendings    = 0
  }

  /**
  * Ajouter le contenu +content+ dans le fichier HTML
  * @param  {HTMLString} content Contenu à ajouter au rapport
  **/
  appendToFile (content)
  {
    // console.log(`Ajouté au fichier ${this.full_path} :`,content)
    if ( 'string' !== typeof content){ content = content.outerHTML }
    fs.appendFileSync(this.full_path, content, 'utf8')
  }
  initializeReportFile ()
  {
    if(!this.asIntegrationTest){return}
    if (fs.existsSync(this.full_path)){fs.removeSync(this.full_path)}
    // Pour le moment, pour le fichier CSS, je me sers de l'adresse complète
    let cssfile = path.join(C.LIB_UTILS_FOLDER,'PTests.css')
    let html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>PTests-${this.relative_path}</title>
<link rel="stylesheet" href="${cssfile}">
</head><body>
<section id="${PTEST_RESULTS_SECTION_ID}">
    `
    this.appendToFile(html)
  }
  /**
  * La méthode suivante doit être appelée à la fin des tests pour "fermer"
  * le fichier rapport HTML créé en mode d'intégration et l'ouvrir dans le
  * navigateur.
  **/
  completeFileAndOpen ()
  {
    // console.log('-> Report#completeFileAndOpen (fermeture de la section#ptests-results)')
    if(!this.asIntegrationTest){return}
    this.appendToFile('</section></body></html>')
    let
        util = require('util')
      , exec = require('child_process').exec
    function puts(error, stdout, stderr) { console.log(stdout) }
    exec(`open -a Firefox "${this.full_path}"`, puts);
  }
}
/** ---------------------------------------------------------------------
  *
  *   LE WRITER
  *   ---------
  *   Classe chargée d'écrire les messages dans la fenêtre
  *
*** --------------------------------------------------------------------- */
class PTestsWriter
{
  constructor (container) {
    // On peut savoir si on est dans le test lorsque l'élément #
    this.container  = document.getElementById(container)
  }
  write_path ( filepath )
  { this.write_div( filepath,'file')    }
  write_describe (describe, tab_level)
  { this.write_div(describe,`describe tab${tab_level}`) }
  write_context (context, tab_level)
  { this.write_div(context,`context tab${tab_level}`)   }

  /**
  * Écrit une erreur dans le document, pour l'utilisateur-programmeur des
  * tests lorsqu'il fait une erreur. Par exemple, lorsqu'il tente de tester
  * l'existence d'un tableau dans une liste, ce qui n'est pas encore possible
  * le 28 juin 2017
  *
  * @param {String} errMessage Le message d'erreur à écrire.
  **/
  write_error ( errMessage )
  {
    this.write_div(errMessage, 'imperror')
  }

  /**
  * Méthode qui écrit vraiment le code +str+ dans le rapport
  *
  * Note : this.container n'est pas défini quand on est en test
  * d'intégration (qui sont justes en expérimental pour le moment)
  **/
  write_div(str, cname)
  {
    let div = document.createElement('div')
    div.className = `${cname}`
    div.innerHTML = str
    PTests.reporter.append(div)
  }

  /**
  * Après avoir fait passer toute la suite de tests on affiche le résumé
  **/
  write_final_resume ()
  {
    let
        report = PTests.reporter
      , divres = document.createElement('div')
      , nombre_pendings = report.nombre_pendings
      , s_test  = report.nombre_total_cases > 1 ? 's' : ''
      , s_fails = report.nombre_echecs > 1 ? 's' : ''
      , s_pends = nombre_pendings > 1 ? 's' : ''
      , c_pends = nombre_pendings > 0 ? ' pends' : ''

    divres.className = `resume_final ${report.nombre_echecs ? 'fail' : 'pass'}`

    divres.innerHTML = `
<span class="total_count">${report.nombre_total_cases} test${s_test}</span>
<span class="pass_count">${report.nombre_succes} success</span>
<span class="fail_count">${report.nombre_echecs} failure${s_fails}</span>
<span class="pend_count${c_pends}">${nombre_pendings} pending${s_pends}</span>
    `
    // this.container.appendChild(divres) // à l'origine
    PTests.reporter.append(divres)
  }
  /**
  * @param cas            {String} Le cas abordé (le describe).
  *                       {Array} [describe, contexte]
  * @param resultat_str   {String}
  * @param okCase         {Boolean} True si c'est bon
  *
  */
  write_case (the_it /* null quand sibling `and` */, iexpect)
  {
    // console.log(`-> write_case (du it-case “${the_it.description}”)`)
    let
        context
      , tab_level     = PTests.options.one_line_describe ? 2 : iexpect.it.tab_level
      , resultat_str  = iexpect.returnedMessage
      , okCase        = iexpect.isOK

    PTests.reporter.nombre_total_cases += 1
    if ( okCase ) { PTests.reporter.nombre_succes += 1 }
    else { PTests.reporter.nombre_echecs += 1 }

    // Le div principal du cas
    let
          divcase = document.createElement('div')
        , css = ['case']
    css.push(`tab${tab_level}`)
    css.push(okCase ? 'pass' : 'fail')
    if ( iexpect.real_previous_expect ) css.push('sib')
    divcase.className = css.join(' ')

    // Le libellé supérieur (sauf si null — cas d'un sibling `and`)
    if ( the_it )
    {
      let libelle = document.createElement('div')
      libelle.className = 'lib'
      libelle.innerHTML = the_it.description
      divcase.appendChild(libelle)
    }

    // console.log('Resultat string à écrire', resultat_str)
    divcase.appendChild(this.builtMessage(resultat_str, okCase))

    PTests.reporter.append(divcase)
  }

  write (message, type)
  {
    let cl
    this.className  = cl
    this.message    = message
    // this.container.appendChild(this.builtMessage(message, type))//originalement
    PTests.reporter.append(this.builtMessage(message, type))
  }
  builtMessage (message, okCase)
  {
    let child = document.createElement('div')
    child.className = this.classNameFor(okCase)
    child.innerHTML = message
    return child
  }
  classNameFor (type)
  {
    switch(type)
    {
      case true: // succès
        return 'pass'
      case false: // échec
        return 'fail'
      default:
        return type || 'notice'
    }
  }
}

// ---------------------------------------------------------------------


/**
* Fonction générale qui permet d'obtenir le numéro de ligne d'une erreur
* ou autre.
* @usage:

  let erreur, stackErreur
  try{throw new VoluntaryTestError('Erreur volontaire')}
  catch(err){ erreur = err }
  let [line, column] = getErrorLineInStack(erreur.stack, this.file.path)

* @param  {Array} stackErreur Error's stack
* @param  {String} fpath  Full path of file for which error must be found
* @return [{Number},{Number}] line number and column number
**/
function getErrorLineInStack (stackErreur, fpath)
{
  let
        stacks    = stackErreur.split('at ').slice(3,12)
      , lenStacks = stacks.length
      , i         = 0
      , my        = this
      , sline, errLine, errColumn
      , errLines = []

  for(; i < lenStacks ; ++i )
  {
    sline = stacks[i].trim()
    sline.replace(/^(.*?) \((.*?):([0-9]+):([0-9]+)\)$/, function(a,m,f,l,c){
      // Le premier fichier qui correspond au fichier courant est le bon
      // Mais maintenant, on relève tous les numéros d'erreurs dans le fichier
      // pour gérer les fonctions de simplification de code qui seraient
      // utilisées dans les tests
      if (f.trim() == fpath) {
        errLine = l; errColumn = c
        errLines.push({line: l, column: c})
      }
      return ''
    })
    // if ( errLine ) break // non, pour toutes les prendre
  }
  if ( errLine ) {
    return errLines
    // return [errLine, errColumn]
  }
  else
  {
    return null
    // return [null, null]
  }
}


if ( 'undefined' != typeof document )
{
  ipc.on('run-autotest', (evt) => {
    PTests.autotest()
  })
  .on('run-tests', (evt) => {
    PTests.run()
  })

  let timer = setInterval(
  function(){
  if ('complete' === document.readyState)
  {clearInterval(timer)
    // Quand la page est prête
    ipc.send('ptests-ready')
  }},100)
}// /fin de si `document` est défini


/** ---------------------------------------------------------------------
  *
  *   Class PTestContainer
  *   --------------------
  *   Classe qui sera étendue pour créer les classes
  *     DescribeClass, ContextClass et ItClass
  *
***/
class PTestContainer {
  //
  // Note : `ItClass` a son propre constructeur, car il n'a pas d'enfants
  // mais une fonction.
  //
  //
  /**
  * @param  {String} desc. Si elle ne commence pas par un '::' un '#' ou un '.',
  *         on lui ajoute systématiquement une espace pour l'affichage en
  *         une seule ligne.
  * @param  {Array} Les enfants du conteneur.
  **/
  constructor (desc, children)
  {
    desc = desc.trim()
    let firstC = desc.substr(0,1)
    if ( [':','#','.'].indexOf(firstC) < 0 ) desc = ` ${desc}`
    this.description  = desc
    this.owner        = null
    this.tab_level    = null
    if ( children )
    {
      // Les enfants peuvent commencer par un élément vide (pour la virgule
      // qu'on met toujours)
      if ( children.length == 0 ) { children = null }
      else if ( ! children[0] ) { children.shift() }
      this.children = children
      if ( children ) { this.traite_children() }
    }
  }
  /**
  * On définit le owner des enfants (on en a besoin plus tard)
  **/
  traite_children ()
  {
    for(let i in this.children){ this.children[i].owner = this }
  }
  /**
  *   On traite les enfants, c'est-à-dire qu'on
  *   définit leur owner et leur tab_level. Cela permettra de savoir
  *   ce qu'il faut lancer après la lecture du test
  **/
  define_tab_level_children ()
  {
    if ( ! this.children ) { return }
    if ( ! this.tab_level ) { this.tab_level = 0 }
    let i , child
    for( i in this.children )
    {
      child = this.children[i]
      child.tab_level = this.tab_level + 1
      child.owner     = this
      child.define_tab_level_children()
    }
  }
  // Jouer le describe ou le context revient à jouer ses enfants en
  // définissant leur possesseur (pas forcément utile mais pourra servir)
  // et surtout leur tab-level.
  // Lorsque cet enfant est un `it`, il est runné avec sa propre méthode
  run ()
  {
    if ( PTests.option('one_line_describe') )
    {
      if ( this.children && this.children[0].type == 'it')
      {
        // <= a des enfants et le premier est un 'it'
        // => On écrit le titre en remontant les parents
        let des = [this.description], parent = this.owner
        while ( parent ) {
          des.push(parent.description)
          parent = parent.owner
        }
        PTests.writer[`write_describe`](des.reverse().join(''), 0)
      }
    }
    else
    { // <= pas de it en une ligne
      PTests.writer[`write_${this.type}`](this.description, this.tab_level)
    }
    if ( this.children ) { this.children.forEach(c => c.run()) }
  }
  /** ---------------------------------------------------------------------
    *
    *   CLASSE (PTestContainer)
    *
  *** --------------------------------------------------------------------- */

  // Liste des Classes qui étendent cette classe
  static get CLASS_LIST () { return [DescribeClass, ContextClass, ItClass]}

  /**
  * Initialisation faite avant chaque require de feuille de test
  **/
  static init ()
  {
    this.CLASS_LIST.forEach( classe => { classe._list = [] } )
  }

  /**
  *  Ajout d'une instance dans une des classes
  **/
  static add ( instance )
  {
    if ( undefined === this._list ) { this._list = []}
    this._list.push(instance)
    return instance // pour simplifier le code de initialize
  }
  static get list () { return (this._list || []) }


  /**
  *   Méthode générale qui définit les tab-levels de tous les enfants
  *
  *   Principe : on part de chaque élément sans parent (owner = null) et on
  *   traite les enfants en descendant.
  *   En plus de ça, on définit les 'it' des expects pour les 'it's
  **/
  static define_tab_levels ()
  {
    this.CLASS_LIST.forEach( (classe) => {
      classe.list.forEach(d => { if(!d.owner){d.define_tab_level_children.bind(d)()} })
    })
  }
  /**
  *   Main méthode qui joue les tests de la feuille de tests
  *   -------------------------------------------------------
  *   Ce sont les tests sans parent (owner) qu'on run dans
  *   l'ordre d'importance des classes : describe, context, it
  **/
  static run_lists ()
  {
    this.CLASS_LIST.forEach( (classe) => {
      classe.list.forEach( d => {if(!d.owner){d.run()}})
    })
  }
}

/** ---------------------------------------------------------------------
  *
  *   DescribeClass
  *
*** --------------------------------------------------------------------- */
class DescribeClass extends PTestContainer
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE (DescribeClass)
    *
  *** --------------------------------------------------------------------- */
  static get type () { return 'describe'  }
  static initialize (description, children)
  {
    return DescribeClass.add(new DescribeClass(description, children))
  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE (DescribeClass)
    *
  *** --------------------------------------------------------------------- */

  get type        () { return 'describe'  }
  get level_type  () { return 1           }
}

/** ---------------------------------------------------------------------
  *
  *   ContextClass
  *
*** --------------------------------------------------------------------- */
class ContextClass extends PTestContainer
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE (ContextClass)
    *
  *** --------------------------------------------------------------------- */
  static get type () { return 'context'  }
  static initialize (description, children)
  {
    return ContextClass.add(new ContextClass(description, children))
  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE (ContextClass)
    *
  *** --------------------------------------------------------------------- */
  get type        () { return 'context' }
  get level_type  () { return 2         }

}
/** ---------------------------------------------------------------------
  *
  *   ItClass
  *
*** --------------------------------------------------------------------- */
class ItClass extends PTestContainer
{
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE (ItClass)
    *
  *** --------------------------------------------------------------------- */
  constructor (description, methode)
  {
    // console.log(`Nouveau it-case : ${description}`)
    super(description, null /* pas d'enfant */)
    this.test_method  = methode
    this.expectations = []
    this.printed      = false // mis à true quand écrit avec une expectation
    this.file         = PTests.current_file // pour before/after Each
  }
  get type        () { return 'it' }
  get level_type  () { return 3    }

  // On joue la méthode du 'it'
  run ()
  {
    ItClass.current = this
    try
    {
      // puts("-> je vais runner le it-case")
      if ( this.hasBeforeEach ) { this.runBeforeEach() }
      this.test_method.call()
      if ( this.hasAfterEach  ) { this.runAfterEach() }
      // puts("<- j'ai runné le it-case")
    }
    catch(erreur)
    {
      let errName = erreur.constructor.name
      console.log("ERREUR NAME : ", errName)
      // puts("-> j'ai obtenu une erreur dans le it-case")
      // Quand on rencontre une expectation qui n'est pas remplie, on
      // provoque une erreur pour quitter le it-case

      // On enregistre toujours l'erreur, quelle qu'elle soit, pour un
      // affichage final. Mais peut-être que cet enregistrement va faire
      // doublon avec celui de l'échec. Il faudrait peut-être ajouter
      // l'erreur seulement lorsqu'elle n'est pas d'un type connu comme
      // PTestsError
      if ( ['PTestsError', 'PTestsExpectationError'].indexOf(errName) < 0 )
      {
        PTests.add_error(erreur)
      }

      // Mais il se peut aussi que ce soit une erreur de programmation. Dans
      // ce cas, on exit l'application.
      if ( erreur.constructor.name === 'TypeError') {
        // Pour avoir une erreur plus précise
        throw(erreur)
        throw(erreur.stack)
      }
    }
  }

  // success (mess) {
  //   console.log("J'appelle un succès")
  // }

  get hasBeforeEach () {
    if ( !this.file ){return false}
    return 'function' === typeof this.file.beforeEach
  }
  get hasAfterEach  () {
    if ( !this.file ){return false}
    return 'function' === typeof this.file.afterEach
  }
  runBeforeEach () {
    if ( !this.file ){return false}
    this.file.beforeEach.call(this)
  }
  runAfterEach  () {
    if ( !this.file ){return false}
    this.file.afterEach.call(this)
  }

  /**
  * Pour ajouter une expectation dans ce `it`.
  * Cette méthode permet pour le moment de savoir s'il faut répéter
  * le `it` ou lier le texte des expects.
  * Mais plus tard, peut-être qu'on pourra faire un rendu plus travaillé
  * @param  {PTestExpectObject} iexpect L'expectation qu'il faut ajouter
  * @return L'index de l'expectation ajoutée
  **/
  addExpectation (iexpect)
  {
    this.expectations.push(iexpect)
    return this.expectations.length - 1
  }

  /** ---------------------------------------------------------------------
    *
    *   CLASSE (ItClass)
    *
  *** --------------------------------------------------------------------- */
  static get type () { return 'it' }
  static initialize (description, methode)
  { return ItClass.add(new ItClass(description, methode)) }

}


/** ---------------------------------------------------------------------
  *   Class PTestPendingObject (pending)
  *
*** --------------------------------------------------------------------- */

class PTestPendingObject
{
  constructor ( message, itcase )
  {
    this.file     = PTests.current_file // Instance {PTestFile}
    this.itcase   = itcase
    this.message  = message || 'à implémenter'
    PTests.add_pending(this)
    this.numero   = null // fixé au moment de l'inscription
    this._line = this.getPendingLine()
    PTests.writer.write_div(`-- pending: ${this.message} (${this.file.as_link_to_line(this.line)})`,'tab2 pending')
  }

  /**
  * @return {Number}  Le numéro de ligne où est inscrit le pending, pour
  *                   pouvoir l'atteindre plus facilement.
  **/
  get line ()
  {
    if (undefined === this._line){this._line = this.getPendingLine()}
    return this._line
  }
  /**
  *   Définit le numéro de la ligne de test ou l'erreur s'est produite
  *   et renseigne this.errLine
  **/
  getPendingLine()
  {
    // On récupère la ligne de l'erreur
    let erreur
    try{throw new VoluntaryTestError('Erreur volontaire')}
    catch(err){ erreur = err }
    this.errLines = getErrorLineInStack(erreur.stack, this.file.path)
    if ( this.errLines[0] ){ return this.errLines[0].line }
    else { return null }
  }

  /**
  * Returne, pour le message d'erreur, les autres numéros de lignes trouvés
  * dans le stack du pending
  **/
  other_error_lines () {
    if (this.errLines && this.errLines.length > 1){
      let lines = []
      for(let i=1;i<this.errLines.length;++i){
        lines.push(this.errLines[i].line)
      }
      return ` (also lines: ${lines.join(', ')})`
    }else{return ''}
  }

  /**
  *   @return {StringHTML} Code HTML du message de pending en résumé de test
  **/
  as_full_pending ()
  {
    return `
<div class="pending-after-resume">
<div><span class="err-numero">${this.numero}</span><span class="file">${this.file.as_link_to_line(this.line)}</span>${this.other_error_lines()}</div>
<div class="error">it("${this.itcase.description.trim()}") : ${this.message}</div>
</div>
`
  }

}




/** ---------------------------------------------------------------------
  *
  * OBJET EXPECT
  *
  * Ici sont définis toutes les méthodes utilisées dans les "cases"
  *
*** --------------------------------------------------------------------- */

class PTestExpectObject
{

  /**
  * Check les attributs d'un élément DOM
  * @param  {Object} {attr: valeur} L'attribut et la valeur à trouver
  *                   Peut définir plusieurs attributs, même avec `attribute`
  *                   au singulier
  **/
  attribute ()
  {
    this.__prepare_evalutation(arguments)
    if ( this.auxiliaire == 'avoir')
    {
      let odom = this.getActualAsNode()
      try
      {
        if (!odom){throw new PTestsError('est introuvable')}
        if (!odom.hasAttributes()){throw new PTestsError('ne possède pas d’attributs')}
        this.resultat_droit = true // on suppose que c'est bon
        for(let attr in this.expect){
          if (odom.getAttribute(attr) !== this.expect[attr]){
            this.resultat_droit = false
            break
          }
        }
        this.verb_comparaison   = 'possède'
        this.noEstMessage       = true // ajoutera les "ne… pas" en cas de besoin
        this.preposition_expect = 'les attributs HTML '
      }
      catch(erreur)
      {
        this.resultat_droit = false
        this.positive = true
        if(!this.options.template){this.options.template={}}
        this.options.template.failure = `L'élément DOM ${this.actual} ${erreur.message}`
      }
    }
    return this.writeCase()
  }

  /**
  * Produit un succès si actual est entre les éléments fournis par expect
  * Produit un échec dans le cas contraire.
  *
  * La méthode est sensible au strict.
  *
  **/
  between () // expect, expect_str, options
  {
    this.__prepare_evalutation(arguments)
    if ( this.checkBetweenArgs() )
    {
      let
          [first, second] = this.expect
        , res
      this._expect_str  = arguments[1] || `${first} et ${second}`
      this.noType       = true // pas de type dans les messages de résultat

      if ( this.strict ) {
        res = this.actual > first && this.actual < second
      } else {
        res = this.actual >= first && this.actual <= second
      }
      this.resultat_droit     = res
      this.verb_comparaison   = 'entre'
      this.preposition_expect = ''
    }
    return this.writeCase()
  }

  classMethod ()
  {
    this.__prepare_evalutation(arguments)
    if ( this.checkObjectAndMethodArgs('classMethod') )
    {
      this.resultat_droit     = 'function' === typeof this.actual[this.expect]
      this.verb_comparaison   = 'répond'
      this.preposition_expect = 'à la méthode de classe '
      this.noEstMessage       = true
    }
    return this.writeCase()
  }

  /**
  * Check si l'actual est un élément de class expect
  **/
  classOf ()
  {
    this.__prepare_evalutation(arguments)
    this.verb_comparaison   = 'de classe'
    this.preposition_expect = ''
    let actual_class = new Any(this.actual).class
    this.resultat_droit     =  actual_class == this.expect
    this.add_on_failure     = `(__ACTUAL__ est de classe ${actual_class})`
    return this.writeCase()
  }

  contain ()
  {
    this.__prepare_evalutation(arguments)

    this.noEstMessage       = true // ajoutera les "ne… pas" en cas de besoin
    this.verb_comparaison   = 'contient'
    this.preposition_expect = ''
    if      ( this.isFile )   { this.containForFile()   }
    else if ( this.isFolder ) { this.containForFolder() }
    else
    {
      this.resultat_droit = Any.isContainedBy(this.expect, this.actual, {strict: this.strict, deep: this.deep})
    }
    return this.writeCase() // Retourne encore l'instance courante
  }

  /**
  * Évalue le fait que le texte d'un fichier contient un string ou un
  * ensemble de strings.
  **/
  containForFile ()
  {
    // log('-> PTestExpectObject # containForFile')
    if ( this.checkContainArgsWhenFiles() )
    {
      let file_contents = fs.readFileSync(this.actual,{encoding:'utf8'})
      this.resultat_droit = Any.isContainedBy(this.expect, file_contents, this.strict)
      if ( false === this.resultat_droit && Array.isArray(this.expect))
      { // Il faut récupérer les bouts de messages conçu par Any
        this.options.template[this.isOK?'success':'failure'] = `__ACTUAL__ ${Any.containityError}`
      }
    }
  }

  containForFolder ()
  {
    if ( this.checkContainArgsWhenFiles() )
    {
      let fnames = fs.readdirSync(this.actual, {encoding:'utf8'})
      // log('Liste des fichiers :', fnames)
      this.resultat_droit = Any.isContainedBy(this.expect, fnames, this.strict)
      // On doit construire un message propre
      let
          m
        , ok = this.resultat_droit
        , po = this.positive

      m = `le dossier ${this.actual} `
      m += ( ok == po ) ? 'contient' : 'ne contient pas'
      if ( Array.isArray(this.expect) )
      {
        let reflist = ok ? this.expect : Any.containityLacks
        if (reflist.length > 1) { m += ` les éléments ${reflist.join(', ')}`}
        else { m += ` l’élément ${reflist[0]}`}
      }
      else
      {
        m += ` l’élément ${this.expect}`
      }
      this.options.template[this.isOK ? 'success' : 'failure'] = m
    }
  }

  equal () // cf. Note0001
  {
    this.__prepare_evalutation(arguments)
    this.resultat_droit = Any.areEqual(this.actual, this.expect, {strict: this.strict, diff: this.options.diff})
    this.verb_comparaison = 'égal'
    if ( this.options.diff && !this.resultat_droit )
    {
      // Si l'option diff est à true, on doit ajouter le détail de la différence entre
      // les deux à la fin du message
      this.add_on_failure = '<br><br><span style="text-decoration:underline">Différences</span><br><br>' + Any.equalityError.replace(/\n/g,'<br>')
    }
    // En cas d'égalité, on n'écrit pas la valeur de l'expect dans le cas où
    // une valeur-pseudo est transmise
    if ( this.resultat_droit ) { this.options.no_right_value = true }
    return this.writeCase()
  }

  get exist ()
  {
    this.__prepare_evalutation(arguments)
    // let fs = require('fs')

    if ( this.isFile || this.isFolder )
    {
      this.resultat_droit = fs.existsSync(this.actual)
      this.noEstMessage       = true
      this.preposition_expect = ''
      this.verb_comparaison   = 'existe'
    }
    else if ( this.isNode )
    {
      let odom = this.getActualAsNode()
      this.resultat_droit = (null != odom)
      this.noEstMessage       = true
      this.preposition_expect = ''
      this.verb_comparaison   = 'existe'
    }
    else
    {
      this.resultat_droit = false
      if (undefined === this.options.template){this.options.template={}}
      this.options.template.failure = `Impossible d’utiliser le test 'exist' avec ${this.actual}::${typeof this.actual}::${this.actual.constructor.name}`
    }
    return this.writeCase()
  }

  greater_than () // value, value_str, options
  {
    this.__prepare_evalutation(arguments)

    this.alt_strict       = ' égal ou'
    this.verb_comparaison = 'supérieur'
    this.noType           = true // pas de type dans les messages de résultat

    // Comparaison
    this.resultat_droit = this.strict ? this.actual > this.expect : this.actual >= this.expect

    return this.writeCase()
  }

  have_tag ()
  {
    // Exceptionnellement, pour cette balise, les deux premiers arguments
    // doivent être rassemblés
    let [tag,attrs,expstr,opts] = arguments
    if(!attrs){attrs = {}}
    attrs.tag = tag
    let args = [attrs,expstr,opts]
    this.__prepare_evalutation(args)

    this.isHTML             = true // Pour transformer les balises
    this.noEstMessage       = true
    this.verb_comparaison   = 'contient'
    this.preposition_expect = ''
    this.noType             = true // pas de type dans les messages de résultat
    this.resultat_droit     = this.actualTagContainsExpect()

    return this.writeCase()
  }

  instanceMethod ()
  {
    this.__prepare_evalutation(arguments)
    if ( this.checkObjectAndMethodArgs('instanceMethod') )
    {
      let inst
      if ( ! this.isInstance ) { inst = new this.actual() }
      else { inst = this.actual }

      this.resultat_droit     = 'function' === typeof inst[this.expect]
      this.verb_comparaison   = 'répond'
      this.preposition_expect = 'à la méthode d’instance '
      this.noEstMessage       = true
    }
    return this.writeCase()
  }


  less_than () // expect, expect_str, options
  {
    this.__prepare_evalutation(arguments)

    // Comparaison
    this.resultat_droit = this.strict ? this.actual < this.expect : this.actual <= this.expect

    this.alt_strict       = ' égal ou'
    this.verb_comparaison = 'inférieur'
    this.noType           = true // pas de type dans les messages de résultat

    return this.writeCase()
  }


  /**
  * On peut savoir si this.actual est une classe ou une instance en testant
  * son constructor.name
  **/
  respond_to ( exp, exp_str, opts )
  {
    this.isInstance = this.actual.constructor.name !== 'Function'
    if ( this.isInstance )
    {
      return this.instanceMethod(exp, exp_str, opts)
    }
    else
    {
      return this.classMethod(exp, exp_str, opts)
    }
  }

  // Semblable à equal, mais le verbe est différent
  returns () // cf. Note0001
  {
    this.__prepare_evalutation(arguments)
    this.resultat_droit     = Any.areEqual(this.actual, this.expect, {strict: this.strict})
    this.noEstMessage       = true
    this.verb_comparaison   = 'retourne'
    this.preposition_expect = ''
    // En cas d'égalité, on n'écrit pas la valeur de l'expect dans le cas où
    // une valeur-pseudo est transmise
    if ( this.resultat_droit ) { this.options.no_left_value = true }
    return this.writeCase()
  }


  throwError ()
  {
    this.__prepare_evalutation(arguments)
    // Le premier argument doit être une méthode
    if ( 'function' != typeof this.actual ) { return throwError('Le premier argument de l’expectation doit être une fonction (jouant simplement le code devant produire l’erreur)')}
    // On met de côté la méthode global throwError
    let
          oldThrowErrorFunction = throwError
        , my = this

    global.throwError = function(message){my.messageErreur = message}
    let res = this.actual.call()
    global.throwError = oldThrowErrorFunction
    // --- On remet la méthode globale pour revenir à l'état précédent
    // log('my.messageErreur = ', my.messageErreur)
    this.resultat_droit = Any.areEqual(my.messageErreur, this.expect)
    this.options.template = {
      success:`Le message d’erreur est bien « ${this.expect} »`
    , failure:`Le message d’erreur devrait être « ${this.expect} », mais il est « ${my.messageErreur} »`
    }
    return this.writeCase()
  }

  /**
  * Méthode d'intégration qui teste la valeur d'un élément DOM.
  * @example  expect('mon-champ').asNode.to.have.value('sa-valeur')
  **/
  value ()
  {
    this.__prepare_evalutation(arguments)
    let odom = this.getActualAsNode()
    try
    {
      if(!odom){throw new PTestsErrot('est introuvable')}
      this.resultat_droit     = Any.areEqual(odom.value,this.expect,this.strict)
      this.verb_comparaison   = 'a'
      this.noEstMessage       = true
      this.preposition_expect = 'pour valeur '
    }
    catch(erreur)
    {
      log(erreur)
      console.log(erreur)
      this.resultat_droit = false
      this.positive       = true
      if(undefined==this.options.template){this.options.template={}}
      this.options.template.failure = `l'élément DOM '${this.actual} ${erreur.message}'`
    }
    return this.writeCase()
  }

  //  /Fin des méthodes de test
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // Méthodes privées servant aux méthodes de comparaison

  /* Private */

  /**
  * Méthode appelée en cas de throw volontaire dans une méthode de test.
  * Elle met this.resultat_droit à false, console-log l'erreur si elle est
  * inattendue et retourne false.
  *
  * @param {Error} erreur Soit une erreur d'expectation connue, identifiée
  * par la classe {PTestsExpectationError} soit une erreur de programmation,
  * dont on met l'erreur dans la console, pour correction, en avertissant
  * le programmer
  * @return false pour pouvoir utiliser `return this.traiteErreurInCheck(err)`
  **/
  traiteErreurInCheck (erreur)
  {
    this.options.template.failure = erreur.message
    this.resultat_droit = false
    if (erreur.constructor.name != 'PTestsExpectationError'){
      log("ERREUR : ",erreur.message)
      log(erreur.stack)
      try{puts("Une erreur inattendue a été logguée en console.")}catch(err){}
    }
    return false
  }

  // /**
  // * Vérification des arguments envoyés lorsque la méthode have_tag est
  // * invoquée
  // **/
  // checkHaveTagArgs ()
  // {
  //
  // }

  /**
  * Méthode de comparaison qui renvoie true si le code actual (string ou
  * HTMLElement) contient le tableau expect contenant les attributs et
  * la tagName.
  * @return true si actual contient expect
  **/
  actualTagContainsExpect ()
  {
    this.options.realTest = true
    let res = PTestsDOM.actualTagContainsExpect(this.actual, this.expect, this.options)
    if ( false == res.success )
    {
      if ( 'expectation' === res.errorType )
      {
        // throw new PTestsExpectationError(res.message)
        // Pour le moment, on met le message d'erreur en template
        this.options.template.failure = res.message
      }

    }
    return res.success
  }

  /**
  * Vérification des arguments envoyés lorsque la méthode contain est
  * utilisée contre des fichiers ou dossiers.
  **/
  checkContainArgsWhenFiles ()
  {
    this.initTemplateIfNeeded()
    try
    {
      if ( 'string' != typeof this.actual ) { throw new Error('le premier argument doit être le path du fichier/dossier, en String')}
      if ( false === fs.existsSync(this.actual) ){
        throw new PTestsExpectationError(`le ${this.isFile?'fichier':'dossier'} ${this.actual} est introuvable`)
      }
      if ( '' === this.expect )
      {
        throw new PTestsExpectationError('le texte recherché ne peut pas être une chaine vide !')
      }
      let exp = new Any(this.expect)
      if ( ['string','regexp','array'].indexOf(exp.class) > -1 )
      {
        // OK
        if ( Array.isArray(this.expect) )
        {
          this.expect.forEach( (el) => {
            if ('string' !== typeof el ){
              throw new PTestsExpectationError('les éléments de la liste de recherche doivent impérativement être des strings ou des expressions régulières')
            }
          })
        }
      }
      else
      {
        // Not OK
        throw new PTestsExpectationError('le premier argument de la méthode de comparaison doit être un String, une expression régulière ou une liste de Strings ou d’expressions régulières')
      }
    }
    catch(erreur)
    {
      return this.traiteErreurInCheck(erreur)
    }
    return true
  }

  /**
  * Initialize l'option `template` si nécessaire (en général avant
  * de définir des messages de success et de failure)
  **/
  initTemplateIfNeeded ()
  {
    if (undefined === this.options.template){this.options.template={}}
  }

  /**
  * @return true si actual et expect sont conformes pour la méthode
  *         de comparaison between. false dans le cas contraire et
  *         produit un message d'erreur
  **/
  checkBetweenArgs ()
  {
    this.initTemplateIfNeeded()

    try {

      if ( ['number','string'].indexOf(typeof this.actual) < 0 )
      {
        throw new Error('le premier argument devrait être un Number ou un String')
      }

      if ( false == Array.isArray(this.expect) )
      {
        throw new Error('le premier argument de la méthode de comparaison doit être une liste')
      }

      if ( typeof(this.actual) != typeof(this.expect[0]))
      {
        throw new Error('l’actual doit être de même type que les éléments de comparaison')
      }

      if ( this.expect.length != 2 )
      {
        throw new Error('le premier argument de la méthode de comparaison doit être une liste de 2 arguments ([max,min])')
      }

      if ( this.expect[0] > this.expect[1] )
      {
        throw new Error('le second élément de la liste de comparaison est inférieur au premier')
      }

    } catch (erreur) {

      return this.traiteErreurInCheck(erreur)

    }

    return true
  }
  checkObjectAndMethodArgs (typeMethod)
  {
    if ( 'function' !== typeof this.actual && undefined === this.Classe)
    {
      this.resultat_droit = false
      if (undefined ==this.options.template){this.options.template={}}
      this.options.template.success = `Ça ne peut pas être une méthode puisque le premier argument de l’expectation n’est pas une classe.`
      this.options.template.failure = 'le premier argument de l’expectation doit être une classe'
      return false
    }
    if ( 'string' !== typeof this.expect )
    {
      this.resultat_droit = false
      if (undefined==this.options.template){this.options.template={}}
      this.options.template.success=`le premier argument de la méthode de comparaison '${typeMethod}' n’est pas le nom String de la méthode.`
      this.options.template.failure=`le premier argument de la méthode de comparaison '${typeMethod}' doit être le nom String de la méthode.`
      return false
    }
    return true // OK
  }

  getActualAsNode () {
    let node
    if      ( this.isNodeId   ) { node = document.getElementById(this.actual) }
    else if (this.isNodeClass ) { node = document.getElementsByClassName(this.actual)[0] }
    else if (this.isNodeTag   ) { node = document.getElementsByTagName(this.actual)[0]}
    else if (this.isNode      ) { node = document.querySelector(this.actual)}
    else { throw new PTestsError(`Impossible de savoir comment trouver le nœud ${this.actual}`)}
    // if (! node)
    // {
    //   node = document.querySelector(this.actual)
    // }
    return node
  }

  // ---------------------------------------------------------------------


  /**
  *   Instanciation d'une expectation {PTestExpectObject}
  *
  * @param actual   La valeur actuelle, à comparer
  * @param actual_str   La valeur-pseudo, {String} qui pourra remplacer la
  *                     valeur réelle dans le message.
  *                     Note : cette valeur peut être omise, dans lequel cas
  *                     le deuxième argument seront les options.
  * @param options  Les options de traitement, quand elles ne peuvent pas
  *                 être transmises par la méthode de comparaison.
  * @param itcase   Quoi qu'il arrive, le dernier argument est toujours
  *                 le it-case qui contient l'expectation.
  * @constructor
  **/
  constructor ( actual, actual_str, options, itcase )
  {

    if ( 'string' !== typeof actual_str )
    { // <= La valeur-pseudo n'est ps fournie
      options     = actual_str
      actual_str  = undefined
    }

    this.actual       = actual
    this.actual_str_provided  = actual_str
    this.file         = PTests.current_file // Instance {PTestFile}
    this.it           = itcase   // Instance {ItClass}
    this.positive     = true
    this.strict       = false


    this.defineDefaultOptions(options, String(actual_str))

    // On ajoute cette expecation dans le it en récupérant l'index
    // de l'expectation courante (la plupart du temps, c'est 0)
    // Attention, il ne faut pas confondre cet index avec la notion
    // de sibling. Les `siblings` sont des frères liés par `and` alors
    // qu'ici ce sont simplement des `expect`(s) qui se suivent dans le
    // même `it`
    this.expect_index = itcase.addExpectation(this)
  }

  get type () { return 'expectation' }

  /**
  * @return true si cette expectation est un vrai test dont le résultat
  *         doit apparaitre dans le rapport. Sinon, c'est un test comme on
  *         peut en faire dans le test de PTests pour tester le testeur
  *         lui-même.
  **/
  get isTest () { return true !== this.options.not_a_test }


  get previous_expect () {
    if ( this.expect_index == 0 ) { return undefined }
    return this.it.expectations[this.expect_index - 1]
  }

  /**
  * @return {PTestExpectClass}  ou null. L'expectation réelle qui précède
  *                             cette expectation.
  **/
  get real_previous_expect ()
  {
    if ( undefined === this._real_previous_expect )
    { this._real_previous_expect = this.getRealPreviousExpect() }
    return this._real_previous_expect
  }
  getRealPreviousExpect ()
  {
    let i, iexp
    if ( this.expect_index ) {
      for (i = this.expect_index - 1 ; i >= 0 ; --i ){
        iexp = this.it.expectations[i]
        // Si l'expectation précédente était en mode 'only on fail' et
        // qu'elle a réussi, on ne peut pas la prendre comme expectation
        // précédente
        if (iexp.isTest)
        {
          if (iexp.onlyOnFail && iexp.isOK) { continue }
          // On peut prendre cette expectation
          return iexp
        }
      }
    }
    return undefined
  }

  /**
  * Returne, pour le message d'erreur, les autres numéros de lignes trouvés
  * dans le stack du pending
  **/
  other_error_lines () {
    if (this.errLines && this.errLines.length > 1){
      let lines = []
      for(let i=1;i<this.errLines.length;++i){
        let numLine = this.errLines[i].line
        lines.push(this.file.as_link_to_line(numLine, String(numLine)))
      }
      return ` (or lines: ${lines.join(', ')})`
    }else{return ''}
  }

  get onlyOnFail () { return true === this.options.only_on_fail }
  /**
  *   @return {StringHTML} Code HTML du message d'erreur en résumé de test
  **/
  as_full_error ()
  {
    return `
<div class="error-after-resume">
<div><span class="err-numero">${this.numero}</span><span class="file">${this.file.as_link_to_line(this.errLine)}</span>${this.other_error_lines()}</div>
<div class="error">it(${this.it}) => ${this.returnedMessage}</div>
</div>
`
  }

  // cf. aussi defineActualString et defineExpectString
  get expect_str () { return this._expect_str }
  get actual_str () { return this._actual_str }

  // Définit _actual_str pour utilisation dans les messages
  defineActualString ()
  {
    let ast

    if ( this.actual_str_provided )
    {
      ast = this.actual_str_provided
      if ( !this.options.no_values && !this.options.no_left_value) { ast += ` (${this.actual})` }
      return ast
    }
    else
    {
      switch ( true )
      {
        case this.isFile || this.isFolder :
          return `le ${this.isFile?'fichier':'dossier'} ${this.actual}`
        case this.isNode :
          return `le nœud DOM ${this.isNodeId?'#':(this.isNodeClass?'.':'')}${this.actual}`
        case this.isInstance :
          return `l’instance de ${this.actual.constructor.name}`
        default:
          return this.realValueToStringValue(this.actual)
      }
    }
  }
  defineExpectedString()
  {
    let vdef = this.expect_str_provided
    if ( vdef )
    {
      if ( !this.options.no_values && !this.options.no_right_value) { vdef += ` (${this.expect})` }
      return `${vdef}`
    }
    else
    {
      return this.realValueToStringValue(this.expect)
    }
  }
  /**
  * Prend une valeur quelconque, object, function, class, etc. et retourne un
  * string qui lui permet d'être inscrite dans les rapports de tests. Par exemple,
  * une classe renverra seulement « la class NomDeLaClasse »
  **/
  realValueToStringValue (realValue)
  {
    // log(`-> realValueToStringValue (actual = '${realValue}')`)
    if ( undefined  === realValue ) { return 'undefined' }
    if ( null       === realValue)  { return 'null' }
    if ( Array.isArray(realValue) )
    {
      // Quand la valeur est une liste, on retourne chaque valeur inspectée
      // avec un 'et' avant la dernière valeur.
      let
            arr = realValue.map( (e) => { return (new Any(e)).inspect() })
          , last = arr.pop()

      return `${arr.join(', ')} et ${last}`
    }
    switch(realValue.constructor.name)
    {
      case 'Number':
        return String(realValue)
      case 'String':
        return `« ${realValue.replace(/</g,'&lt;')} »`
      case 'Object':
        return JSON.stringify(realValue)
      case 'Function':
        let   actstr = String(realValue)
            , offset = actstr.indexOf('{')
        if (actstr.startsWith('class')){
          return `la class ${actstr.substring(5, offset - 1).trim()}`
        } else {
          return `Function ${String(realValue)}`
        }
        break
      default:
        return String(realValue)
    }

  }

  /**
  * Définit les options
  * -------------------
  * Noter que la méthode peut être appelée de deux endroit différents :
  * depuis la méthode de comparaison finale (comportement normal)  ou depuis
  * la méthode `expect` (nécessaire quand on utilise des méthodes de comparaison
  * final sans arguments — to.be.true, to.be.null, etc.)
  *
  * @param {Object} opts    Les options telles que fournies à l'expectation
  * @param {String} valeur_pseudo   Valeur pseudo fournie, soit pour l'actual
  *                                 soit pour l'expected. Elle permet de régler
  *                                 l'affichage de la valeur réelle ou non.
  *       Noter que puisque cette méthode est appelée aussi bien à l'interpré-
  *       tation de actual que de expected, la valeur pseudo peut être précisée
  *       soit pour l'actual que l'expected.
  **/
  defineDefaultOptions (opts, valeur_pseudo)
  {
    if ( !this.options ) { this.options = {} }

    // S'il y a un valeur-pseudo, on met par défaut qu'on ne doit pas afficher
    // la valeur, sauf si opts.values est true
    if ( valeur_pseudo ){
      if ( ! opts ) { opts = {} }
      if(undefined===opts.values && undefined===opts.no_value && undefined===opts.no_values){
        opts.no_values = true
      }
    }

    if ( ! opts ) { return }
    // Valeurs/clés modifiées
    if ( undefined !== opts.values    ) {
      opts.no_values = !opts.values; delete opts.values
    }
    if ( undefined !== opts.no_value  ) { opts.no_values  = opts.no_value }
    if ( undefined !== opts.NaT       ) { opts.not_a_test = opts.NaT      }
    if ( undefined !== opts.templates && undefined === opts.template )
    { opts.template = opts.templates ; delete opts.templates }
    // Dire de produire l'expectation qui s'il y a une failure, on peut le
    // préciser avec :
    //  - only_on_failure, only_on_fail et only_if_fail
    if ( (opts.only_on_failure || opts.only_if_fail) && undefined === opts.only_on_fail) {
      if( undefined !== opts.only_on_failure){
        opts.only_on_fail = !!opts.only_on_failure;
        delete opts.only_on_failure
      } else if ( undefined !== opts.only_if_fail ){
        opts.only_on_fail = !!opts.only_if_fail
        delete opts.only_if_fail
      }
    }
    // On passe tout dans this.options
    for(let k in opts){ this.options[k] = opts[k] }
  }
  /*
      Méthode générale qui traite les arguments de toute méthode de
      comparaison.
      Pour rappel, les arguments doivent se présenter ainsi :
           1     La valeur attendue (deviendra `this.expect`)
           2     [optionnel] La valeur attendue en format humain, pour le
                 message => this.expect_str
                 C'est ce qu'on appelle la "valeur-pseudo"
           3     [optionnel] Options :
                   template:success: "<message customisé en cas de succès>"
                   template:failure: "<message customisé en cas d'échec>"
                Noter que les options peuvent aussi avoir été passées en
                3e ou 2nd argument de la méthode `expect`
  */
  __prepare_evalutation (args)
  {
    let [exp, exp_str, opts] = args

    this.expect = exp

    if ( 'object' === typeof exp_str )
    {
      opts    = exp_str
      exp_str = undefined
    }

    // On met toujours options à {} pour simplifier le code ensuite
    this.defineDefaultOptions(opts, exp_str)

    /*  Évaluation du expect normal qui doit être pris */
    if ( this.actual_is_function )
    {
      if ( undefined === this._actual_str) { this._actual_str = `function ${this.actual}`}
      if ( this.actual_arguments )
      {
        // Evaluation avec arguments
        this.actual = this.actual.apply(this.actual_arguments)
      }
      else
      {
        // Évaluation sans arguments
        this.actual = this.actual.call()
      }
    }
    // On peut définir les éléments de messages
    // Noter que maintenant on ne définit expect_str qu'au moment de
    // construire le message, car sa valeur dépend de la réussite ou
    // non de l'expectation
    this.expect_str_provided = exp_str
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes fonctionnelles
    *   -----------------------
    *
  *** --------------------------------------------------------------------- */

  buildReturnedMessage ()
  {
    let
        m
      , neg
      , pos           = this.positive
      , strict        = this.strict
      // pour supprimer 'est' ou 'n'est pas', mais sera remplacé par
      // ne ... pas
      , noEst         = this.noEstMessage
      , withType      = strict && !this.noType
      , ok            = this.isOK
      , mkType        = withType ? ` {${this.actualType || typeof(this.actual)}}` : ''
      , mkStrict      = strict ? ' strictement' : (this.alt_strict || '')
      , mkVerbComp    = this.verb_comparaison
      , mkVerb

    if ( noEst )
    {
      if ( pos != ok ){
        neg = mkVerbComp.search(/^[aeéiou]/) < 0 ? 'ne ' : 'n’'
      }
      mkVerb      = (pos == ok) ? mkVerbComp : `${neg}${mkVerbComp} pas`
      mkVerbComp  = ''
    }
    else
    {
      mkVerb = (pos == ok) ? 'est' : 'n’est pas'
    }
    m = `${this.actual_str}${mkType} ${mkVerb}${mkStrict} ${mkVerbComp}`
    m = m.trim()

    if ( undefined !== this.expect ) {
      let
          expstr    = this.expect_str
        , mkExtType = withType ? ` {${this.expectType || typeof(this.expect)}}` : ''
        , prepo     = this.preposition_expect
      if ( prepo === undefined ) { prepo = 'à '}
      m += ` ${prepo}${expstr}${mkExtType}`
    }
    this._returned_message = m.trim()
  }

  /**
  *   Construit le message de résultat d'après le template fourni
  *
  *   @return {String}
  **/
  buildReturnedMessageFromTemplate ()
  {
    let m
    if ( this.isOK && this.options.template.success )
    {
      m = this.options.template.success
    }
    else if ( !this.isOK && this.options.template.failure )
    {
      m = this.options.template.failure
    }
    if ( m )
    {
      m = m.replace(/__ACTUAL__/, this.actual_str)
      m = m.replace(/__(EXPECTED|EXPECT)__/, this.expect_str)
      this._returned_message = m.trim()
    }
  }

  /**
  *   Ajout de la marque littéraire de début de résultat d'expectation.
  *   En temps normal, cette marque est "OK" ou "Erreur", mais lorsqu'il y
  *   a plusieurs expectations, on met quelques chose de plus "liant".
  *   La difficulté ici étant la gestion des cas où l'expectation suivante
  *   n'en est pas vraiment une (NotATest) et qu'il ne faut donc pas la
  *   compter.
  **/
  addMessageStart ()
  {
    let amorce, css, mark

    // Est-ce qu'il existe une vraie expectation avant (on saute les
    // NoteATest)
    if ( this.real_previous_expect ) {
      if ( this.isOK === this.real_previous_expect.isOK ) {
        [css, mark] = [(this.isOK ? 'et' : 'mais'), 'ET']
      } else {
        [css, mark] = [(this.isOK ? 'et' : 'mais'), 'MAIS']
      }
      amorce = `<span class="${css}">${mark}</span>`
    }
    else
    {
      amorce = this.isOK ? '<span class="ok">OK</span>' : `<span class="er">Erreur</span> line ${this.errLine}`
      amorce += ' '
    }
    this._returned_message = `${amorce} ${this._returned_message}`
  }

  addMessageEnd ()
  {
    if (this.add_on_failure && !this.isOK)
    {
      let m = this.add_on_failure
      m = m.replace(/__ACTUAL__/, this.actual_str)
      m = m.replace(/__(EXPECTED|EXPECT)__/, this.expect_str)
      this._returned_message += ` ${m}`
    }
  }
  /**
  *
  *   @return {String} Le message qui sera écrit dans la page pour
  *                    l'expectation courante.
  **/
  get returnedMessage ()
  {
    if ( undefined === this._returned_message )
    {
      // On peut définir expect_str maintenant qu'on connait le résultat
      // de l'expectation.
      if(!this._actual_str) { this._actual_str = this.defineActualString() }
      if(!this._expect_str) { this._expect_str = this.defineExpectedString() }
      if (this.isHTML){
        this._expect_str = this._expect_str.replace(/</g,'&lt;').replace(/>/g,'&gt;')
        this._actual_str = this._actual_str.replace(/</g,'&lt;').replace(/>/g,'&gt;')
      }
      if ( this.options.template )
      { this.buildReturnedMessageFromTemplate() }
      // Si le message de retour n'est toujours pas défini
      if ( undefined === this._returned_message )
      { this.buildReturnedMessage() }
      // On ajoute 'ET ' si l'expect a été introduit par un `and`
      this.addMessageStart()
      // On ajoute la fin du message si elle existe
      this.addMessageEnd()
    }

    return this._returned_message
  }

  /**
  *   Définit le numéro de la ligne de test ou l'erreur s'est produite
  *   et renseigne this.errLine
  **/
  getErrorLine()
  {
    // On récupère la ligne de l'erreur
    let erreur, stackErreur
    try{throw new VoluntaryTestError('Erreur volontaire suite à erreur test')}
    catch(err){
      erreur = err }
    this.errLines = getErrorLineInStack(erreur.stack, this.file.path)
    let firstMatch = this.errLines[0]
    this.errLine    = firstMatch.line
    this.errColumn  = firstMatch.column
  }

  /**
  *   Écrit le résultat de cette expectation dans la page
  *   En fait, cette méthode fait plus que ça, en relevant le numéro
  *   de ligne de l'erreur (if any), ou en throwant si l'expectation
  *   n'est pas remplie.
  **/
  writeCase ()
  {
    let the_it
    // En cas d'échec, on cherche le numéro de ligne et on mémorise
    // cet PTextExpectObject pour l'afficher dans le résumé de bas de page
    // dans le résumé final
    if ( ! this.isOK ) {
      this.getErrorLine()
      if ( this.isTest ) { PTests.add_error( this ) }
    }
    if ( this.isTest )
    {
      // On écrit le it dans le document si nécessaire (la première fois
      // qu'une expectation doit être écrite)
      if ( this.it.printed ) { the_it = null }
      else {
        the_it = this.it
      }
      // Inscription du résultat dans le rapport.
      // Sauf si l'option `only_on_fail` est activée et que c'est un succès
      let rapporter = true

      if ( this.options.only_on_fail && this.isOK) { rapporter = false }

      if ( rapporter )
      {
        PTests.writer.write_case ( the_it, this )
        this.it.printed = true
      }

      // Si l'expectation n'est pas remplie, on doit interromprendre le
      // it-case
      // Noter qu'on se trouve ici dans le cas où c'est un vrai test. Donc ça
      // ne produit heureusement aucune sortie lorsque l'on est dans un
      // not_a_test.
      if (! this.isOK ) { throw new PTestsExpectationError('Expectation non remplie') }

    }

    // Pour le chainage (et les tests)
    return this
  }

  /** ---------------------------------------------------------------------
    *
    *   Termes de changement d'état
    *   ---------------------------
    *   Pour passer par exemple de positif à négatif ou
    *   de strict à non strict.
    *
    *
    *
    *
    *
  *** --------------------------------------------------------------------- */

  /** Crée une expectation « sœur »
    * C'est une autre expectation mais qui est appliquée au même sujet
    * Par exemple :
    *    expect(actual)
    *     .not.equals(exp1)
    *     .and.not.equals(exp2)  // <- expectation sœur
  ***/
  get and () {
    var autre_expect = new PTestExpectObject(this.actual, this.actual_str_provided, this.options, ItClass.current)
    return autre_expect
  }

  get not () {
    this.positive = false
    return this
  }
  get strictly ()
  {
    this.strict = true
    return this
  }
  get deeply ()
  {
    this.deep = true
    return this
  }
  get asFile ()
  {
    this.isFile = true
    return this
  }
  get asFolder ()
  {
    this.isFolder = true
    return this
  }
  get asNode ()
  {
    this.isNode   = true
    return this
  }
  get asNodeId ()
  {
    this.isNode   = true
    this.isNodeId = true
    return this
  }
  get asNodeClass ()
  {
    this.isNode       = true
    this.isNodeClass  = true
    return this
  }
  get asNodeTag ()
  {
    this.isNode     = true
    this.isNodeTag  = true
    return this
  }

  // Cf. PTests/Tests_des_classes.md
  asInstanceOf ( TheClass )
  {
    this.isInstance = true
    this.Classe     = TheClass
    return this
  }

  get call () {
    this.actual_is_function = true
    if ( 'function' !== typeof this.actual ) {
      if ( 'string' === typeof this.actual ) {
        this.actual = eval(this.actual)
      } else {
        throw new Error("La valeur passée à expect(...) devrait être une fonction ou une string, puisque la méthode `call' est invoquée.")
      }
    }
    return this // pour chainage
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes d'évaluation communes à tous les cas
    *   ---------------------------------------------
    *
    *
    *
    *
    *
    *
  *** --------------------------------------------------------------------- */
  /**
  * Retourne la valeur finale du test, positif (true) ou négatif (false)
  **/
  get isOK ()
  {
    return this.resultat_droit == this.positive
  }
  /** ---------------------------------------------------------------------
    *
    *   Termes idiomatiques
    *   -------------------
    *
    *   Ils ne servent à rien dans l'estimation mais permettent d'avoir
    *   des phrases plus idiomatiques.
    *
    *
    *
    *
  *** --------------------------------------------------------------------- */

  get to ()   { return this }
  get be ()   { return this }
  get is ()   { return this }
  get has ()  {
    this.auxiliaire = 'avoir'
    return this
  }
  get have () {
    this.auxiliaire = 'avoir'
    return this
  }


  /** ---------------------------------------------------------------------
    *   MÉTHODE D'ÉVALUATION
    *
    *   Ce sont les mots qui marquent la fin d'un cas et son lancement
    *   pour analyse et résultat.
    *   C'est donc ici que sont fabriquées les phrases de résultat.
  *** --------------------------------------------------------------------- */

  get true      () { return this.equals(true)       }
  get false     () { return this.equals(false)      }
  get null      () { return this.equals(null)       }
  get undefined () { return this.equals(undefined)  }


}
// alias des méthodes de comparaison
PTestExpectObject.prototype.equal_to = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.equals   = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.return   = PTestExpectObject.prototype.returns
PTestExpectObject.prototype.contains = PTestExpectObject.prototype.contain
PTestExpectObject.prototype.attributes = PTestExpectObject.prototype.attribute


/**
* Function exposée au monde permettant d'instancier une expectation
**/
function expect(_actual, _actual_str, options)
{
  return new PTestExpectObject(_actual, _actual_str, options, ItClass.current)
}
/**
* Fonciton exposée permettant de mettre un pending
**/
function pending(mess)
{
  return new PTestPendingObject(mess, ItClass.current)
}

/**
*   EXPOSITION DES MÉTHODES
**/
global.beforeSuite  = PTests.setBeforeSuite.bind(PTests)
global.beforeAll    = PTests.setBeforeAll.bind(PTests)
global.beforeEach   = PTests.setBeforeEach.bind(PTests)
global.afterEach    = PTests.setAfterEach.bind(PTests)
global.afterAll     = PTests.setAfterAll.bind(PTests)
global.afterSuite   = PTests.setAfterSuite.bind(PTests)

global.describe           = DescribeClass .initialize
global.context            = ContextClass  .initialize
global.it                 = ItClass       .initialize
global.expect             = expect
global.pending            = pending
global.throwError         = throwError
global.waitFor            = waitFor
global.waitForVisible     = waitForVisible
global.waitForNotVisible  = waitForNotVisible
global.waitForTrue        = waitForTrue
global.waitForFalse       = waitForFalse

// Les méthodes de PTests exposées, pour simplifier le code
global.puts       = PTests.puts
global.require_module = PTests.require_module

global.PTests   = PTests
global.PTestContainer = PTestContainer // pour essai d'intégration dans une app
global.USER_DATA_PATH = USER_DATA_PATH
global.PRODUCT_NAME   = PRODUCT_NAME
module.exports  = PTests // utile pour le renderer
