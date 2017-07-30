/*

  Méthode

*/


describe('Activation d’un panneau', function () {

  describe('Méthodes PanProjet utiles', function () {

    it("#PRactivate", function(){
      expect(panneauNotes).to.respondsTo('PRactivate')
    })

    it("#PRloadData", function(){
      expect(panneauNotes).to.respondsTo('PRloadData')
    })

    it("#PRloadAllParags", function(){
      expect(panneauNotes).to.respondsTo('PRloadAllParags')
    })

    it("#PRdisplayAllParags", function(){
      expect(panneauNotes).to.respondsTo('PRdisplayAllParags')
    })

    it("#PRhideCurrent", function(){
      expect(panneauNotes).to.respondsTo('PRhideCurrent')
    })
    it("#PRshow", function(){
      expect(panneauScenier).to.respondsTo('PRshow')
    })

  })


  describe('PanProjet # PRhideCurrent', function () {
    it("masque le panneau courant", function(){
      panneauNotes.actif = true
      panneauNotes.displayed = true
      panneauNotes.container.className = 'panneau actif'
      Projet.current_panneau = panneauNotes

      expect(panneauNotes.actif).to.be.true
      expect(panneauNotes.container.className).to.equal('panneau actif')

      // ==========> TEST <=========
      return panneauManuscrit.PRhideCurrent()
        .then( () => {

          // ======== VÉRIFICATIONS ==========

          expect(panneauNotes.displayed, "le displayed du panneau doit être encore à true").to.be.true
          expect(panneauNotes.actif, "le panneau Notes ne doit plus être 'actif'").to.be.false
          expect(panneauNotes.container.className, 'la class du container devrait être "panneau"').to.equal('panneau')
          expect(Projet.current_panneau, 'Il ne doit plus y avoir de panneau courant').to.be.undefined
        })
    })
  });

  describe('PanProjet # displayAllParags', function () {
    it("affiche tous les parags", function(){
      panneauNotes.displayed = false

      return panneauNotes.PRdisplayAllParags()
          .then( () => {
            expect(panneauNotes.displayed).to.be.true
            this.skip()
          })
    })
  });
  describe('PanProjet # PRshow', function () {
    it("met `displayed` du panneau à true", function(){
      panneauNotes.actif = false
      return panneauNotes.PRshow()
        .then( () => {
          expect(panneauNotes.displayed).to.be.true
          expect(panneauNotes.actif).to.be.true
          expect(panneauNotes.container.className).to.equal('panneau actif')
        })
    })
  })

})
