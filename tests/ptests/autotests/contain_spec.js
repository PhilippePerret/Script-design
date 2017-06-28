/** ---------------------------------------------------------------------
  *   Vérification de la méthode de test contain/contains
  *
*** --------------------------------------------------------------------- */

let
    resO = {not_a_test:true}
  , act, exp
  , res

function fake(fn){}

function templates(act,exp,strict)
{
  if ( 'string' === typeof act ) { act = `"${act}"` }
  else if ('RegExp' === act.constructor.name) { act = String(act)}
  else if ('object' === typeof act ) { act = JSON.stringify(act) }
  if ( 'string' === typeof exp ) { exp = `"${exp}"` }
  else if ('RegExp' === exp.constructor.name) { exp = String(exp)}
  else if ('object' === typeof exp ) { exp = JSON.stringify(exp) }
  return {success:`${act} contient ${strict?'strictement ':''}${exp}`, failure:`${act} ne contient pas ${strict?'strictement ':''}${exp}`}
}

function testContain(act, exp, valResultat, strict)
{
  if ( undefined === valResultat ) { valResultat = true }
  res = expect(act)[strict?'strictly':'to'].contain(exp,resO).isOK
  let t = templates(act,exp,strict)
  expect(res).equals(valResultat/* vrai ou faux */, {no_values:true, template:{success:(valResultat?t.success:t.failure)}})
}

describe("Méthode de test #contain",[
  , describe("avec des STRINGS",[
    , it("produit un succès quand un string est vraiment contenu", () => {
      testContain('apercevoir','perce', true)
    })
    , it("produit un succès en mode normal quand le string diffère un peu", ()=>{
      testContain('apercevoir', 'Perce', true)
    })
    , it("produit un échec en mode strict quand le string diffère un peu", ()=>{
      testContain('apercevoir','Perce', false, true)
    })
  ])
  , describe("avec des STRINGS et des expressions régulières",[
    , it("produit un succès avec une expression régulière qui matche", ()=>{
      testContain('apercevoir', /.erc./, true)
    })
    , it("produit un succès avec une expression régulière qui matche par la casse", ()=>{
      testContain('apercevoir', /.ERC./i,true)
    })
    , it("produit un échec avec une expression régulière qui ne matche pas par la casse", ()=>{
      testContain('apercevoir', /.ERC./,false)
    })
    , it("produit un échec avec une expression régulière qui ne matche pas", ()=>{
      testContain('apercevoir', /erçe/, false)
    })
  ])


  , describe("avec des ARRAYS",[
    , it("produit un succès quand un nombre est contenu dans une liste", ()=>{
      testContain([10,2,3,12], 12)
      testContain([10,2,3,12], 10)
      testContain([10,2,3,12], 2)
      testContain([10,2,3,12], 3)
    })
    , it("produit un échec quand un nombre n'est pas contenu dans une liste", ()=>{
      testContain([10,3,12], 2, false)
      testContain([10,3,12], 22, false)
    })
    , it("produit un succès quand un string est contenu dans une liste", ()=>{
      testContain(['un','deux','trois hivers'], 'un')
      testContain(['un','deux','trois hivers'], 'deux')
      testContain(['un','deux','trois hivers'], 'trois hivers')
    })
    , it("produit un échec quand un string n'est pas contenu dans la liste", ()=>{
      testContain(['un','deux'], 'trois', false)
      testContain(['un','deux'], 'trois hivers', false)
    })
    , it("produit un échec quand un string ne représente d'une partie d'un élément de la liste", ()=>{
      testContain(['un','deux','trois hivers'], 'trois', false)
      testContain(['un','deux','trois hivers'], 'hivers', false)
      testContain(['un','deux','trois hivers'], 'hiv', false)
    })
    , it("produit un échec avec un tableau recherché dans une liste", ()=>{
      // fake(() => {testContain([1,2,3], {un:"une"}, false)})
      expect(()=>{testContain([1,2,3], {un:"une"}, false)}).to.throwError('On ne peut pas encore vérifier l’appartenance d’un tableau dans une liste')
    })
    // À la rigueur, remettre la ligne qui suit pour s'assurer que le test de l'erreur ne
    // dérègle pas complètement la méthode qui gère les erreurs.
    // , it("produit un échec pour un tableau recherché dans une liste", ()=>{
    //   testContain([1,2,3], {le:"la"}, false)
    // })
  ])




  , describe("avec des TABLEAUX",[
    , it("produit un succès quand une clé et une valeur se trouve dans le tableau", ()=>{
      testContain({un:'une',il:'elle',lui:'elle',le:'la'}, {lui:'elle'}, true)
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {un:1}, true)
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {vrai:true}, true)
    })
    , it("produit un échec quand le tableau ne connait pas la clé spécifiée (mais la valeur si)", ()=>{
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {une: 1}, false)
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {l: 'elle'}, false)
    })
    , it("produit un échec quand le tableau connait la clé mais que la valeur ne correspond pas", ()=>{
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {un:'une'}, false)
      testContain({un:1,il:'elle',lui:'elle',le:'la', vrai:true}, {lui:'lui'}, false)
    })
    , context("en mode Strict",[
      , it("produit un succès si la valeur est strictement identique", ()=>{
        testContain({un:'une',il:'elle',lui:'elle',le:'la'}, {lui:'elle'}, true, true)
      })
      , it("produit une erreur si la valeur est légèrement différente", ()=>{
        testContain({un:'une',il:'elle',lui:'Elle',le:'la'}, {lui:'elle'}, false, true)
      })
    ])
  ])
])
