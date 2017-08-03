/*

  Test de la class Brins

*/
require('../../spec_helper.js')

describe('Brins', function () {
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


  describe('<#projet>.brins.add', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('add')
    })
  })


  describe('<#projet>.brins.remove', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('remove')
    })
    it("produit une erreur si aucun ID n'est fourni", function(){
      expect(()=>{projet.brins.remove()}).to.throw("Il faut fournir l'ID du brin à détruire.")
    })
    it("détruit le brin spécifié", function(){
      this.skip("En attente d'implémentation")
    })
  });

});
