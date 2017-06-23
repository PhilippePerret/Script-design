/*

  NOTES
      * Ce script est chargé par la fenêtre PTests.html qui va recevoir tous
        les messages des résultats des tests.

*/
class PTest {


}

/**

  Classe Estimator
  ----------------
  Classe utilisée en interne par PTest pour produire le résultat du
  test.

  @usage

      let { success, message } = new Estimator(exp1, exp2[, {options}]).result()

      Sans options :

        let { success, message } = new Estimator(1, 2)
        // => { success: false, message: "1 n'est pas égal à 2"}
**/

class Estimator {
  constructor ( actual, expect, options )
  {
    this.actual   = actual
    this.expect   = expect
    if ( undefined === options ) options = {}
    this.options  = options
    if ( undefined === options.positive ) options.positive = true
    this.positive = options.positive
    if ( undefined === options.strict ) options.strict = false
    this.strict   = options.strict
  }

  /**
  * @return {Object} Le résultat obtenu, avec les clés :
  *   success: true/false
  *   message: <Le message de résultat>
  **/
  result ()
  {
    return {
        success:  this.evaluation
      , resultat: this.evaluation // only pour la sémantique
      , message:  this.output()
    }
  }
  /** ---------------------------------------------------------------------
    *   Méthode logiques
    *
  *** --------------------------------------------------------------------- */
  // Évalue l'expression
  // @return true si le résultat est bon, false dans le cas
  // contraire.
  get evaluation ()
  {
    if (undefined === this._evaluation) {this._evaluation = this.evaluate()}
    return this._evaluation
  }

  evaluate ()
  {
    if ( this.strict )
    {
      return this.positif === (this.actual === this.expected)
    }
    else
    {
      return this.positif === (this.actual == this.expected)
    }
  }

  /** ---------------------------------------------------------------------
    *   Helpers de message
    *
  *** --------------------------------------------------------------------- */

  get actual_str ()
  {
    if ( undefined == this._actual_str )
    {
      this._actual_str = this.options.actual_as_string || this.options.actual_str || this.actual
    }
    return this._actual_str
  }
  get expect_str ()
  {
    if (undefined === this._expect_str )
    {
      this._expect_str = this.options.expect_as_string || this.options.expect_str || this.expect
    }
    return this._expect_str
  }
  /**
  * @return {String} Le template pour le message en cas de succès
  **/
  get message_success ()
  {
    if ( undefined === this._message_success )
    { this._message_success = this.define_message_success() }
    return this._message_success
  }
  /**
  * @return {String} Le template pour le message en cas d'échec
  **/
  get message_failure ()
  {
    if ( undefined === this._message_failure )
    { this._message_failure = this.define_message_failure() }
    return this._message_failure
  }

  define_message_success () {
    if ( undefined === this.options.message_success )
    {
      if ( this.positive ) {
        return `${this.actual_str} est ${this.strictement}égal à ${this.expect_str}`
      } else {
        return `${this.actual_str} est ${this.strictement}différent de ${this.expect_str}`
      }
    }
    else { return this.options.message_success }
  }
  get strictement () { return ( this.strict ? 'strictement ' : '' ) }
  define_message_failure ()
  {
    if ( undefined === this.options.message_failure )
    {
      if ( this.positive ) {
        return `${this.actual_str} devrait être ${this.strictement}égal à ${this.expect_str}`
      } else {
        return `${this.actual_str} ne devrait pas être ${this.strictement}égal à ${this.expect_str}`
      }
    }
    else { return this.options.message_failure }
  }
  /**
    * @return {String} Le message résultat
    */
  output ()
  {
    // On prend le message appropriéé et on le formate
    return this.formate(
                  this[`message_${this.evaluation ? ' success' : 'failure'}`]
                )

  }
  // Formate le message renvoyé
  formate (message)
  {
    message = message.replace(/__ACTUAL__/g, this.actual_in_message)
    message = message.replace(/__EXPECT__/g, this.expect_in_message)
    return message
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

  write_case (cas, resultat_str, okCase)
  {
    let divcase = document.createElement('div')
    divcase.className = `case ${okCase ? 'pass' : 'fail'}`
    let libelle = document.createElement('div')
    libelle.className = 'lib'
    libelle.innerHTML = cas
    divcase.appendChild(libelle)
    if ( ! okCase ) { resultat_str = `ERREUR : ${resultat_str}`}
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
      case 'neutral':
        return 'neutral'
      case true:
      case 'success':
      case 'pass':
        return 'pass'
      case false:
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
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  /** Le {Writer} "writer" avec lequel il faut écrire le message */
  static set writer (v) { this._writer = v }
  static get writer ()  { return this._writer }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor (expression, expected_resultat, expected_message)
  {
    this.expression         = expression
    this.expected_resultat  = expected_resultat
    this.expected_message   = expected_message
  }
  /**
  * La sortie du message de résultat
  **/
  output ()
  {
    let message

    if ( this.isOK )
    {
      // Un succès attendu
      if ( true === this.expected_resultat )
      { message = `${this.expression} produit bien un succès.` }
      // Un échec attendu
      else
      { message = `${this.expression} produit bien un échec.` }
    }
    else
    {
      // Un échec inattendu (le succès était attendu)
      if ( true === this.expected_resultat )
      { message = `${this.expression} devrait produire un succès.` }
      // Un succès inattendu (l'échec était attendu)
      else
      { message = `${this.expression} devrait produire un échec.` }
    }

    if ( this.isOK && this.expected_message != this.actual_message )
    {
      // Le test a réussi (échec ou succès obtenu, correspondant au choix),
      // mais le message de résultat ne correspond pas au message attendu.
      Case.writer.write_case(this.expression, `Le message de résultat ne correspond pas au message attendu…<br>Message de résultat attendu : « ${this.expected_message} »<br>Message reçu : « ${this.actual_message} »`, false)
    }
    else
    {
      Case.writer.write_case(this.expression, message, this.isOK)
    }


  }
  get isOK ()
  {
    return this.actual_resultat === this.expected_resultat
  }
  get actual_message ()
  {
    if (undefined === this._actual_message)
    { this._actual_message = this.evaluation.message }
    return this._actual_message
  }
  get actual_resultat ()
  {
    if (undefined === this._actual_resultat)
    { this._actual_resultat = this.evaluation.resultat }
    return this._actual_resultat
  }
  get evaluation ()
  {
    if ( undefined === this._evaluation ){
      this._evaluation = eval(this.expression)
    }
    return this._evaluation
  }
}
// ---------------------------------------------------------------------




let timer = setInterval(
function(){
if ('complete' === document.readyState)
{clearInterval(timer)
  /**
  * Quand la page est prête
  **/


  // Tests
  function mainLog(m,o){console.log(m,o)}


  function shouldReturn (expr,expect,res){write(`${expr} devrait retourner le message “${expect}” au lieu de “${res.message}”`, false)}

  let tests = [
    // Sans options
      'Test simple de l’égalité ou de la différence'
    , ['1,2',           false, "1 devrait être égal à 2"]
    , ['2,1+1',         true,  "2 est égal à 2"]
    // // Options définissent la façon d'écrire la valeur attendue
    // , 'Définition de la façon d’écrire le texte dans le message de retour'
    // , ['2,1+1,{expect_str:"1 + 1"}', true, "2 est égal à 1 + 1"]
    // // Options définissent la façon d'écrire la valeur donnée
    // , ['1+1,2',         true, "2 est égal à 2"]
    // , ['1+1,2,{actual_str:"1 + 1"}',  true, "1 + 1 est égal à 2"]
    // // En utilisant un template
    // , 'Utilisation d’un template pour afficher le résultat'
    // , ['1,2,{message_failure:"__ACTUAL__ est différent de __EXPECT__", actual_str:"le chiffre 1",expect_str:"le chiffre 2"}', false, "le chiffre 1 est différent de le chiffre 2"]
    // , ['2,1+1,{message_success:"__ACTUAL__ est pareil que __EXPECT__", actual_str:"le chiffre 2",expect_str:"la somme 1+1"}', false, "le chiffre 2 est pareil que la somme 1+1"]
  ]

  // On définit le writer qui va permettre d'écrire les résultats
  // et on le donne à la classe Case pour que les cas en profitent
  let output = new Writer('tests-results')
  output.write('Bienvenue dans les tests')
  Case.writer = output

  tests.map( (arr_test) => {
    if ( 'string' == typeof arr_test )
    {
      // => simple titre à mettre pour découper le test
      output.write(arr_test, 'title')
    }
    else
    {
      // => un vrai test
      let [code, expect_resultat, expect_message] = arr_test
      // TODO Ne test pas encore si le message attendu correspond.
      new Case(`new Estimator(${code}).result()`, expect_resultat, expect_message)
        .output()
      // TODO : À METTRE DANS LE CAS
      // if ( res.message != expected_message ){ shouldReturn(expr,expected_message,res)}
    }
  })

  let offset = document.getElementById('tests-results').offsetHeight
  output.write(`offset = ${offset}`)
  window.scrollTo(0,offset)
  /**
  * /Fin de quand la page est prête
  **/
}},100) // le setInterval pour attendre que la page soit prête




module.exports = PTest
