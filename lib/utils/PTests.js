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


// Mettre à null pour que tous les tests soient joués ou définir le seul
// test à faire
const FICHIER_TO_TEST = path.join('.','tests','ptests','autotests','template_message_spec.js')


String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}
// Pour escaper les expressions régulières
RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
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
    log("Exécution du fichier ", this.path)
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
    catch(erreur) { console.log(erreur) }

  }
  as_link_to_line (line, title)
  {
    if (undefined === title) { title = this.relative_path }
    return `<a href="atm://open?url=file://${this.path}&line=${line}">${title}</a>`
  }
}

class PTests {

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
    // Cette ligne fonctionnait lorsqu'elle était appelée par la fenêtre main.js
    // fenPTests.loadURL('file:///'+path.join(C.LIB_UTILS_FOLDER,'PTests.html'))
    fenPTests.loadURL('file://'+path.join(__dirname,'PTests.html'))
    fenPTests.on('ready-to-show', (evt) => {
      fenPTests.show()
      /* Note0002 */
      let timer = setTimeout(function(){clearTimeout(timer);fenPTests.setPosition(40,0);fenPTests.focus()}, 1000)
    })
  }

  static get current_file () { return this._current_file  }
  static set current_file (v){ this._current_file = v     }

  static get current_it   () { return this._current_it    }
  static set current_it   (v){ this._current_it = v       }


  /** ---------------------------------------------------------------------
    *   RENDERER
    *
  *** --------------------------------------------------------------------- */

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

    if ( FICHIER_TO_TEST )
    {
      // Pour faire un test sur un seul fichier
      let
            frelpath  = FICHIER_TO_TEST
          , ftest     = new PTestFile(frelpath)
      this.current_file = ftest
      // On requiert la fiche du test afin qu'il soit exécuté
      // PTests.writer.write_path(ftest.relative_path)
      // require(ftest.path)
      ftest.run()
    }
    else
    {
      // Un dossier de test
      let ptests_folder = path.join('.','tests','ptests')
      glob(path.join(ptests_folder,'**','*_spec.js'), (err, files) => {
        if ( err ){ throw err }
        files.map( (frelpath) => {
          let ftest = new PTestFile(frelpath)
          this.current_file = ftest
          ftest.run()
        }) // /map sur tous les fichiers

      })// /glob
    }

    this.on_end()

  }// /run

  // Appelé avant toutes les feuilles de test
  static on_start ()
  {
    let output = new Writer('tests-results')
    PTests.writer = output
    PTests.writer.init_tests()
    this._errors = []
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

  /**
  *   Test de PTests soi-même
  **/
  static autotest ()
  {
    /**
    *   Test de la classe Estimator
    **/
    // TODO Lancer ici les tests du dossier ptests/autotest
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
**/
class PTestContainer {
  //
  // Note : it a son propre constructeur, car il n'a pas d'enfants
  // mais une fonction.
  constructor (description, children)
  {
    log(`-instanciation- ${this.type} « ${description} »`)
    this.description  = description
    this.owner        = null
    this.tab_level    = null
    if ( children )
    {
      // Les enfants peuvent commencer par un élément vide (pour la virgule
      // qu'on met toujours)
      if ( ! children[0] ) { children.shift() }
      this.children = children
      if ( children ) { this.traite_children() }
    }
  }
  /**
  * On définit le owner des enfants (on en a besoin plus tard)
  **/
  traite_children ()
  {
    for(let i in this.children){ this.children[i].owner = this}
  }
  /**
  *   On traite les enfants, c'est-à-dire qu'on
  *   définit leur owner et leur tab_level. Cela permettra de savoir
  *   ce qu'il faut lancer après la lecture du test
  **/
  define_tab_level_children ()
  {
    if ( ! this.children ) { return }
    log(`- Je define_tab_level_children (${this.children.length}) de ${this.type} « ${this.description} »`)
    if ( ! this.tab_level ) { this.tab_level = 0 }
    let i , child
    for( i in this.children )
    {
      child = this.children[i]
      child.tab_level = this.tab_level + 1
      log(` = tab_level de « ${child.description} » (${child.type}) mis à ${child.tab_level}`)
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
    log(`- Je run le ${this.type} « ${this.description} »`)
    PTests.writer[`write_${this.type}`](this.description, this.tab_level)
    if ( this.children ) { this.children.forEach(c => c.run()) }
  }
  /** ---------------------------------------------------------------------
    *
    *   CLASSE (PTestContainer)
    *
  *** --------------------------------------------------------------------- */
  /**
  * Initialisation faite avant chaque require de feuille de test
  **/
  static get CLASS_LIST () { return [DescribeClass, ContextClass, ItClass]}
  static init ()
  {
    this.CLASS_LIST.forEach( classe => { classe._list = [] } )
  }

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
  **/
  static define_tab_levels ()
  {
    // log('-> PTestContainer::define_tab_levels')
    this.CLASS_LIST.forEach( (classe) => {
      // log(`Classe traitée : ${classe.type} (${classe.list.length} éléments)`)
      classe.list.forEach(d => { if(!d.owner){d.define_tab_level_children.bind(d)()} })
    })
    // log('<- PTestContainer::define_tab_levels')
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

class DescribeClass extends PTestContainer
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get type () { return 'describe'  }
  static initialize (description, children)
  {
    return DescribeClass.add(new DescribeClass(description, children))
  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  get type        () { return 'describe'  }
  get level_type  () { return 1           }
}
class ContextClass extends PTestContainer
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static get type () { return 'context'  }
  static initialize (description, children)
  {
    return ContextClass.add(new ContextClass(description, children))
  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  get type        () { return 'context' }
  get level_type  () { return 2           }

}
class ItClass extends PTestContainer
{
  constructor (description, methode)
  {
    log(`-instanciation- it « ${description} »`)
    super(description, null /* pas d'enfant */)
    this.test_method = methode
    ItClass.lastIt = this
  }
  static get type () { return 'it' }
  get type        () { return 'it' }
  get level_type  () { return 3    }

  run ()
  {
    log(`--- Je run enfin le it « ${this.description} »`)
    // pour les messages d'erreur de fin (mais ça ne doit plus être utile
    // maintenant que le owner est correctement défini)
    PTests.current_it = this.it
    this.test_method.call()
  }

  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
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
  constructor ( actual, actual_str )
  {
    this.actual       = actual
    this.actual_str_provided  = actual_str
    this.file         = PTests.current_file // Instance {PTestFile}
    this.it           = ItClass.lastIt   // Instance {ItClass}
    this.positive     = true
    this.strict       = false
    this.options      = {}

  }

  // Si cette méthode est true, aucun message de résultat de test ne sera
  // affiché. La valeur sera seulement évaluée.
  // Cette propriété sert dans deux cas :
  //  - lorsque l'on teste PTests
  //  - lorsque l'on utilise des chainages avec `and` et qu'on doit évaluer
  //    toutes les expectations seulement à la fin.
  get evaluate_only () {
    if ( undefined === this._evaluate_only )
    {
      this._evaluate_only = !!this.options.not_a_test
    }
    return this._evaluate_only
  }

  // Il faudrait pouvoir faire la même chose que `and` (et) avec `or` (ou) ?
  get or () {
    throw new Error("La propriété-méthode `or` n'est pas implémentée.")
  }

  // Permet de faire des chainages du genre :
  //    expect(actual).not.equals(exp1).and.not.equals(exp2)
  // Les expects deviennent des frères (siblings) qui seront rassemblés pour
  // faire un seul message. Mais pour le traitement courant,
  //
  // L'expect courant sera OK si tous ses frères sont OK
  //
  // Noter que c'est sur le nouvel PTestExpectObject que seront effectués les
  // tests qui suivent.
  get and () {
    var autre_expect = new PTestExpectObject(this.actual, this.actual_str_provided)
    this.add_sibling(autre_expect)
    // autre_expect._evaluate_only = true
    autre_expect._sibling_index  = this.sibling_index + 1
    return autre_expect
  }
  /**
  *   Seulement s'il a des enfants
  **/
  get sibling_index ()
  {
    if ( undefined === this._sibling_index ) { this._sibling_index = 0 }
    return this._sibling_index
  }
  add_sibling (iexpect)
  {
    log(`* Ajout d'un frère à l'expect « ${this.actual} » (#${this.sibling_index})`)
    if ( undefined === this._siblings ) { this._siblings = [] }
    this._siblings.push(iexpect)
    iexpect._hasPreviousSibling = true
  }
  get siblings () { return this._siblings}
  // Pour l'affichage, il faut savoir s'il y a un frère qui suit. Cela ajoute
  // une class CSS 'sib' qui empêche d'écarter le cas du cas suivant
  // Rappel : on ne peut pas tester le frère précédent dont le message est
  // toujours affiché avant l'évaluation du frère suivant (jusqu'à nouvel ordre
  // en tout cas, car ensuite on pourra décidé de rassembler les expects des
  // it et les évaluer en connaissant déjà ces fraternités)
  get hasPreviousSibling () { return !!this._hasPreviousSibling }

  // Méthode qui retourne le code HTML de l'expect objet pour inscription
  // après le résumé quand il y a eu une erreur
  //
  // TODO Ajouter ici le lien au fichier avec href("atm:")
  //
  as_full_error ()
  {
    return `
<div class="error-after-resume">
<div><span class="err-numero">${this.numero}</span><span class="file">${this.file.as_link_to_line(this.error_line)}</span><span class="err-line">::${this.error_line}</span></div>
<div class="error">it(${this.it}) => ${this.returnedMessage}</div>
</div>
`
  }

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
    {
      this._actual_str = `${this.actual}`
    }
    // if ( this.sibling_index && this.sibling_index > 0 )
    // {
    //   // <= C'est un expect défini par un `and`
    //   this._actual_str = `ET ${this._actual_str}`
    // }
  }
  // Méthode définissant `this._expect_str` qui affiche la valeur attendue
  // dans les messages, en fonction des options
  defineExpectedString(vdef)
  {
    if ( vdef )
    {
      if ( !this.options.no_values ) { vdef += ` (${this.expect})` }
      this._expect_str = `${vdef}`
    }
    else
    {
      this._expect_str = this.expect
    }
  }

  /*
  // Méthode générale qui traite les arguments de toute méthode de
  // comparaison.
  // Pour rappel, les arguments doivent se présenter ainsi :
  //      1     La valeur attendue (deviendra `this.expect`)
  //      2     La valeur attendue en format humain, pour le message
  //            => this.expect_str
  //      3     Des options :
  //              template:success: "<message customisé en cas de succès>"
  //              template:failure: "<message customisé en cas d'échec>"
  //
  //
    Méthode rectifie aussi this.actual dans le cas où this.actual_is_function
    est true. Cela signifie que c'est une fonction qui a été envoyée à expect
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
    this.options = opts || {}

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

    this.defineExpectedString(exp_str)
    this.defineActualString()
  }

  /** ---------------------------------------------------------------------
    *   Termes de changement d'état.
    *   Pour passer par exemple de positif à négatif ou
    *   de strict à non strict.
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
    *   Méthodes d'évaluation communes à tous les cas
    *
  *** --------------------------------------------------------------------- */
  /**
  * Retourne la valeur finale du test, positif (true) ou négatif (false)
  * Note :  this.resultat_droit doit être calculé par chaque méthode
  *         d'estimation ci-dessous avant d'invoquer cette méthode.
  **/
  get isOK ()
  {

    this._isOK = (this.resultat_droit == this.positive)
    log(`= le _isOK de l'expect « ${this.actual} » (sibling-index #${this.sibling_index}) est ${this._isOK}`)
    if ( this._isOK && this.siblings )
    {
      log("  Il est nécessaire d'évaluer ses frères (`and` utilisé)")
      for(let i in this.siblings){
        let sibling = this.siblings[i]
        // Si un seul des frères n'est pas OK, l'expectation courant n'est
        // pas OK
        if ( false === sibling.isOK ){
          log(`ERREUR!!! par un frère : ${sibling.returnedMessage}`)
          this._isOK = false
          break
        }
      }
    }

    return this._isOK
  }
  /** ---------------------------------------------------------------------
    *   Termes idiomatiques
    *   -------------------
    *   Ils ne servent à rien dans l'estimation mais permettent d'avoir
    *   des phrases plus idiomatiques.
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
    *   Méthode qui construit le message qui sera écrit sur la page de
    *   retour des tests.
  *** --------------------------------------------------------------------- */

  get returnedMessage ()
  {
    if ( undefined === this._returned_message )
    {
      let m

      if ( this.options.template )
      {
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
          m = m.replace(/__EXPECTED__/, this.expect_str)
          this._returned_message = m.trim()
        }
      }
      // Si le message de retour n'est toujours pas défini
      if ( undefined === this._returned_message )
      {
        let
            pos           = this.positive
          , strict        = this.strict
          // pour supprimer 'est' ou 'n'est pas', mais sera remplacé par
          // ne ... pas
          , noEst         = this.noEstMessage
          , withType      = strict && !this.noType
          , ok            = this.isOK
          , mkOK          = ok ? '<span class="ok">OK</span>' : `<span class="er">Erreur</span> line ${this.error_line}`
          , mkType        = withType ? ` {${typeof this.actual}}` : ''
          , mkStrict      = strict ? ' strictement' : (this.alt_strict || '')
          , mkVerbComp    = this.verb_comparaison
          , mkVerb

        if ( this.sibling_index /* i.e. il est défini et > 0 */)
        {
          mkOK = ''
        }
        else
        {
          mkOK = `${mkOK}, `
        }
        if ( noEst )
        {
          mkVerb      = (pos == ok) ? mkVerbComp : `ne ${mkVerbComp} pas`
          mkVerbComp  = ''
        }
        else
        {
          mkVerb = (pos == ok) ? 'est' : 'n’est pas'
        }
        m = `${mkOK} ${this.actual_str}${mkType} ${mkVerb}${mkStrict} ${mkVerbComp}`

        if ( this.expect ) {
          let
              expstr    = this.expect_str
            , mkExtType = withType ? ` {${typeof this.expect}}` : ''
            , prepo     = this.preposition_expect
          if ( prepo === undefined ) { prepo = 'à '}
          if ( 'string' === typeof this.expect ) { expstr = `« ${expstr} »`}
          m += ` ${prepo}${expstr}${mkExtType}`
        }
        this._returned_message = m.trim()
      }//si le message de retour n'est toujours pas défini (par un template)
    }// si le message de retour n'est pas défini

    // On ajoute 'ET ' si l'expect a été introduit par un `and`
    if ( this.sibling_index ) { this._returned_message = `${this.isOK?'<span class="et">ET</span>':'<span class="mais">MAIS</span>'} ${this._returned_message}`}
    return this._returned_message
  }


  /** ---------------------------------------------------------------------
    *   MOTS DE FIN DE COMPARAISON
    *   Ce sont les mots qui marquent la fin d'un cas et son lancement
    *   pour analyse et résultat.
    *   C'est donc ici que sont fabriquées les phrases de résultat.
  *** --------------------------------------------------------------------- */

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
    this.noEstMessage       = true
    this.verb_comparaison   = verb
    this.preposition_expect = ''

    return this.writeCase() // Retourne encore l'instance courante
  }
  equal () // cf. Note0001
  {
    this.__prepare_evalutation(arguments)


    if ( 'string' == typeof this.actual && 'string' == typeof this.expect)
    {
      this.noType = true // pas de type dans les messages de résultat
      if ( this.strict ) { this.resultat_droit = this.expect === this.actual }
      else
      {
        let re = new RegExp(`^${this.actual}$`, 'i')
        this.resultat_droit = !!this.expect.match(re)
      }
    } else {
      if ( this.strict ) {
        this.resultat_droit = (this.expect === this.actual)
      }
      else {
        this.resultat_droit = this.expect == this.actual
      }
    }

    // Définition du message à retourner
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

  instanceof () // expect, expect_str, options
  {
    this.__prepare_evalutation(arguments)

    if ( 'string' == typeof this.expect ){this.expect = eval(this.expect)}

    this.verb_comparaison   = 'une instance'
    this.preposition_expect = 'de'
    this.resultat_droit     = this.actual instanceof this.expect

    return this.writeCase()
  }

  /** ---------------------------------------------------------------------
    *   Méthodes fonctionnelle
    *
  *** --------------------------------------------------------------------- */

  // Méthode qui écrit le résultat du test
  //
  // TODO En fait, il faut une instance It et simplement tester si c'est le
  // même it que le précédent (ça, c'est pour les cas successifs dans un même
  // it (sa méthode))
  writeCase ()
  {
    if ( ! this.isOK ){
      let erreur, stackErreur
      try{throw new VoluntaryTestError('Erreur volontaire suite à erreur test')}
      catch(err){ erreur = err }
      stackErreur = erreur.stack

      let stacks = stackErreur.split('at ').slice(2,12)
      let sline, errLine, errColumn
      let nombreStacks = stacks.length
      let i = 0
      for(; i < nombreStacks ; ++i )
      {
        sline = stacks[i].trim()
        sline.replace(/^(.*?) \((.*?):([0-9]+):([0-9]+)\)$/, function(tout,methode,fichier,line,col){
          // Le premier fichier qui correspond au fichier courant est le bon
          fichier = fichier.trim()
          if (fichier == PTests.current_file.path) { errLine = line }
          // if (fichier == this.file.path) { errLine = line } // <=== Normalement, devrait être mieux
          return ''
        })
        if ( errLine ) break
      }
      if ( errLine ) { this.error_line = errLine }
    }

    if ( ! this.evaluate_only )
    {
      // On écrit le cas dans le document
      let the_it = this.sibling_index ? null /* ne pas remettre le it */ : this.it
      PTests.writer.write_case ( the_it, this )
      // En cas d'échec, on mémorise cet PTextExpectObject pour l'afficher
      // à la fin
      if ( ! this.isOK ) { PTests.add_error( this ) }
    }

    // Pour le chainage (et les tests)
    return this
  }

}
// alias des méthodes de comparaison
PTestExpectObject.prototype.equal_to = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.equals   = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.contains = PTestExpectObject.prototype.contain


// `expect` est exposé au monde par PTest
// Il permet de fournir la valeur @_actual qui devra être comparée
// avec la valeur attendue, qui arrivera certainement en bout de chaine,
// de façon explicite ou implicite.
//
// Ce expect, au moment de sa définition, est associé au dernier it produit
function expect(_actual, _actual_str)
{
  return new PTestExpectObject(_actual, _actual_str)
}

/**
*   EXPOSITION DES MÉTHODES NÉCESSAIRES
**/
// global.describe = DescribeClass.describe
global.describe = DescribeClass .initialize
global.context  = ContextClass  .initialize
global.it       = ItClass       .initialize
global.expect   = expect


module.exports = PTests
