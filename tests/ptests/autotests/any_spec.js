/** ---------------------------------------------------------------------
  *
  *   Grand test de la class Any qui permet de procéder à toutes les
  *   comparaison dans PTests
  *
*** --------------------------------------------------------------------- */

// Le module testé
let
  Any = require_module('./lib/utils/PTests_Any')

let res, opts
    , resO = {not_a_test: true}

function templates(act, exp, strict)
{
  return {template:{success:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}produit true`, failure:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}aurait dû produire true…`}}
}


describe("Class Any",[
  , describe("::areEqual", [
    , describe(" pour les NOMBRES",[
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux nombres égaux (mode strict ou non)', () => {
          res = expect(Any.areEqual(4,4)).equals(true, resO).isOK
          expect(res,templates(4,4)).to.be.true
          res = expect(Any.areEqual(4,4)).strictly.equals(true, resO).isOK
          expect(res,templates(4,4,true)).to.be.true
        })
        , it('en cas d’égalité pour un nombre et un nombre-string', () => {
          res = expect(Any.areEqual(4,'4')).equals(true, resO).isOK
          expect(res,templates(4,'"4"')).be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en mode strict, avec l’égalité d’un nombre et d’un nombre-string', () => {
          res = expect(Any.areEqual(4,'4',{strict:true})).equals(true, resO).isOK
          expect(res,templates(4,'"4"')).be.false
        })
      ])
    ])
    , describe(" pour les STRINGS", [
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux strings strictement égaux', () => {
          res = expect(Any.areEqual('bonjour', 'bonjour')).equals(true, resO).isOK
          expect(res,templates('"bonjour"','"bonjour"')).to.be.true
          res = expect(Any.areEqual('bonjour', 'bonjour',{strict:true})).equals(true, resO).isOK
          expect(res,templates('"bonjour"','"bonjour"')).to.be.true
        })
        , it('en cas d’approximation de la casse en mode normal', () => {
          res = expect(Any.areEqual('bonjour','BONJOUR')).equals(true, resO).isOK
          expect(res, templates('"bonjour"','"BONJOUR"')).to.be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en cas d’approximation de la casse en mode strict', () => {
          res = expect(Any.areEqual('bonjour','BONJOUR',{strict:true})).equals(true, resO).isOK
          expect(res, templates('"bonjour"','"BONJOUR"')).to.be.false
        })
      ])
    ])
    , describe(" pour les ARRAYS", [
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux listes simples', () => {
          res = expect(Any.areEqual([1,2,3],[1,2,3])).equals(true,resO).isOK
          expect(res, templates('[1,2,3]','[1,2,3]')).to.be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en cas de listes contenant les mêmes éléments dans le désordre', () => {
          res = expect(Any.areEqual([1,2,3],[3,2,1])).equals(true,resO).isOK
          expect(res, templates('[1,2,3]','[3,2,1]')).to.be.false
        })
        , it('en cas de liste à nombre d’éléments différents', () => {
          res = expect(Any.areEqual([1,2,3,4],[1,2,3])).equals(true,resO).isOK
          expect(res, templates('[1,2,3,4]','[1,2,3]')).to.be.false
        })
        // AUTRES ÉCHECS
        // Deux nombres d'éléments différents
      ])
    ])
  ])
])
