/*
  TEST DES RELATIVES
*/
require('../../spec_helper.js')

let parag = parag0

/** ---------------------------------------------------------------------
  *
  * M É T H O D E S   P R A T I Q U E S
  *
*** --------------------------------------------------------------------- */
function getRelatives () {
  return currentProjet.relatives.data.relatives
}

function idsInRelatives       ()      { return Object.keys(getRelatives()) }
function nombreRelatives      ()      { return idsInRelatives().length     }
function getRelativesByIndex  (index) { return getRelativesById( idsInRelatives()[index] ) }
function getRelativesById     (rid)   { return getRelatives()[String(rid)] }

/** ---------------------------------------------------------------------
  *
  *   T E S T S
  *
*** --------------------------------------------------------------------- */
describe.only('Relatives -', function () {
  describe('Projet#relatives', function () {
    it("existe", function(){
      expect(currentProjet.relatives).not.to.be.undefined
    })
    it("est un objet Relatives", function(){
      expect(currentProjet.relatives).to.be.instanceOf(Relatives)
    })
  });
  // TODO Un nouveau parag crée automatiquement une donnée relative vierge
  describe('la création d’un nouveau parag', function () {
    before(function () {
      resetTests({nombre_parags:0})
      return panneauNotes.PRactivate()
    });
    it("crée donnée relative pour ce nouveau parag", function(){
      let drels = currentProjet.relatives.data.relatives
      // ========== PRÉ-VÉRIFICATION ===========
      expect(nombreRelatives()).to.equal(0)

      // ==========> TEST <============
      let newP = currentPanneau.parags.createNewParag({contents: "Un tout nouveau paragraphe."})

      // ============ CONTROLES ===============
      expect(nombreRelatives()).to.equal(1)
      let rel = getRelativesByIndex(0)
      expect(rel).not.to.be.undefined
      expect(rel.i).to.equal(0)
      expect(rel.t).to.equal('n')
      expect(rel.r).to.be.deep.equal({})
    })
    it("indique que le projet est modifié", function(){
      expect(currentProjet.modified).to.be.true
    })
  });

  // TODO La synchronisation de deux parags les… synchronise
  describe('La synchronisation de deux parags existants', function () {
    before(function () {
      resetTests({nombre_parags: 2})
      panneauNotes.add(parag0)
      panneauScenier.add(parag1)
      return panneauNotes.PRactivate()
      .then( () => {
        // =========> TESTS <===========
        currentProjet.relatives.associate([parag0, parag1])
      })

    });
    it("crée une donnée relative dans leur deux relatifs", function(){
      const rel0 = getRelativesById(0)['r']['s']
      const rel1 = getRelativesById(1)['r']['n']
      expect(rel0).to.include(1)
      expect(rel1).to.include(0)
    })
    it("les deux parags sont marqués associés", function(){
      expect(currentProjet.relatives.areRelatifs(parag0, parag1)).to.be.true
    })
  });

  // TODO La synchronisation automatique crée automatiquement de nouveaux parags
  // et les synchronise.

  // TODO En mode double panneau, on peut voir les parags synchronisés

});
