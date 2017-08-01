/*

  Test de la class Brins

*/
require('../../spec_helper.js')

describe.only('Brins', function () {
  it("existe", function(){
    expect('undefined' === typeof(Brins)).to.be.false
    expect(typeof Brins).to.equal('function')
  })

  describe('Projet#brins', function () {
    it("répond", function(){
      expect(projet.brins).not.to.be.undefined
    })
    it("est une instance 'Brins'", function(){
      expect(projet.brins.constructor.name).to.equal('Brins')
    })
    it("répond à la méthode `add`", function(){
      expect(projet.brins).to.respondsTo('add')
    })
  });
});
