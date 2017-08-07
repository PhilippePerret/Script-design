require('../../spec_helper.js')

describe('Méthodes pratiques', function () {
  before(function () {
    Projet.current = projet
  });
  describe('currentPanneau', function () {
    it("est une méthode pratique", function(){
      expect(typeof(currentPanneau)).to.equal('object')
    })
    it("retourne le panneau courant", function(){
      return panneauNotes.PRactivate()
      .then( () => {
        expect(currentPanneau.id).to.equal('notes')
        return panneauScenier.PRactivate()
        .then( () => {
          expect(currentPanneau.id).to.equal('scenier')
        })
      })
    })
  });
  describe('currentParag', function () {
    it("retourne le parag courant s'il existe", function(){

      panneauNotes.add([parag0, parag1, parag2])
      return panneauNotes.PRactivate()
      .then( () => {
        panneauNotes.select(parag2)
        expect(currentParag).not.to.be.undefined
        expect(currentParag.id).to.equal(2)
      })
    })
    it("retourne null s'il n'y a pas de paragraphe courant", function(){

      return panneauScenier.PRactivate()
      .then( () => {
        expect(currentParag).to.be.undefined
      })
    })
  });


});
