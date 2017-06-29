/*
  Tous ces test échouent et c'est normal
*/
let   res
    , resO = {not_a_test: true}
    , opts

function testBetween(act, cont, resultat, strict)
{
  let
      res
    , entre = `entre ${cont[0]} et ${cont[1]}`
    , opts
  if ( undefined === resultat ) { resultat = true }

  // ===> On teste <===
  res = expect(act).to[strict?'strictly':'be'].between(cont,resO).isOK

  // Les messages en fonction du résultat (on fait seulement celui qu'il faut)
  if ( res === resultat ) {
    opts = {template:{success:`${act} ${res?'est bien':'n’est pas'} ${entre}`}}
  } else {
    opts = {template:{failure:`${act} ${resultat?'devrait':'ne devrait pas'} être ${entre}`}}
  }
  expect(res).equals(resultat,opts)
}

describe("Méthode de test #between",[
  , context("avec les NUMBERS",[
    , context("en mode non strict",[
      , it("1 se trouve entre 0 et 2", ()=>{
        testBetween(1,[0,2])
      })
      , it("1 se trouve entre 1 et 2", ()=>{
        testBetween(1,[1,2])
      })
      , it("1 se trouve entre 0 et 1", ()=>{
        testBetween(1,[0,1])
      })
      , it("1 ne se trouve pas entre 2 et 10", ()=>{
        testBetween(1,[2,10],false)
      })
    ])
    , context("en mode strict",[
      , it("1 se trouve entre 0 et 2", ()=>{
        testBetween(1,[0,2], true, true)
      })
      , it("1 ne se trouve pas entre 1 et 2", ()=>{
        testBetween(1,[1,2],false, true)
      })
      , it("1 ne se trouve pas entre 0 et 1", ()=>{
        testBetween(1,[0,1],false, true)
      })
      , it("1 ne se trouve pas entre 2 et 10", ()=>{
        testBetween(1,[2,10],false, true)
      })
    ])
  ])
  , context("avec les STRINGS",[
    , it("cornichon se trouve entre amour et dédain", ()=>{
      testBetween('cornichon',['amour','dédain'],true)
    })
    , it("cornichon ne se trouve pas entre dindon et éléphant", ()=>{
      testBetween('cornichon',['dindon','éléphant'],false)
    })
    , it("cornichon se trouve entre cornichon et dédain", ()=>{
      testBetween('cornichon',['cornichon','dédain'],true)
    })
    , it("en mode STRICT, cornichon ne se pas trouve entre cornichon et dédain", ()=>{
      testBetween('cornichon',['cornichon','dédain'],false, true)
    })
    , it("cornichon se trouve entre amour et cornichon", ()=>{
      testBetween('cornichon',['amour','cornichon'],true)
    })
    , it("en mode STRICT, cornichon ne se pas trouve entre cornichon et dédain", ()=>{
      testBetween('cornichon',['amour','cornichon'],false, true)
    })
  ])
  , context("avec des mauvaises valeurs fournies",[
    , context("avec un mauvais actual",[
      , it("produit une erreur de valeur actual", ()=>{
        res = expect(true).to.be.between([1,2],resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contains('le premier argument devrait être un Number ou un String')
      })
      , it("produit une erreur si l'actual n'est pas de même type que le premier expect", ()=>{
        res = expect(1).to.be.between(['amour','dédain'],resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contains('l’actual doit être de même type que les éléments de comparaison')
      })
    ])
    , context("avec un mauvais expect",[
      , it("produit une erreur si ce n'est pas une liste", ()=>{
        res = expect(1).to.be.between(true,resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contains('le premier argument de la méthode de comparaison doit être une liste')
      })
      , it("produit une erreur c'est une liste de plus de deux éléments", ()=>{
        res = expect(1).to.be.between([1,2,3],resO)
        expect(res.isOK).to.be.false
        // TODO REMETTRE QUAND ÇA SERA OK AVEC CONTAINS ET RegExp.escape
        // expect(res.returnedMessage).to.contains('le premier argument de la méthode de comparaison doit être une liste de 2 arguments ([max,min])')
        expect(res.returnedMessage).to.contains('le premier argument de la méthode de comparaison doit être une liste de 2 arguments')
      })
      , it("produit une erreur les deux éléments de la liste sont dans le mauvais ordre (avec des nombres)", ()=>{
        res = expect(1).to.be.between([3,1],resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contains('le second élément de la liste de comparaison est inférieur au premier')
      })
      , it("produit une erreur les deux éléments de la liste sont dans le mauvais ordre (avec des strings)", ()=>{
        res = expect('cornichon').to.be.between(['dédain','amour'],resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contains('le second élément de la liste de comparaison est inférieur au premier')
      })
    ])
  ])
])
