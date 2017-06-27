let res

describe('Égalité versus inégalité',[
  , describe("Test de l'égalité", [
    // === MODE NON STRICT ===
    , context('en mode non strict', [
      , context('avec des nombres', [
        , it("retourne un succès en cas d'égalité", () => {
            res = expect(4).equals(4,{not_a_test:true}).isOK
            expect(res, '4 == 4').to.be.true
              .and.equals(true, {no_values:true})
          })
        , it("retourne un succès en cas d'égalité avec un nombre et un string-nombre", () => {
            res = expect('4').equals(4, {NaT: true}).isOK
            expect(res, '4 == "4"').to.be.true
              .and.equals(true, {no_values: true})
        })
        , it('retourne un échec en cas d’inégalité', () => {
            res = expect(4).equals(5,{not_a_test:true}).isOK
            expect(res, '4 == 5')
              .to.be.false
              .and.equals(false,{no_values:true})
        })
      ])
      , context('avec des strings', [
        , it('retourne un succès avec des mots identiques', () => {
          res = expect('bonjour').to.equal('bonjour', {NaT:true}).isOK
          expect(res, '"bonjour" == "bonjour"').to.be.true
            .and.equals(true, {no_values: true})
        })
        , it('retourne un succès avec des mots presque identiques', () => {
          res = expect('bonjour').to.equal('BONJOUR', {NaT:true}).isOK
          expect(res, '"bonjour" == "BONJOUR"').to.be.true
            .and.equals(true, {no_values: true})
        })
        , it('retourne un échec avec des mots différents', () => {
          res = expect('bonjour').to.equal('au revoir', {NaT:true}).isOK
          expect(res, '"bonjour" == "au revoir"').to.be.false
            .and.equals(false, {no_values: true})
        })
      ])
      , context('avec object', [
        , it ('produit un succès avec des objets identiques', () => {
          res = expect({un:"un",deux:"deux"}).equals({deux:"deux",un:"un"}, {NaT:true}).isOK
          expect(res).to.be.true
            .and.equal(true,{no_values:true})
        })
      ])
    ])
    // === ÉGALITÉ EN MODE SCRIPT ===
    , context('en mode strict', [
      , context('avec des nombres', [
        , it('retourne un succès avec deux nombres strictement égaux', () => {
          res = expect(4).strictly.equals(4, {NaT: true}).isOK
          expect(res, '4 === 4').to.be.true
            .and.to.equals(true, {no_values: true})
        })
        , it('retourne un échec avec un string-nombre et un nombre égaux (en nombre)', () => {
          res = expect('4').strictly.equals(4, {NaT: true}).isOK
          expect(res, '"4" == 4').to.be.false
            .and.to.equals(false, {no_values: true})
        })
      ])
      , context('avec des strings', [
        , it('produit un succès avec des mots strictement identiques', () => {
          res = expect('bonjour').to.strictly.equal('bonjour', {NaT:true}).isOK
          expect(res, '"bonjour" === "bonjour"').to.be.true
            .and.equals(true, {no_values: true})
        })
        , it('produit un échec avec des mots presque identiques', () => {
          res = expect('bonjour').to.strictly.equal('BONJOUR', {NaT:true}).isOK
          expect(res, '"bonjour" === "BONJOUR"').to.be.false
            .and.equals(false, {no_values: true})
        })
        , it('produit un échec avec des mots différents', () => {
          res = expect('bonjour').to.strictly.equal('au revoir', {NaT:true}).isOK
          expect(res, '"bonjour" === "au revoir"').to.be.false
            .and.equals(false, {no_values: true})
        })

      ])
      , context('avec object')
    ])
  ])
  , describe("Test de l'inégalité", [
    // === MODE NON STRICT
    , context('en mode non strict', [
      , context('avec des nombres', [
        , it('produit un succès avec des nombres différents', () => {
          res = expect(4).not.equals(5, {not_a_test:true}).isOK
          expect(res, '4 != 5')
            .to.be.true
            .and.equal(true,{no_values:true})
        })
        , it('produit un succès avec un nombre et un string-nombre différents', () => {
          res = expect(4).not.equals('5', {NaT:true}).isOK
          expect(res, '4 != "5"').to.be.true
            .and.equal(true, {no_values: true})
        })
        , it('produit un échec avec des nombres identiques', () => {
          res = expect(4).not.equals(4, {NaT: true}).isOK
          expect(res, '4 != 4')
            .to.be.false
            .and.equal(false, {no_values: true})
        })
      ])
      , context('avec des strings')
      , context('avec des inévaluables')
    ])
    // === MODE STRICT ===
    , context('en mode strict',[
      , context('avec des nombres')
      , context('avec des strings')
      , context('avec des inévaluables')
    ])
  ])
])
