/*

  NOTES
      * Ce script est chargé par la fenêtre PTests.html qui va recevoir tous
        les messages des résultats des tests.

*/
String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}
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
    console.log("Instance Estimator")
    console.log(this)
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
      return this.positive === (this.actual === this.expect)
    }
    else
    {
      return this.positive === (this.actual == this.expect)
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
  get actual_type () { return (typeof this.actual).titleize() }
  get expect_type () { return (typeof this.expect).titleize() }
  define_message_success () {
    if ( ! this.options.message_success )
    {
      // On construit le message
      let act = this.actual_str
      let acttyp = this.strict ? ` {${this.actual_type}` : ''
      let strictement = this.strict ? 'strictement ' : ''
      let egal_a = this.positive ? 'égal à' : 'différent de'
      let exp = this.expect_str
      let exptyp = this.strict && !this.positive ? ` {${this.expect_type}}` : ''
      return `${act}${acttyp} est ${strictement}${egal_a} ${exp}${exptyp}`
    }
    else { return this.options.message_success }
  }

  define_message_failure ()
  {
    if ( ! this.options.message_failure )
    {
      let act_str = this.actual_str
      let act_type = this.strict ? ` {${this.actual_type}}` : ''
      let pos_verbe = this.strict ? "n'est pas" : "devrait être"
      let devrait_etre = this.positive ? pos_verbe : 'ne devait pas être'
      let strictement = this.strict ? ' strictement' : ''
      let exp_str   = this.expect_str
      let exp_type  = this.strict && this.positive ? ` {${this.expect_type}}` : ''
      return `${act_str}${act_type} ${devrait_etre}${strictement} égal à ${exp_str}${exp_type}`
    }
    else { return this.options.message_failure }
  }
  /**
    * @return {String} Le message résultat
    */
  output ()
  {
    // On prend le message appropriéé et on le formate
    return this.formate(this[`message_${this.evaluation?'success':'failure'}`])

  }
  // Formate le message renvoyé
  formate (message)
  {
    message = message.replace(/__ACTUAL__/g, this.actual_str)
    message = message.replace(/__EXPECT__/g, this.expect_str)
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

  /**
  * @param cas            {String} Le cas abordé.
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
    // Le div principal du cas
    let divcase = document.createElement('div')
    divcase.className = `case ${okCase ? 'pass' : 'fail'}`
    // Le libellé supérieur
    let libelle = document.createElement('div')
    libelle.className = 'lib'
    libelle.innerHTML = cas
    divcase.appendChild(libelle)

    if ( ! okCase ) { resultat_str = `ERREUR : ${resultat_str}`}
    divcase.appendChild(this.builtMessage(resultat_str, okCase))
    this.container.appendChild(divcase)

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

  /**
   *  Instanciation d'un Case
   *
   * @param expression          {String} Expression à évaluer
   * @param expected_resultat   {Boolean} Résultat attendu, réussite ou échec
   * @param expected_message    {String} Si fourni, on doit faire deux tests :
   *                            1. Vérifier que le résultat attendu est le bon
   *                            2. Vérifier que le message attendu soit le bon.
   *                            Cette donnée n'est utile que pour les tests de
   *                            ce testeur.
   */
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
      // { message = `${this.expression} produit bien un succès.` }
      { message = `Produit bien un succès.` }
      // Un échec attendu
      else
      // { message = `${this.expression} produit bien un échec.` }
      { message = `Produit bien un échec.` }
    }
    else
    {
      // Un échec inattendu (le succès était attendu)
      if ( true === this.expected_resultat )
      { message = `Devrait produire un succès.` }
      // Un succès inattendu (l'échec était attendu)
      else
      { message = `Devrait produire un échec.` }
    }


    if ( this.isOK && this.expected_message )
    {
      let   reportOnMessage
          , messageIsOK = this.expected_message == this.actual_message
      if ( messageIsOK )
      { reportOnMessage = `« ${this.expected_message} » correspond au message attendu.`}
      else
      { reportOnMessage = `Le message du rapport ne correspond pas au message attendu…<br>Message attendu : « ${this.expected_message} »<br>Message reçu : « ${this.actual_message} »` }

      // Cas programmation, pour voir si le message rendu correspond au message
      // attendu.
      // Note : bien sûr, seulement dans le cas où l'évaluation est probante, c'est-à-dire
      // si on obtient un succès quand on veut un succès ou une failure quand on attend une
      // failure.
      Case.writer.write_case(this.expression, message, this.isOK, messageIsOK, reportOnMessage)
    }
    else
    {
      // Cas normal, sans test du message renvoyé
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

  /*
    TODO Tests à faire

      - test du mode strict

  */
  let tests = [
    // Sans options
      'Test simple de l’égalité ou de la différence'
    , ['1,2',           false, "1 devrait être égal à 2"]
    , ['2,1+1',         true,  "2 est égal à 2"]
    , ['1,"1"',         true,  "1 est égal à 1"]
    , ['1,"1",{strict:true}', false, "1 {Number} n'est pas strictement égal à 1 {String}"]
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
