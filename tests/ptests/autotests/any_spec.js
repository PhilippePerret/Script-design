/** ---------------------------------------------------------------------
  *
  *   Grand test de la class Any qui permet de procéder à toutes les
  *   comparaison dans PTests
  *
*** --------------------------------------------------------------------- */
let
  Any = require_module('./lib/utils/PTests_Any')

let res, opts
    , resO = {not_a_test: true}

const
    opts_mode_normal = {template:{success:'Any.areEqual(__ACTUAL__,__EXPECT__) produit true', failure:'Any.areEqual(__ACTUAL__,__EXPECT__) ne produit pas true'}}
  , opts_mode_strict = {template:{success:'Any.areEqual(__ACTUAL__,__EXPECT__) en mode strict produit true', failure:'Any.areEqual(__ACTUAL__,__EXPECT__) en mode strict ne produit pas true'}}
describe("La classe Any",[
  , describe("pour les NOMBRES",[
    , it('renvoie true en cas d’égalité de deux nombres égaux (mode strict ou non)', () => {
      res = expect(Any.areEqual(4,4)).equals(true, resO).isOK
      expect(res,opts_mode_normal).to.be.true
      res = expect(Any.areEqual(4,4)).strictly.equals(true, resO).isOK
      expect(res,opts_mode_strict).to.be.true
    })
  ])
  , describe("pour les STRINGS", [
    , it('produit un succès en cas d’égalité de deux strings strictement égaux', () => {
      res = expect(Any.areEqual('bonjour', 'bonjour')).equals(true, resO).isOK
      expect(res,opts_mode_normal).to.be.true
      res = expect(Any.areEqual('bonjour', 'bonjour')).equals(true, resO).isOK
      expect(res,opts_mode_strict).to.be.true
    })
  ])
])
