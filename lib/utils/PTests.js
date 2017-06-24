/*

  Note0001

        Ce script a deux utilisation très différentes :
        1.  Il est chargé par le module appelant les tests qui va utiliser la
            méthode `PTests.prepare` pour ouvrir la fenêtre du test.
        2.  Il est chargé par la fenêtre du test elle-même (PTests.html) pour
            gérer l'ensemble des tests.

*/


String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}

let
    fs    = require('fs')
  , path  = require('path')
  , glob  = require('glob')
  , ipc   = require('electron').ipcRenderer


// On expose la méthode log qui permettra d'écrire toujours dans la console
// principale
global.log = function(m,o){ipc.send('message',m,o)}

/** ---------------------------------------------------------------------
  *   J'essaie ici de créer une erreur propre pour récupérer les
  *   ligne des erreurs
  *
*** --------------------------------------------------------------------- */
class VoluntaryTestError extends Error {
  constructor(message) {
      super ( message )
      // Capture stack trace in Node.js
      Error.captureStackTrace(this, this.constructor)
      // this.name = this.constructor.name
      // this.message = message
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
    let {BrowserWindow} = require('electron')
    let path = require('path')
    // let {BrowserWindow} = remote.require('electron')
    const fenPTests = new BrowserWindow({x: 40, y: 0, width:1500, height:900, show: false, devTools:true})
    // fenPTests.openDevTools()
    // Cette ligne fonctionnait lorsqu'elle était appelée par la fenêtre main.js
    // fenPTests.loadURL('file:///'+path.join(C.LIB_UTILS_FOLDER,'PTests.html'))
    fenPTests.loadURL('file://'+path.join(__dirname,'PTests.html'))
    fenPTests.on('ready-to-show', (evt) => {
      // console.log('-> ready-to-show')
      fenPTests.show()
    })
  }

  static get current_file () { return this._current_file  }
  static set current_file (v){ this._current_file = v     }

  static get current_it   () { return this._current_it    }
  static set current_it   (v){ this._current_it = v       }

  /**
  *   Lance la suite de tests
  *
  *   Pour le moment, ils se trouvent dans le dossier ./tests/ptests/
  **/
  static run ()
  {
    this.on_start()

    let unSeulFichier = true

    if ( unSeulFichier )
    {
      // Pour faire un test sur un seul fichier
      let frelpath  = path.join('.','tests','ptests','autotests','failures_spec.js')
      let fpath     = path.resolve(path.join('.',frelpath))
      this.current_file = fpath
      // On requiert la fiche du test afin qu'il soit exécuté
      Case.writer.write_path(frelpath)
      require(fpath)
      Case.writer.write_final_resume.bind(Case.writer)()
    }
    else
    {
      // Un dossier de test
      let ptests_folder = path.join('.','tests','ptests')
      glob(path.join(ptests_folder,'**','*_spec.js'), (err, files) => {
        if ( err ){ throw err }
        files.map( (frelpath) => {
          let fpath = path.resolve(path.join('.',frelpath))
          this.current_file = fpath
          log("Exécution du fichier ", fpath)
          try
          {
            // On requiert la fiche du test afin qu'il soit exécuté
            Case.writer.write_path(frelpath)
            require(fpath)
          }
          catch(erreur)
          {
            console.log(erreur)
          }
        }) // /map sur tous les fichiers
        Case.writer.write_final_resume.bind(Case.writer)()

        let offset = document.getElementById('tests-results').offsetHeight
        // output.write(`offset = ${offset}`)
        window.scrollTo(0,offset)

      })// /glob
    }

    this.on_end()

  }// /run

  // Appelé avant toutes les feuilles de test
  static on_start ()
  {
    let output = new Writer('tests-results')
    Case.writer = output
    Case.writer.init_tests()
    this._errors = []
  }

  // Appelé après toutes les feuilles de test
  static on_end ()
  {
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
      Case.writer.write( expObj.as_full_error(), false )
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
    let tests = [
      // Sans options
        'Test simple de l’égalité ou de la différence'
      , ['1,2',           false, "1 devrait être égal à 2"]
      , ['2,1+1',         true,  "2 est égal à 2"]
      , ['1,"1"',         true,  "1 est égal à 1"]
      , ['1,"1",{strict:true}', false, "1 {Number} n'est pas strictement égal à 1 {String}"]
      , 'Test simple de supériorité et infériorité'
      , ['1>2,true',      false,  "false devrait être égal à true"]
      , ['1>2,true,{actual_str:"1>2"}',      false,  "1>2 devrait être égal à true"]
      , ['1>2,true,{message_success:"1 est supérieur à 2",message_failure:"1 n’est pas supérieur à 2"}',      false,  "1 n’est pas supérieur à 2"]
      , ['1>2,false',     true,   "false est égal à false"]
      , ['1>2,false,{actual_str:"1>2"}',     true,   "1>2 est égal à false"]
      , ['1<2,true',      true,   "true est égal à true"]
      , ['1<2,true,{actual_str:"1<2"}',      true,   "1<2 est égal à true"]
      , ['1<2,true,{message_success:"1 est inférieur à 2"}',      true,   "1 est inférieur à 2"]
      , ['1<2,false',     false,  "true devrait être égal à false"]
      , ['1<2,false,{actual_str:"1<2"}',     false,  "1<2 devrait être égal à false"]
      // Options définissent la façon d'écrire la valeur attendue
      , 'Définition de la façon d’écrire le texte dans le message de retour'
      , ['2,1+1,{expect_str:"1 + 1"}', true, "2 est égal à 1 + 1"]
      // Options définissent la façon d'écrire la valeur donnée
      , ['1+1,2',         true, "2 est égal à 2"]
      , ['1+1,2,{actual_str:"1 + 1"}',  true, "1 + 1 est égal à 2"]
      , ['1+1,2,{actual_str:"Le nombre d’invités"}', true, "Le nombre d’invités est égal à 2"]
      // En utilisant un template
      , 'Utilisation d’un template pour afficher le résultat'
      , ['1,1+1,{message_failure:"__ACTUAL__ est différent de __EXPECT__"}', false, "1 est différent de 2"]
      , ['1,2,{message_failure:"__ACTUAL__ est différent de __EXPECT__", actual_str:"le chiffre 1",expect_str:"le chiffre 2"}', false, "le chiffre 1 est différent de le chiffre 2"]
      , ['2,1+1,{message_success:"__ACTUAL__ est pareil que __EXPECT__", actual_str:"le chiffre 2",expect_str:"la somme 1+1"}', true, "le chiffre 2 est pareil que la somme 1+1"]
    ]

    // On définit le writer qui va permettre d'écrire les résultats
    // et on le donne à la classe Case pour que les cas en profitent
    let output = new Writer('tests-results')
    Case.writer = output

    tests.map( (arr_test) => {
      if ( 'string' == typeof arr_test )
      { output.write(arr_test, 'title') }
      else
      {
        let [code, expect_resultat, expect_message] = arr_test
        new Case(`new Estimator(${code}).result()`, expect_resultat, expect_message)
          .output()
      }
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
  }

  write_path ( filepath )
  { this.write_div( filepath,'file')    }
  write_describe (describe)
  { this.write_div(describe,'describe') }
  write_context (context)
  { this.write_div(context,'context')   }

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
    divres.innerHTML = `
<span class="total_count">${this.nombre_total_cases} tests</span>
<span class="pass_count">${this.nombre_succes} success</span>
<span class="fail_count">${this.nombre_echecs} failures</span>
<span class="pend_count">0 pendings</span>
    `
    this.container.appendChild(divres)
  }
  /**
  * @param cas            {String} Le cas abordé (le describe).
  *                       {Array} [describe, contexte]
  * @param resultat_str   {String}
  * @param okCase         {Boolean} True si c'est bon
  * Les deux paramètres suivants ne servent que pour le test des tests. Il
  * permet d'ajouter une mention sur le message attendu, qui doit correspondre
  * au message attendu. On ajoute le @messageReport sous le cas présent.
  * @param messageOK           {Boolean} True si le message attendu correspond
  *                            au message obtenu.
  * @param messageReport       {String} Le rapport concernant le message, que
  *                            le message soit OK ou non. C'est ce message
  *                            qu'on écrit sous le cas, en vers si messageOK
  *                            ou en rouge dans le cas contraire.
  */
  write_case (cas, resultat_str, okCase, messageOK, messageReport)
  {

    let context

    this.nombre_total_cases += 1
    if ( okCase ) { this.nombre_succes += 1 }
    else { this.nombre_echecs += 1 }

    if ( 'string' == typeof cas )
    {
      context = null
    }
    else
    {
      [cas, context] = cas
    }

    // Le div principal du cas
    let divcase = document.createElement('div')
    divcase.className = `case ${okCase ? 'pass' : 'fail'}`
    // Le contexte s'il y en a un
    if ( context )
    {
      let contcase = document.createElement('div')
      contcase.className = `context ${okCase ? 'pass' : 'fail'}`
      contcase.innerHTML = context
      divcase.appendChild(contcase)
    }
    // Le libellé supérieur
    let libelle = document.createElement('div')
    libelle.className = 'lib'
    libelle.innerHTML = cas
    divcase.appendChild(libelle)

    divcase.appendChild(this.builtMessage(resultat_str, okCase))
    this.container.appendChild(divcase)

    // En mode test de l'application, on vérifie la validité du
    // message retourné.
    if ( undefined !== messageOK )
    { // Note sur le message
      divcase.appendChild(this.builtMessage(messageReport, messageOK))
    }
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

  /**
  * Écrire le résumé
  **/

}

class Case
{
  /** Le {Writer} "writer" avec lequel il faut écrire le message */
  static set writer (v) { this._writer = v }
  static get writer ()  { return this._writer }
}
// ---------------------------------------------------------------------

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
    /**
    * Quand la page est prête
    **/


    // On prévient le main process que l'application est prête
    ipc.send('ptests-ready')

    /**
    * /Fin de quand la page est prête
    **/
  }},100) // le setInterval pour attendre que la page soit prête

}// /fin de si `document` est défini


/** ---------------------------------------------------------------------
  *
  *   DESCRIBER
  *
**/
class Describer
{
  constructor (description)
  {
    this.description = description
    Case.writer.write_describe(this.description)
  }
  // Note : contrairement au describe et au context, le it
  // sera inscrit dans le document en même temps que le résultat
  // des cas.
  it (description, methodetests)
  {
    log(`it = ${description}`)
    // pour les messages d'erreur de fin
    // TODO Faire une classe It plus tard
    PTests.current_it = description
    this.it_description = description
    methodetests.call()
    return this
  }
  context (description)
  {
    this.context_description = description
    Case.writer.write_context(description)
    return this
  }

  // On crée un nouveau describer
  static describe (description)
  {
    let new_describer = new Describer(description)
    Describer.last = new_describer
    return new_describer
  }

  static get last () { return this._last_describer }
  static set last (describer){this._last_describer = describer}
}
Describer.prototype.and = Describer.prototype.it


/** ---------------------------------------------------------------------
  *
  * OBJET "TOURNANT"
  *
  * Ici sont définis toutes les méthodes utilisées dans les "cases"
  *
*** --------------------------------------------------------------------- */

class PTestExpectObject
{
  constructor ( actual, actual_str )
  {
    this.actual     = actual
    this.actual_str = actual_str
    this.file       = PTests.current_file
    this.it         = PTests.current_it
    this.expect     = undefined
    this.expect_str = undefined
    this.positive   = true
    this.strict     = false
  }

  // Méthode qui retourne le code HTML de l'expect objet pour inscription
  // après le résumé quand il y a eu une erreur
  as_full_error ()
  {
    return `
<div class="error-after-resume">
<div><span class="err-numero">${this.numero}</span><span class="file">${this.file}</span><span class="err-line">::${this.error_line}</span></div>
<div class="error">${this.it} => ${this.returnedMessage}</div>
</div>
`
  }
  // Méthode à appeler au tout début de toute méthode de comparaison
  //
  // Noter que cette méthode n'est pas systématiquement appelée. Parfois,
  // la méthode de comparaison doit construire elle-même la version string
  // de la valeur attendue.
  //
  setExpect(exp, exp_str)
  {
    this.expect     = exp
    this.expect_str = exp_str
  }

  get expect_str () { return this._expect_str }
  set expect_str (v){
    if ( v ) { this._expect_str = `${v} (${this._expect})` }
    else { this._expect_str = `${this.expect}` }
  }
  get actual_str () { return this._actual_str }
  set actual_str (v){
    if ( v ) { this._actual_str = `${v} (${this.actual})` }
    else { this._actual_str = `${this.actual}` }
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
    return this.resultat_droit == this.positive
  }
  /** ---------------------------------------------------------------------
    *   Termes idiomatiques
    *   -------------------
    *   Ils ne servent à rien dans l'estimation mais permettent d'avoir
    *   des phrases plus idiomatiques.
    *
  *** --------------------------------------------------------------------- */

  get to () {
    // log("Entrée dans le to de", this.actual_str)
    return this
  }
  get be () {
    // log('Entrée dans le be de', this.actual_str)
    return this
  }
  get and () {
    // log('Entrée dans le and du case de', this.actual_str)
    return this
    // TODO : peut-être qu'à l'avenir on pourra créer une autre
    //        instance de case pour ce and.
  }
  get is () {
    return this
  }
  get returnedMessage ()
  {
    if ( undefined === this._returned_message )
    {
      let
          pos           = this.positive
        , strict        = this.strict
        , withType      = strict && !this.noType
        , ok            = this.isOK
        , mkOK          = ok ? 'OK' : `Erreur line ${this.error_line}`
        , mkType        = withType ? ` {${typeof this.actual}}` : ''
        // , mkVerbIfPass  = pos ? 'est' : 'n’est pas'
        // , mkVerbIfFail  = pos ? 'n’est pas' : 'ne devrait pas être'
        // , mkVerb        = ok ? mkVerbIfPass : mkVerbIfFail
        , mkVerb        = (pos == ok) ? 'est' : 'n’est pas'
        , mkStrict      = strict ? ' strictement' : (this.alt_strict || '')
        , mkVerbComp    = this.verb_comparaison

      let m = `${mkOK}, ${this.actual_str}${mkType} ${mkVerb}${mkStrict} ${mkVerbComp}`

      if ( this.expect ) {
        let
            expstr    = this.expect_str
          , mkExtType = withType ? ` {${typeof this.expect}}` : ''
        m += ` ${this.preposition_expect || 'à '}${expstr} ${mkExtType}`
      }
      this._returned_message = m
    }
    return this._returned_message
  }

  /** ---------------------------------------------------------------------
    *   MOTS DE FIN DE COMPARAISON
    *   Ce sont les mots qui marquent la fin d'un cas et son lancement
    *   pour analyse et résultat.
    *   C'est donc ici que sont fabriquées les phrases de résultat.
  *** --------------------------------------------------------------------- */
  equal (value, value_str)
  {
    this.setExpect(value, value_str)

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
  greater_than (value, value_str)
  {
    // log("Entrée dans le greater_than de", this.actual)
    this.setExpect(value, value_str)
    this.alt_strict       = ' égal ou'
    this.verb_comparaison = 'supérieur'
    this.noType           = true // pas de type dans les messages de résultat

    // Comparaison
    this.resultat_droit = this.strict ? this.actual > this.expect : this.actual >= this.expect

    return this.writeCase()
  }
  less_than (value, value_str)
  {
    // log("Entrée dans le less_than de", this.actual)
    this.setExpect(value, value_str)

    // Comparaison
    this.resultat_droit = this.strict ? this.actual < this.expect : this.actual <= this.expect

    this.alt_strict       = ' égal ou'
    this.verb_comparaison = 'inférieur'
    this.noType           = true // pas de type dans les messages de résultat

    return this.writeCase()
  }
  between (array_values, value_str)
  {
    let
        [first, second] = array_values
      , res
    this.expect       = array_values
    this._expect_str  = value_str || `${first} et ${second}`
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

  instanceof (type)
  {
    return this
  }

  /** ---------------------------------------------------------------------
    *   Méthodes fonctionnelle
    *
  *** --------------------------------------------------------------------- */

  // Méthode qui écrit le résultat du test
  //
  // TODO Pouvoir indiquer à Case.writer que c'est la suite d'un même
  // test pour ne pas avoir à tout remettre
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
          if (fichier == PTests.current_file) { errLine = line }
          return ''
        })
        if ( errLine ) break
      }
      if ( errLine ) { this.error_line = errLine }
    }

    // On écrit le cas dans le document
    Case.writer.write_case (Describer.last.it_description, this.returnedMessage, this.isOK)

    // En cas d'échec, on mémorise cet PTextExpectObject pour les afficher
    // tous à la fin
    if ( ! this.isOK )
    {
      PTests.add_error( this )
    }

    // Pour le chainage
    return this
  }

}
// alias
PTestExpectObject.prototype.equal_to = PTestExpectObject.prototype.equal
PTestExpectObject.prototype.equals   = PTestExpectObject.prototype.equal


// `expect` est exposé au monde par PTest
// Il permet de fournir la valeur @_actual qui devra être comparée
// avec la valeur attendue, qui arrivera certainement en bout de chaine,
// de façon explicite ou implicite.
//
// Ce expect, au moment de sa définition, est associé au dernier it produit
function expect(_actual, _actual_str)
{
  log(`J'instancie un nouvel expect avec la valeur ${_actual}`)
  return new PTestExpectObject(_actual, _actual_str)
}

/**
*   EXPOSITION DES MÉTHODES NÉCESSAIRES
**/
// global.Estimator = Estimator
global.expect = expect
global.describe = Describer.describe
// global.describe = PTests.describe
// global.ptest    = PTests


module.exports = PTests
