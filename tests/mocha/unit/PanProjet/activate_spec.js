/*

  Méthode

*/

const cons = console.log.bind(console)

describe.only('Activation d’un panneau', function () {

  describe('Méthodes PanProjet utiles', function () {

    describe('#PRactivate', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRactivate')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRactivate().catch(cons)).to.be.instanceOf(Promise)
      })
    });

    describe('#PRloadData', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRloadData')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRloadData().catch(cons)).to.be.instanceOf(Promise)
      })
      it("ne fait rien si les données sont déjà chargées", function(){

        return panneauScenier.PRloadData()
          .then(panneauScenier.PRloadData.bind(panneauScenier))
          .then( () => {
            // On ne passe par là que si c'est bien une promise
            // qui a été retournée, donc si on la renvoie même si
            // les données sont déjà chargées

            expect(panneauScenier.loaded).to.be.true

          })

      })
      it("met les données par défaut si le fichier n'existe pas", function(){

        if(fs.existsSync(panneauScenier.store.path)){fs.unlinkSync(panneauScenier.store.path)}
        panneauScenier.pids = undefined
        delete panneauScenier._loaded
        expect(panneauScenier.loaded).to.be.false

        // ==========> TEST <==========
        return panneauScenier.PRloadData()
          .then( () => {

            expect(panneauScenier.loaded).to.be.true
            expect(panneauScenier.pids).to.be.instanceOf(Array)
            expect(panneauScenier.pids.length).to.equal(0)

          })

      })
      it("charge les données du panneau", function(){

        delete panneauNotes.pids
        delete panneauNotes._loaded
        expect(panneauNotes.loaded, 'la propriété loaded du panneau Notes devrait être false').to.be.false
        expect(panneauNotes.pids).to.be.undefined

        // ===========> TEST <============
        return panneauNotes.PRloadData()
          .then( () => {

            // ======= VÉRIFICATIONS ===========
            expect(panneauNotes.loaded, "la propriété loaded du panneau Notes devrait être true").to.be.true
            expect(panneauNotes.pids).not.to.equal(undefined)

          })
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

        // ========= PRÉPARATION ===========
        resetTests()
        panneauSynopsis.add([parag2, parag4, parag6])
        projet.saveAll( () => {

          // ======== VÉRIFICATIONS ===========

          parag2.contents = undefined
          parag4.contents = undefined
          parag6.contents = undefined
          expect(parag2.loaded).to.be.false
          expect(parag4.loaded).to.be.false
          expect(parag6.loaded).to.be.false

          // ==========> TEST <============
          return panneauSynopsis.PRloadAllParags()
            .then( () => {

              expect(parag2.loaded).to.be.true
              expect(parag4.loaded).to.be.true
              expect(parag6.loaded).to.be.true

            })
        })
      })
    });

    describe('#PRdisplayAllParags', function () {

      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRdisplayAllParags')
      })

      it("retourne une promise", function(){
        expect(panneauNotes.PRdisplayAllParags()).to.be.instanceOf(Promise)
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

        // ======== PRÉPARATION =========
        resetTests()
        projet.current_panneau = panneauScenier
        panneauScenier.actif = true
        panneauScenier.section.className = 'panneau actif'

        // ========= VÉRIFICATIONS ==========
        expect(panneauScenier.section.className).to.equal('panneau actif')
        expect(panneauScenier.actif).to.be.true
        expect(projet.current_panneau.id).to.equal('scenier')

        // ========> TEST <===========
        return panneauNotes.PRhideCurrent()
          .then( () => {
            expect(panneauScenier.section.className).to.equal('panneau')
            expect(panneauScenier.actif).to.be.false
            expect(projet.current_panneau.id).to.equal('data')
          })
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
        resetTests({nombre_parags:4})
        panneauNotes.add([parag0, parag1, parag2])
        expect(panneauNotes.actif).to.be.false
        expect(panneauNotes.section.className).to.equal('panneau')
        expect(panneauNotes.section.className).not.to.equal('panneau actif')

        // ========> TEST <==========
        return panneauNotes.PRshow()
          .then( () => {

            // ========= VÉRIFICATION =========
            expect(panneauNotes.actif).to.be.true
            expect(panneauNotes.section.className).to.equal('panneau actif')
          })
      })
    });

  })


  describe('PanProjet # PRhideCurrent', function () {
    it("masque le panneau courant", function(){

      resetTests()

      panneauNotes.actif = true
      panneauNotes.displayed = true
      panneauNotes.section.className = 'panneau actif'
      projet.current_panneau = panneauNotes

      expect(panneauNotes.actif).to.be.true
      expect(panneauNotes.section.className).to.equal('panneau actif')
      expect(projet.current_panneau.id).to.equal('notes')

      // ==========> TEST <=========
      return panneauManuscrit.PRhideCurrent()
        .then( () => {

          // ======== VÉRIFICATIONS ==========

          expect(panneauNotes.displayed, "le displayed du panneau doit être encore à true").to.be.true
          expect(panneauNotes.actif, "le panneau Notes ne doit plus être 'actif'").to.be.false
          expect(panneauNotes.section.className, 'la class du container devrait être "panneau"').to.equal('panneau')
          expect(projet.current_panneau.id, 'le panneau courant doit être le panneau par défaut "data"').to.equal('data')
        })
    })
  });

  describe('PanProjet # displayAllParags', function () {
    it("affiche tous les parags", function(){
      resetTests({nombre_parags:10})
      panneauNotes.add([parag1, parag3, parag5])
      panneauNotes.displayed = false
      expect(panneauNotes.container).not.to.haveTag('div',{class:'p', count:3})

      return panneauNotes.PRdisplayAllParags()
        .then( () => {

          expect(panneauNotes.displayed, 'La propriété displayed du panneau Notes doit être à true').to.be.true

          expect(panneauNotes.container).to.haveTag('div',{class:'p', count:3})
          let lids = [1, 3, 5]
          lids.forEach( pid => {
            expect(panneauNotes.container).to.haveTag('div', {id: `p-${pid}`})
          })
        })
    })
  });
  describe('PanProjet # PRshow', function () {
    it("met `actif` du panneau à true", function(){
      panneauNotes.actif = false
      return panneauNotes.PRshow()
        .then( () => {
          expect(panneauNotes.actif).to.be.true
          expect(panneauNotes.section.className).to.equal('panneau actif')
        })
    })
  })

})
