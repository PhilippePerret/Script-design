/** ---------------------------------------------------------------------
  *   Vérification de la méthode de test contain/contains
  *
*** --------------------------------------------------------------------- */

let
    resO = {not_a_test:true}
  , act, exp
  , res
  , Any = require_module('./lib/utils/PTests_Any')

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
    , describe("et un string recherché",[
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
    , describe("et des expressions régulières",[
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
    , describe("et des listes de strings recherchés",[
      , it("produit un succès avec toutes les recherches trouvées", ()=>{
        testContain('apercevoir', ['per','ce', 'perce'], true)
      })
      , it("produit un échec si une recherche n'est pas trouvée et met le message en erreur", ()=>{
        testContain('apercevoir', ['per','ce', 'neige'], false)
        expect(Any.containityError,'Any.containityError',{no_values:true}).contains('ne contient pas « neige »')
      })
      , it("produit un échec si aucune recherche n'est trouvée et met le message en erreur", ()=>{
        testContain('apercevoir', ['aperçu','neige','chat'],false)
        expect(Any.containityError,'Any.containityError',{no_values:true})
          .contains('ne contient ni « aperçu », ni « neige », ni « chat »')
      })
    ])
  ])


  , describe("avec des ARRAYS",[
    , context("avec une recherche unique",[
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
    ])

    , context("avec une liste de recherches",[
      , it("produit un succès lorsque toutes les valeurs ont été trouvées", ()=>{
        testContain([1,2,3,4,5], [2,3,5], true)
      })
      , it("produit un échec lorsqu'une seule valeur n'est pas trouvée et retourne le bon message", ()=>{
        testContain([1,2,3,4,5], [2,3,12], false)
        expect(Any.containityError,'Any.containityError',{no_values:true})
          .contains('ne contient pas 12')
      })
      , it("produit un échec lorsqu'aucune valeur n'est trouvée et retourne le bon message", ()=>{
        testContain([1,2,3,4,5], [12,25,14], false)
        expect(Any.containityError,'Any.containityError',{no_values:true})
          .contains('ne contient ni 12, ni 25, ni 14')
      })
    ])
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
  , describe("avec un NUMBER",[
    , it("produit un échec avec le bon message d'erreur", ()=>{
      testContain(1,1, false)
      expect(Any.containityError,'Any.containityError',{no_values:true})
        .contains('Un number ne peut pas contenir un élément')
    })
  ])
])
