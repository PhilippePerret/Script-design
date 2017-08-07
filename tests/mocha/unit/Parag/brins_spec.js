/*
  Feuille de test pour tester tout ce qui concerne le contenu du parag
*/
require('../../spec_helper.js')
let parag = parag0

describe('Brins du parag', function () {
  before(function () {
  });
  describe('Méthode et pseudo-méthode', function () {
    describe('@brin_ids', function () {
      it("exist", function(){
        expect(parag.brin_ids).to.not.be.undefined
      })
      it("retourne une liste vide si non défini", function(){
        parag._brin_ids = undefined
        parag._brin_ids_32 = undefined
        expect(parag.brin_ids).not.to.be.undefined
        expect(parag.brin_ids).to.deep.equal([])
      })
      it("retourne la valeur décomposée de brin_ids_32 si elle est définie", function(){
        parag._brin_ids = undefined
        parag._brin_ids_32 = ' c104g 4        '
        expect(parag.brin_ids).to.deep.equal([12, 32, 144, 4])
      })
    });

    describe('#brin_ids=', function () {
      it("répond", function(){
        expect(()=>{parag.brin_ids=''}).not.to.throw()
      })
      it("permet de redéfinir brin_ids_32", function(){
        parag.brin_ids = [1,2,3]
        expect(parag.brin_ids_32).to.equal(" 1 2 3")
      })
      it("permet de redéfinir brin_ids_32 en base 32", function(){
        parag.brin_ids = [12, 32, 144, 4]
        expect(parag.brin_ids_32).to.equal(' c104g 4')
      })
    });

    describe('@brin_ids_32', function () {
      it("existe", function(){
        expect(parag.brin_ids_32).to.not.be.undefined
      })
    });

    describe('#brin_ids_32=', function () {
      it("répond", function(){
        expect(()=>{parag.brin_ids_32 = ''}).not.to.throw()
      })
    });
  });
});
