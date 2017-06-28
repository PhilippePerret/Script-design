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
    fs    = require('fs')
  , path  = require('path')
  , glob  = require('glob')
  , ipc   = require('electron').ipcRenderer
  , Any   = require('./PTests_Any')


String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}

// On expose la méthode log qui permettra d'écrire toujours dans la console
// principale
global.log = function(m,o){
  if (ipc /* renderer */) { ipc.send('message',m,o) }
  else /* main process */ { if(o){console.log(m,o)}else{console.log(m)}}

}

// Class d'erreur cutomisée pour récupérer les lignes des tests
// d'erreur
class VoluntaryTestError extends Error {
  constructor(message) {
      super ( message )
      Error.captureStackTrace(this, this.constructor)
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
    return `ERREUR ÉCRITURE TEST : ${this.message}`
  }
}
function throwError (message)
{
  let err = new PTestsError(message)
  log( err.as_full_error() )
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
    this.relative_path  = relpath
    this.path           = path.resolve(relpath)
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
      PTests.writer.write_path(this.relative_path)
      PTestContainer.init()
      require(this.path) // => définit simplement les cases sans rien tester
      PTestContainer.define_tab_levels()
      PTestContainer.run_lists()
      // ============  / TEST  ===============
    }
    catch(erreur) {
      log(erreur)
    }

  }
  as_link_to_line (line, title)
  {
    if (undefined === title) { title = this.relative_path }
    return `<a href="atm://open?url=file://${this.path}&line=${line}">${title}</a>`
  }
}

class PTests {

  /**
  * @return le path absolu au dossier des tests PTests
  **/
  static get folder_test_path () {
    if ( undefined === this._folder_test_path )
    { this._folder_test_path = path.resolve(path.join('.','tests','ptests')) }
    return this._folder_test_path
  }

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


  /** ---------------------------------------------------------------------
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

  // Raccourci pour pouvoir utiliser 'PTests.write(message)'
  static write (mess, arg2, arg3)
  {
    PTests.writer.write(mess, arg2, arg3)
  }

  /**
  *   Lance la suite de tests
  *
  *   Pour le moment, ils se trouvent dans le dossier ./tests/ptests/
  **/
  static run ()
  {
    this.on_start()
    this.defineTestFilesListAndRun()
  }// /run
  // La méthode est appelée de façon asynchrone après avoir relevé
  // la liste des fichiers de tests
  static run_test_files (test_files)
  {
    log("Liste des fichiers tests à jouer :", test_files)
    let ftest
    test_files.forEach( (frelpath) => {
      ftest = new PTestFile(frelpath)
      this.current_file = ftest
      ftest.run()
    })
    this.on_end()
  }

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
      else {
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
          else {
            my.run_test_files(files)
          }
        })
      }
    }
  }

  // Appelé avant toutes les feuilles de test
  static on_start ()
  {
    // On charge le fichier spec_helper.js s'il existe
    if ( fs.existsSync(this.spec_helper_path) )
    {
      this.require_module(this.spec_helper_path)
    }
    let output = new Writer('tests-results')
    PTests.writer = output
    PTests.writer.init_tests()
    this._errors = []
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
  // Requérir un module depuis une feuille de tests
  static require_module ( mpath )
  {
    mpath = path.resolve(mpath)
    return require(mpath)
  }

  // Appelé après toutes les feuilles de test
  static on_end ()
  {
    PTests.writer.write_final_resume.bind(PTests.writer)()
    // Noter qu'on scrolle avant d'écrire le résumé final pour se
    // trouver à l'endroit où sont résumés les résultats. En montant,
    // l'utilisateur peut trouver les tests décrits et en descendant, le
    // détail des fichiers.
    let offset = document.getElementById('tests-results').offsetHeight
    window.scrollTo(0,offset)
    this.display_errors()
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
  }

  /**
  *   Affichage des erreurs rencontrées
  **/
  static display_errors ()
  {
    if ( 0 == this._errors.length ) { return }
    let current_numero = 0
    this._errors.map( (expObj) => {
      expObj.numero = ++ current_numero
      this.write( expObj.as_full_error(), false )
    })
  }
}

/** ---------------------------------------------------------------------
  *
  *   LE WRITER
  *   ---------
  *   Classe chargée d'écrire les messages dans la fenêtre
  *
*** --------------------------------------------------------------------- */
class Writer
{
  constructor (container) {
    this.container = document.getElementById(container)
  }
  init_tests () {
    this.nombre_total_cases = 0
    this.nombre_succes      = 0
    this.nombre_echecs      = 0
    this.nombre_pendings    = 0
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
  write_div(str, cname)
  {
    let div = document.createElement('div')
    div.className = `${cname}`
    div.innerHTML = str
    this.container.appendChild(div)
  }

  /**
  * Après avoir fait passer toute la suite de tests on affiche le résumé
  **/
  write_final_resume ()
  {
    let divres = document.createElement('div')
    divres.className = `resume_final ${this.nombre_echecs ? 'fail' : 'pass'}`
    let
        s_test  = this.nombre_total_cases > 1 ? 's' : ''
      , s_fails = this.nombre_echecs > 1 ? 's' : ''
      , s_pends = this.nombre_pendings > 1 ? 's' : ''

    divres.innerHTML = `
<span class="total_count">${this.nombre_total_cases} test${s_test}</span>
<span class="pass_count">${this.nombre_succes} success</span>
<span class="fail_count">${this.nombre_echecs} failure${s_fails}</span>
<span class="pend_count">${this.nombre_pendings} pending${s_pends}</span>
    `
    this.container.appendChild(divres)
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

    let
        context
      , tab_level     = iexpect.it.tab_level
      , resultat_str  = iexpect.returnedMessage
      , okCase        = iexpect.isOK

    this.nombre_total_cases += 1
    if ( okCase ) { this.nombre_succes += 1 }
    else { this.nombre_echecs += 1 }

    // Le div principal du cas
    let divcase = document.createElement('div')
    let css = ['case']
    css.push(`tab${tab_level}`)
    css.push(okCase ? 'pass' : 'fail')
    if ( iexpect.hasPreviousSibling ) css.push('sib')
    divcase.className = css.join(' ')

    // Le libellé supérieur (sauf si null — cas d'un sibling `and`)
    if ( the_it )
    {
      let libelle = document.createElement('div')
      libelle.className = 'lib'
      libelle.innerHTML = the_it.description
      divcase.appendChild(libelle)
    }

    divcase.appendChild(this.builtMessage(resultat_str, okCase))
    this.container.appendChild(divcase)

  }

  write (message, type)
  {
    let cl
    this.className  = cl
    this.message    = message
    this.container.appendChild(this.builtMessage(message, type))
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
  // Lorsque cet efant est un `it`, il est runné avec sa propre méthode
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
  *   Méthode générale qui va runner tous les tests sans parent (owner) dans
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
    super(description, null /* pas d'enfant */)
    this.test_method = methode
  }
  get type        () { return 'it' }
  get level_type  () { return 3    }

  // On joue la méthode du 'it'
  run ()
  {
    ItClass.current = this
    this.test_method.call()
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
  *
  * OBJET EXPECT
  *
  * Ici sont définis toutes les méthodes utilisées dans les "cases"
  *
*** --------------------------------------------------------------------- */

class PTestExpectObject
{

  /**
  *   Instanciation d'une expectation
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
    if ( options ) { this.defineDefaultOptions(options) }

  }

  get type () { return 'expectation' }

  // Si cette méthode est true, aucun message de résultat de test ne sera
  // affiché. La valeur sera seulement évaluée.
  // Cette propriété ne sert que pour les tests :
  get evaluate_only () {
    if ( undefined === this._evaluate_only )
    { this._evaluate_only = !!this.options.not_a_test }
    return this._evaluate_only
  }

  // // Il faudrait pouvoir faire la même chose que `and` (et) avec `or` (ou) ?
  // get or () {
  //   throw new Error("La propriété-méthode `or` n'est pas implémentée.")
  // }

  // Pour les chainages (« conditions sœurs »)
  //    expect(actual)
  //      .not.equals(exp1)
  //      .and.not.equals(exp2)  // <- condition sœur
  get and () {
    var autre_expect = new PTestExpectObject(this.actual, this.actual_str_provided, this.options, ItClass.current)
    this.add_sibling(autre_expect)
    autre_expect._sibling_index  = this.sibling_index + 1
    return autre_expect
  }
  /**
  *   Seulement s'il a des conditions sœurs
  **/
  get sibling_index ()
  {
    if ( undefined === this._sibling_index ) { this._sibling_index = 0 }
    return this._sibling_index
  }
  add_sibling (iexpect)
  {
    if ( undefined === this._siblings ) { this._siblings = [] }
    this._siblings.push(iexpect)
    iexpect._hasPreviousSibling = true
    iexpect.previous_sibling    = this
  }
  get siblings () { return this._siblings}
  // Pour l'affichage, une condition sœur précède-t-elle ? ce qui supprimerait
  // l'espace entre les retours
  get hasPreviousSibling () { return !!this._hasPreviousSibling }

  /**
  *   @return {StringHTML} Code HTML du message d'erreur en résumé de test
  **/
  as_full_error ()
  {
    return `
<div class="error-after-resume">
<div><span class="err-numero">${this.numero}</span><span class="file">${this.file.as_link_to_line(this.errLine)}</span><span class="err-line">::${this.errLine}</span></div>
<div class="error">it(${this.it}) => ${this.returnedMessage}</div>
</div>
`
  }

  // cf. aussi defineActualString et defineExpectString
  get expect_str () { return this._expect_str }
  get actual_str () { return this._actual_str }

  // Définit _actual_str en fin de chaine pour utilisation dans les
  // messages
  defineActualString ()
  {
    if ( this.actual_str_provided )
    {
      this._actual_str = this.actual_str_provided
      if ( !this.options.no_values ) { this._actual_str += ` (${this.actual})` }
    }
    else
    { this._actual_str = `${this.actual}` }
  }
  defineExpectedString(vdef)
  {
    if ( vdef )
    {
      if ( !this.options.no_values ) { vdef += ` (${this.expect})` }
      this._expect_str = `${vdef}`
    }
    else
    { this._expect_str = `${this.expect}` }
  }

  /**
  * Définit les options
  * -------------------
  * Noter que la méthode peut être appelée de deux endroit différents :
  * depuis la méthode de comparaison finale (comportement normal)  ou depuis
  * la méthode `expect` (nécessaire quand on utilise des méthodes de comparaison
  * final sans arguments — to.be.true, to.be.null, etc.)
  **/
  defineDefaultOptions (opts)
  {
    if ( !this.options ) { this.options = {} }
    if ( ! opts ) { return }
    // Valeurs/clés modifiées
    if ( undefined !== opts.no_value  ) { opts.no_values  = opts.no_value }
    if ( undefined !== opts.NaT       ) { opts.not_a_test = opts.NaT      }
    // On passe tout dans thiso
    for(let k in opts){ this.options[k] = opts[k] }
  }
  /*
      Méthode générale qui traite les arguments de toute méthode de
      comparaison.
      Pour rappel, les arguments doivent se présenter ainsi :
           1     La valeur attendue (deviendra `this.expect`)
           2     [optionnel] La valeur attendue en format humain, pour le
                 message => this.expect_str
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
      opts = exp_str
      exp_str = undefined
    }

    // On met toujours options à {} pour simplifier le code ensuite
    this.defineDefaultOptions(opts)

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
    this.defineExpectedString(exp_str)
    this.defineActualString()
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
      mkVerb      = (pos == ok) ? mkVerbComp : `ne ${mkVerbComp} pas`
      mkVerbComp  = ''
    }
    else
    {
      mkVerb = (pos == ok) ? 'est' : 'n’est pas'
    }
    m = `${this.actual_str}${mkType} ${mkVerb}${mkStrict} ${mkVerbComp}`

    if ( undefined !== this.expect ) {
      let
          expstr    = this.expect_str
        , mkExtType = withType ? ` {${this.expectType || typeof(this.expect)}}` : ''
        , prepo     = this.preposition_expect
      if ( prepo === undefined ) { prepo = 'à '}
      if ( 'string' === typeof this.expect ) { expstr = `« ${expstr} »`}
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
  *   Ajout les marques "ET" ou "MAIS" si l'expectation courante est une
  *   condition sœur.
  **/
  addAmorceMessage ()
  {
    let amorce, css, mark
    if ( this.sibling_index ) {
      if ( this.isOK === this.previous_sibling.isOK ) {
        [css, mark] = [(this.isOK ? 'et' : 'mais'), 'ET']
      } else {
        [css, mark] = [(this.isOK ? 'et' : 'mais'), 'MAIS']
      }
      amorce = `<span class="${css}">${mark}</span>`
    }
    else
    {
      amorce = this.isOK ? '<span class="ok">OK</span>' : `<span class="er">Erreur</span> line ${this.errLine}`
      amorce += ', '
    }
    this._returned_message = `${amorce} ${this._returned_message}`
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
      if ( this.options.template )
      { this.buildReturnedMessageFromTemplate() }
      // Si le message de retour n'est toujours pas défini
      if ( undefined === this._returned_message )
      { this.buildReturnedMessage() }
      // On ajoute 'ET ' si l'expect a été introduit par un `and`
      this.addAmorceMessage()
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
    catch(err){ erreur = err }
    stackErreur = erreur.stack
    let stacks = stackErreur.split('at ').slice(3,12)
    let sline, errLine, errColumn
    let nombreStacks = stacks.length
    let i = 0, my = this
    for(; i < nombreStacks ; ++i )
    {
      sline = stacks[i].trim()
      sline.replace(/^(.*?) \((.*?):([0-9]+):([0-9]+)\)$/, function(tout,methode,fichier,line,col){
        // Le premier fichier qui correspond au fichier courant est le bon
        fichier = fichier.trim()
        // TODO Vérifier que this.file ne varie pas en fonction du fichier courant
        if (fichier == my.file.path) { errLine = line } // <=== Normalement, devrait être mieux
        return ''
      })
      if ( errLine ) break
    }
    if ( errLine ) {
      this.errLine    = errLine
      this.errColumn  = errColumn
    }
  }
  /**
  *   Écrit le résultat de cette expectation dans la page
  **/
  writeCase ()
  {
    if ( ! this.isOK ) { this.getErrorLine() }

    if ( ! this.evaluate_only )
    {
      // On écrit le cas dans le document
      let the_it = this.sibling_index ? null /* ne pas remettre le it */ : this.it
      PTests.writer.write_case ( the_it, this )
      // En cas d'échec, on mémorise cet PTextExpectObject pour l'afficher
      // dans le résumé final
      if ( ! this.isOK ) { PTests.add_error( this ) }
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

  get not () {
    this.positive = false
    return this
  }
  get strictly () {
    this.strict = true
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

  get to () {
    return this
  }
  get be () {
    return this
  }
  get is () {
    return this
  }




  /** ---------------------------------------------------------------------
    *   MÉTHODE D'ÉVALUATION
    *
    *   Ce sont les mots qui marquent la fin d'un cas et son lancement
    *   pour analyse et résultat.
    *   C'est donc ici que sont fabriquées les phrases de résultat.
  *** --------------------------------------------------------------------- */

  get true ()   { return this.equal(true)  }
  get false ()  { return this.equal(false) }
  get null ()   { return this.strictly.equal(null) }

  contain ()
  {
    this.__prepare_evalutation(arguments)

    // En fonction du type de expect
    let res, verb, re
    switch (typeof this.actual)
    {
      case 'string':
        verb  = 'contient'
        let expreg = RegExp.escape(this.expect)
        if ( this.strict )
        {res   = this.actual.search(expreg) > -1}
        else
        {
          re  = RegExp(`${expreg}`, 'i')
          res = this.actual.search(re) > -1
        }
        break
      case 'object':
        // Quand liste de valeurs (array)
        if ( Array.isArray(this.actual) )
        {
          if ( this.strict )
          {res   = this.actual.indexOf(this.expect) > -1}
          else
          {
            re  = RegExp(`${expreg}`,'i')
            res = this.actual.indexOf(this.expect) > -1 // possible ?!
          }
        }
        else
        {
          res = undefined !== this.actual[this.expect]
        }
        verb  = 'contient'
        break
    }
    this.resultat_droit     = res
    this.noEstMessage       = true // ajoutera les "ne… pas" en cas de besoin
    this.verb_comparaison   = verb
    this.preposition_expect = ''

    return this.writeCase() // Retourne encore l'instance courante
  }

  equal () // cf. Note0001
  {
    this.__prepare_evalutation(arguments)
    this.resultat_droit = Any.areEqual(this.actual, this.expect, {strict: this.strict})
    this.verb_comparaison = 'égal'
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
  between () // expect, expect_str, options
  {
    this.__prepare_evalutation(arguments)

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

    return this.writeCase()
  }

  classOf ()
  {
    this.__prepare_evalutation(arguments)
    this.verb_comparaison   = 'de classe'
    this.preposition_expect = ''
    this.resultat_droit     = new Any(this.actual).class == this.expect
    return this.writeCase()
  }

  instanceof () // expect, expect_str, options
  {
    this.__prepare_evalutation(arguments)

    if ( 'string' == typeof this.expect ){this.expect = eval(this.expect)}

    this.verb_comparaison   = 'une instance'
    this.preposition_expect = 'de'
    this.resultat_droit     = this.actual instanceof this.expect

    return this.writeCase()
  }

}
// alias des méthodes de comparaison
PTestExpectObject.prototype.equal_to = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.equals   = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.contains = PTestExpectObject.prototype.contain


/**
* Function exposée au monde permettant d'instancier une expectation
**/
function expect(_actual, _actual_str, options)
{
  return new PTestExpectObject(_actual, _actual_str, options, ItClass.current)
}

/**
*   EXPOSITION DES MÉTHODES
**/
// global.describe = DescribeClass.describe
global.describe   = DescribeClass .initialize
global.context    = ContextClass  .initialize
global.it         = ItClass       .initialize
global.expect     = expect
global.throwError = throwError

global.require_module = PTests.require_module
global.PTests   = PTests
module.exports  = PTests // utile pour le renderer
