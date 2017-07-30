/*

  Méthode

*/


describe.only('Désactivation d’un panneau', function () {

  describe('#PRdesactivate', function () {
    it("répond", function(){
      expect(panneauNotes).to.respondsTo('PRdesactivate')
    })
    it("retourne une promise", function(){
      expect(panneauNotes.PRdesactivate()).to.be.instanceOf(Promise)
    })
    it("désactive le panneau s'il est activé", function(){
      this.skip()
    })
    it("supprime la sélection du panneau", function(){
      this.skip()
    })
    it("ne fait rien si le panneau n'est pas activé", function(){
      resetTests()

      return panneauNotes.PRdesactivate()
        .then( () => {

        })
    })
  });
})
