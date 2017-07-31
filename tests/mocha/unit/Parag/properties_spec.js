require('../../spec_helper.js')

describe('Parag', function () {
  describe('propriétés', function () {


    describe('@loaded', function () {
      it("retourne false si le contenu est undefined", function(){
        parag1.contents = undefined // la méthode appelle reset()
        expect(parag1.loaded).to.be.false
      })
      it("retourne true si le contenu est une chaine vide", function(){
        parag1.contents = '' // la méthode appelle reset()
        expect(parag1.loaded).to.be.true
      })
      it("retourne true si le contenu est une chaine de caractères", function(){
        parag1.contents = "Une chaine de caractères"  // la méthode appelle reset()
        expect(parag1.loaded).to.be.true
      })

    });

    describe('@modified', function () {
      it('existe', function(){
        expect(parag0).to.have.property('modified')
      });
    });
    describe('@id', function () {
      it('existe', function(){
        expect(parag0).to.have.property('id')
      });
    });
    describe('@contents', function () {
      it('existe', function(){
        expect(parag0).to.have.property('contents')
      })
    });
    describe('@ucontents', function () {
      it('existe', function(){
        expect(parag0).to.have.property('ucontents')
      });

    });
  });
});
