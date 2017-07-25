require('../../spec_helper.js')

describe.only('PanProjet', function () {
  describe('name', function () {
    it('répond', function(){
      expect(panneauNotes.name).not.to.be.undefined
    })
    it('possède la bonne valeur', function(){
      expect(panneauNotes.name).to.equal('notes')
    });
  });
  describe('id', function () {
    it('répond', function(){
      expect(panneauScenier.id).not.to.be.undefined
    })
    it('possède la bonne valeur', function(){
      expect(panneauScenier.id).to.equal('scenier')
    })
  })
  describe('#add', function () {
    it("répond", function()=>{
      expect(panneauManuscrit).to.respondsTo('add')
    })
  });
  describe('@parags_ids', function () {
    it('existe', function(){
      expect(panneauNotes.parags_ids).not.to.be.undefined
    });

  });
})
