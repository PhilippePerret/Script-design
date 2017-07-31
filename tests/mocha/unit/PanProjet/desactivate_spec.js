/*

  Méthode

*/


describe('Désactivation d’un panneau', function () {

  describe('#PRdesactivate', function () {
    it("répond", function(){
      expect(panneauNotes).to.respondsTo('PRdesactivate')
    })
    it("retourne une promise", function(){
      expect(panneauNotes.PRdesactivate()).to.be.instanceOf(Promise)
    })
    it("désactive le panneau s'il est activé", function(){
      function testIfPanneauNotesActif ()
      {
        expect(panneauNotes.actif).to.be.true
        expect(panneauNotes.section.className).to.equal('panneau actif')
        expect(projet.current_panneau.id).to.equal('notes')
      }
      function testIfPanneauNotesDesactif ()
      {
        expect(panneauNotes.actif).to.be.false
        expect(panneauNotes.section.className).to.equal('panneau')
        expect(projet.current_panneau.id).not.to.equal('notes')
      }
      return panneauNotes.PRactivate()
        .then( testIfPanneauNotesActif )
        // =========> TEST <===========
        .then( panneauNotes.PRdesactivate.bind(panneauNotes))
        // ========= VÉRIFICATIONS ===========
        .then( testIfPanneauNotesDesactif )
    })
    it("supprime la sélection du panneau", function(){
      resetTests({nombre_parags:6})
      panneauScenier.add([parag1, parag2, parag4, parag5])

      function selectionDesParagraphes ()
      {
        return new Promise((ok, ko) => {
          panneauScenier.parags.select(parag4)
          expect(panneauScenier.parags.selection.current.id).to.equal(4)
          ok(true)
        })
      }

      function testIfNoSelectionAnymore ()
      {
        expect(panneauScenier.parags.selection.current).to.be.null
      }
      return panneauScenier.PRactivate()
        .then(selectionDesParagraphes)
        // =========> TEST <===========
        .then(panneauScenier.PRdesactivate.bind(panneauScenier))
        // ========== VÉRIFICATIONS =========
        .then( testIfNoSelectionAnymore )
    })
    it("supprime la classe d'annulation courante", function(){
      uneFausseMethodPourVoir = function(){return true}
      projet.cancelableMethod = uneFausseMethodPourVoir

      return panneauManuscrit.PRactivate()
        // ========> TEST <========
        .then(panneauManuscrit.PRdesactivate.bind(panneauManuscrit))
        // ========== VÉRIFICATION ==========
        .then( () => {
          expect(projet.cancelableMethod).to.be.undefined
        })
    })
    it("ne produit pas d'erreur si le panneau n'est pas activé", function(){
      resetTests()

      return panneauNotes.PRdesactivate()
        .then( () => {

        })
    })
  });
})
