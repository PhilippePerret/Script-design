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
    const fenPTests = new BrowserWindow({x: -1000, y: 0, width:1500, heigth:500, show: false, devTools:true})
    // fenPTests.openDevTools()
    // Cette ligne fonctionnait lorsqu'elle était appelée par la fenêtre main.js
    // fenPTests.loadURL('file:///'+path.join(C.LIB_UTILS_FOLDER,'PTests.html'))
    fenPTests.loadURL('file://'+path.join(__dirname,'PTests.html'))
    fenPTests.on('ready-to-show', (evt) => {
      // console.log('-> ready-to-show')
      fenPTests.show()
    })
  }


  /**
  *   Lance la suite de tests
  *
  *   Pour le moment, ils se trouvent dans le dossier ./tests/ptests/
  **/
  static run ()
  {
    // On définit le writer qui va permettre d'écrire les résultats
    // et on le donne à la classe Case pour que les cas en profitent
    let output = new Writer('tests-results')
    Case.writer = output


    let ptests_folder = path.join('.','tests','ptests')
    glob(path.join(ptests_folder,'**','*_spec.js'), (err, files) => {
      if ( err ){ throw err }
      files.map( (frelpath) => {
        let fpath = path.resolve(path.join('.',frelpath))
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
      })
    })
  }

  // /**
  //  *
  //  */
  // static describe ( str_describe )
  // {
  //   console.log(`Le describe est « ${str_describe} »`)
  //   return itObjectClass
  // }

  // static isEqual(expr1, expr2, strict) {
  //   // return console.log("[class PTests] Est-ce que expr1 == expr2 : ", expr1 == expr2)
  //   new Case(`new Estimator(${expr1} == ${expr2}, true, {strict: ${!!strict}}).result()`, true).output()
  // }

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

    let offset = document.getElementById('tests-results').offsetHeight
    output.write(`offset = ${offset}`)
    window.scrollTo(0,offset)

  }
}
//
// /**
//
//   Classe Estimator
//   ----------------
//   Classe utilisée en interne par PTest pour produire le résultat du
//   test.
//
//   @usage
//
//       let { success, message } = new Estimator(exp1, exp2[, {options}]).result()
//
//       Sans options :
//
//         let { success, message } = new Estimator(1, 2)
//         // => { success: false, message: "1 n'est pas égal à 2"}
// **/
//
// class Estimator {
//   constructor ( actual, expect, options )
//   {
//     this.actual   = actual
//     this.expect   = expect
//     if ( undefined === options ) options = {}
//     this.options  = options
//     if ( undefined === options.positive ) options.positive = true
//     this.positive = options.positive
//     if ( undefined === options.strict ) options.strict = false
//     this.strict   = options.strict
//     // console.log("Instance Estimator")
//     // console.log(this)
//   }
//
//   /**
//   * @return {Object} Le résultat obtenu, avec les clés :
//   *   success: true/false
//   *   message: <Le message de résultat>
//   **/
//   result ()
//   {
//     return {
//         success:  this.evaluation
//       , resultat: this.evaluation // only pour la sémantique
//       , message:  this.output()
//     }
//   }
//   /** ---------------------------------------------------------------------
//     *   Méthode logiques
//     *
//   *** --------------------------------------------------------------------- */
//   // Évalue l'expression
//   // @return true si le résultat est bon, false dans le cas
//   // contraire.
//   get evaluation ()
//   {
//     if (undefined === this._evaluation) {this._evaluation = this.evaluate()}
//     return this._evaluation
//   }
//
//   evaluate ()
//   {
//     if ( this.strict )
//     {
//       return this.positive === (this.actual === this.expect)
//     }
//     else
//     {
//       return this.positive === (this.actual == this.expect)
//     }
//   }
//
//   /** ---------------------------------------------------------------------
//     *   Helpers de message
//     *
//   *** --------------------------------------------------------------------- */
//
//   get actual_str ()
//   {
//     if ( undefined == this._actual_str )
//     {
//       this._actual_str = this.options.actual_as_string || this.options.actual_str || this.actual
//     }
//     return this._actual_str
//   }
//   get expect_str ()
//   {
//     if (undefined === this._expect_str )
//     {
//       this._expect_str = this.options.expect_as_string || this.options.expect_str || this.expect
//     }
//     return this._expect_str
//   }
//   /**
//   * @return {String} Le template pour le message en cas de succès
//   **/
//   get message_success ()
//   {
//     if ( undefined === this._message_success )
//     { this._message_success = this.define_message_success() }
//     return this._message_success
//   }
//   /**
//   * @return {String} Le template pour le message en cas d'échec
//   **/
//   get message_failure ()
//   {
//     if ( undefined === this._message_failure )
//     { this._message_failure = this.define_message_failure() }
//     return this._message_failure
//   }
//   get actual_type () { return (typeof this.actual).titleize() }
//   get expect_type () { return (typeof this.expect).titleize() }
//   define_message_success () {
//     if ( ! this.options.message_success )
//     {
//       // On construit le message
//       let act = this.actual_str
//       let acttyp = this.strict ? ` {${this.actual_type}` : ''
//       let strictement = this.strict ? 'strictement ' : ''
//       let egal_a = this.positive ? 'égal à' : 'différent de'
//       let exp = this.expect_str
//       let exptyp = this.strict && !this.positive ? ` {${this.expect_type}}` : ''
//       return `${act}${acttyp} est ${strictement}${egal_a} ${exp}${exptyp}`
//     }
//     else { return this.options.message_success }
//   }
//
//   define_message_failure ()
//   {
//     if ( ! this.options.message_failure )
//     {
//       let act_str = this.actual_str
//       let act_type = this.strict ? ` {${this.actual_type}}` : ''
//       let pos_verbe = this.strict ? "n'est pas" : "devrait être"
//       let devrait_etre = this.positive ? pos_verbe : 'ne devait pas être'
//       let strictement = this.strict ? ' strictement' : ''
//       let exp_str   = this.expect_str
//       let exp_type  = this.strict && this.positive ? ` {${this.expect_type}}` : ''
//       return `${act_str}${act_type} ${devrait_etre}${strictement} égal à ${exp_str}${exp_type}`
//     }
//     else { return this.options.message_failure }
//   }
//   /**
//     * @return {String} Le message résultat
//     */
//   output ()
//   {
//     // On prend le message appropriéé et on le formate
//     return this.formate(this[`message_${this.evaluation?'success':'failure'}`])
//
//   }
//   // Formate le message renvoyé
//   formate (message)
//   {
//     message = message.replace(/__ACTUAL__/g, this.actual_str)
//     message = message.replace(/__EXPECT__/g, this.expect_str)
//     return message
//   }
// }
//


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
  // // Quand le describe et le context ont été écrits et qu'il faut
  // // écrire le résultat d'un cas
  // write_case_result ()
  // {
  //
  // }

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
      case 'neutral':
        return 'neutral'
      case true: // succès
      case 'success':
      case 'pass':
        return 'pass'
      case false: // échec
      case 'failure':
      case 'fail':
        return 'fail'
      default:
        return type || 'notice'
    }
  }
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

class TurnObject
{
  constructor ( actual, actual_str )
  {
    this.actual     = actual
    this.actual_str = actual_str
    this.expect     = undefined
    this.expect_str = undefined
    this.positive   = true
    this.strict     = false
  }

  // Méthode à appeler au tout début de toute méthode de comparaison
  setExpect(exp, exp_str)
  {
    this.expect = exp
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
    log("Entrée dans le 'not' de ", this.actual)
    this.positive = false
    return this
  }
  get strictly () {
    log("Entrée dans le 'strictly' de ", this.actual)
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
    log('Entrée dans le "is" du case', this.actual_str)
    return this
  }
  get returnedMessage ()
  {
    let
        pos           = this.positive
      , strict        = this.strict
      , ok            = this.isOK
      , mkOK          = ok ? 'OK' : 'Erreur'
      , mkType        = strict ? ` {${typeof this.actual}}` : ''
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
        , mkExtType = strict ? ` {${typeof this.expect}}` : ''
      m += ` ${this.preposition_expect || 'à'} ${expstr} ${mkExtType}`
    }
    return m
  }

  /** ---------------------------------------------------------------------
    *
    *   MOTS DE FIN DE COMPARAISON
    *   Ce sont les mots qui marquent la fin d'un cas et son lancement
    *   pour analyse et résultat.
    *   C'est donc ici que sont fabriquées les phrases de résultat.
  *** --------------------------------------------------------------------- */
  equal (value, value_str)
  {
    log("Entrée dans le equal de… avec…", [this.actual, value])
    this.setExpect(value, value_str)

    if ( this.strict ) {
      this.resultat_droit = (this.expect === this.actual)
    }
    else {
      this.resultat_droit = this.expect == this.actual
    }

    // Définition du message à retourner
    this.verb_comparaison = 'égal'

    // On écrit le résultat
    this.writeCase()

    // On retourne l'instance car on peut faire plusieurs tests à
    // la suite avec des `and`.
    return this

  }
  greater_than (value, value_str)
  {
    // log("Entrée dans le greater_than de", this.actual)
    this.setExpect(value, value_str)

    // Comparaison
    this.resultat_droit = this.strict ? this.actual > this.expect : this.actual >= this.expect

    this.alt_strict       = ' égal ou'
    this.verb_comparaison = 'supérieur'

    this.writeCase()

    return this
  }
  less_than (value)
  {
    // log("Entrée dans le less_than de", this.actual)

    this.verb_comparaison = 'inférieur'

    return this
  }
  between (array_value, other_value)
  {
    return this
  }
  instanceof (type)
  {

  }

  /** ---------------------------------------------------------------------
    *   Méthodes fonctionnelle
    *
  *** --------------------------------------------------------------------- */

  // Méthode qui écrit le résultat du test
  //
  // TODO Pouvoir indiquer à Case.writer que c'est la suite d'un même
  // test pour ne pas avoir à tout remettre
  writeCase ()
  {
    log('-> TurnObject#writeCase')
    Case.writer.write_case (Describer.last.it_description, this.returnedMessage, this.isOK)
  }

}
// alias
TurnObject.prototype.equal_to = TurnObject.prototype.equal
TurnObject.prototype.equals   = TurnObject.prototype.equal


// `expect` est exposé au monde par PTest
// Il permet de fournir la valeur @_actual qui devra être comparée
// avec la valeur attendue, qui arrivera certainement en bout de chaine,
// de façon explicite ou implicite.
//
// Ce expect, au moment de sa définition, est associé au dernier it produit
function expect(_actual, _actual_str)
{
  log(`J'instancie un nouvel expect avec la valeur ${_actual}`)
  return new TurnObject(_actual, _actual_str)
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
