let
    resO = {not_a_test:true}
  , res
  , mes


// Pour ce test
class MonObjet {
  constructor (val) {
    this.value = val
  }
  maMethode () { return `Je suis une méthode l'instance avec this.value = ${this.value}` }
  static classMethod () { return "Je suis une méthode de classe"}
}

let temp = {template:{}}
function testInstance( methode, expected ){
  res = expect(MonObjet).has.instanceMethod(methode, resO).isOK

  mes = 'class MonObjet '
  if ( res == expected ) { mes += res?'connait':'ne connait pas' }
  else { mes += res?'devrait connaitre':'ne devrait pas connaitre' }
  mes += ` la méthode d'instance « ${methode} »`
  if (res == expected) { temp = { success: mes } }
  else { temp = { failure: mes } }

  expect(res).equals(expected, {template:temp, no_values:true})
}
function testClass( methode, expected ){
  res = expect(MonObjet).has.classMethod(methode, resO).isOK

  mes = 'class MonObjet '
  if ( res == expected ) { mes += res ? 'connait'  : 'ne connait pas' }
  else { mes += res ? 'devrait connaitre' : 'ne devrait pas connaitre '}
  mes += ` la méthode de classe « ${methode} »`
  if (res == expected) { temp = { success: mes } }
  else { temp = { failure: mes } }

  expect(res).equals(expected, {template:temp, no_values:true})
}

let templateTestFalse = {template:{success:'le test renvoie bien false',failure:'le test devrait renvoyer false…'}}

// ---------------------------------------------------------------------
//
//  DÉBUT DES TESTS
//
// ---------------------------------------------------------------------

describe("Méthode de test #instanceMethod",[
  , context("avec des vrais objets et de vraies méthodes",[
    , it("produit un succès si l'objet connait la méthode", ()=> {
      expect(MonObjet).has.instanceMethod('maMethode')
    })
    , it("produit un échec si l'objet ne connait pas la méthode", ()=> {
      testInstance('unknownMethod', false)
    })
    , it("produit un échec si l'instance essaie d'appeler une méthode de classe", ()=>{
      testInstance('classMethod', false)
    })
  ])
  , context("avec un objet inexistant",[
    , it("produit un échec avec le bon message d'erreur", ()=>{
      let FauxObjet
      res = expect(FauxObjet).to.have.instanceMethod('fakeMethod',resO)
      expect(res.isOK,templateTestFalse).to.be.false
      expect(res.returnedMessage,'le message d’erreur',{no_values:true})
        .contains('Le premier argument de l’expectation doit être une classe')
    })
  ])
  , context("avec un méthode qui n'est pas un string",[
    , it("produit un échec avec le bon message d'erreur", ()=>{
      res = expect(MonObjet).to.have.instanceMethod(12,resO)
      expect(res.isOK, templateTestFalse).to.be.false
      expect(res.returnedMessage,'le message d’erreur',{no_values:true})
        .contains('le premier argument de la méthode de comparaison \'instanceMethod\' doit être le nom String de la méthode.')
    })
  ])
])
describe("Méthodes de test #classMethod",[
  , context("avec un objet et des méthodes en string",[
    , it("produit un succès si la classe essaie d'appeler une méthode de classe", ()=>{
      testClass('classMethod', true)
    })
    , it("produit un succès si la classe checke une de ses méthodes", ()=>{
      testClass('classMethod', true)
    })
    , it("produit un échec si la classe check une méthode inconnue", ()=>{
      testClass('unknownClassMethod',false)
    })
    , it("produit un échec si la classe checke une méthode d'instance", ()=>{
      testClass('maMethode',false)
    })
  ])
  , context("avec un objet inexistant",[
    , it("produit un échec avec le bon message d'erreur", ()=>{
      let FauxObjet
      res = expect(FauxObjet).to.have.classMethod('fakeMethod',resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage,'le message d’erreur',{no_values:true})
        .contains('Le premier argument de l’expectation doit être une classe')
    })
  ])
  , context("avec un méthode qui n'est pas un string",[
    , it("produit un échec avec le bon message d'erreur", ()=>{
      res = expect(MonObjet).to.have.classMethod(12,resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage,'le message d’erreur',{no_values:true})
        .contains('le premier argument de la méthode de comparaison \'classMethod\' doit être le nom String de la méthode.')
    })
  ])
])
