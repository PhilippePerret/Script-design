/*

  Méthode

*/


describe.only('Activation d’un panneau', function () {

  describe('Méthodes PanProjet utiles', function () {

    describe('#PRactivate', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRactivate')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRactivate()).to.be.instanceOf(Promise)
      })
    });

    describe('#PRloadData', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRloadData')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRloadData()).to.be.instanceOf(Promise)
      })
      it("ne fait rien si les données sont déjà chargées", function(){
        this.skip()
      })
      it("met les données par défaut si aucune donnée n'a été enregistrée", function(){
        this.skip()
      })
      it("charge les données du panneau", function(){

        expect(panneauNotes.loaded, 'la propriété loaded du panneau Notes devrait être false').to.be.false

        panneauNotes.PRloadData()
          .then( () => {
            console.log('panneauNotes.loaded = ', panneauNotes.loaded)
            expect(panneauNotes.loaded, "la propriété loaded du panneau Notes devrait être true").to.be.true
          })
          .catch( (err) => { throw err })
      })
    });

    describe('#PRloadAllParags', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRloadAllParags')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRloadAllParags()).to.be.instanceOf(Promise)
      })
      it("permet de charger tous les parags du panneau", function(){
        this.skip()
      })
    });

    describe('#PRdisplayAllParags', function () {

      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRdisplayAllParags')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRdisplayAllParags()).to.be.instanceOf(Promise)
      })
      it("affiche tous les parags du panneau dans son container", function(){
        this.skip()
      })
    })

    describe('#PRhideCurrent', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRhideCurrent')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRhideCurrent()).to.be.instanceOf(Promise)
      })
      it("masque le panneau courant s'il existe", function(){
        this.skip()
      })
      it("ne masque rien si aucun panneau n'est affiché", function(){
        this.skip()
      })
    });

    describe('#PRshow', function () {
      it("répond", function(){
        expect(panneauScenier).to.respondsTo('PRshow')
      })
      it("retourne une promise", function(){
        expect(panneauScenier.PRshow()).to.be.instanceOf(Promise)
      })
      it("rend le panneau visible", function(){
        this.skip()
      })
    });

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

            expect(panneauNotes.displayed, 'La propriété displayed du panneau Notes doit être à true').to.be.true

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
