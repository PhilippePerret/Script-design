/** ---------------------------------------------------------------------
  *   Tests des méthodes de test utilisant `classOf`
  *
*** --------------------------------------------------------------------- */

let
    eva, res, exp1, exp2
  , resO = {not_a_test: true}

describe("PTests#classOf",[
  , describe(" produit un SUCCÈS avec",[
    , it("une chaine attendant 'string'", ()=>{
      res = expect('chaine').be.classOf('string', resO).isOK
      expect(res).to.be.true
    })
  ])
  , describe(" produit un ÉCHEC avec",[
    , it("une chaine attendant 'chaine'", ()=>{
      res = expect('chaine').not.classOf('chaine', resO).isOK
      expect(res).to.be.true
    })
  ])
])
