
describe('PRload et PRdisplay', function () {

  describe('PRload', function () {

    it("répond", function(){
      expect(parag12).to.respondsTo('PRload')
    })
    it("retourne une Promise", function(){
      expect(parag12.PRload()).to.be.instanceOf(Promise)
    })

    it("permet de charger le parag", function(){
      resetTests({nombre_parags: 10})

      // ======= PRÉ-VÉRIFICATIONS =======
      expect(fs.existsSync(panneauNotes.store.path)).to.be.false

      // ======= PRÉPARATION ==========
      parag2.duration = 3600
      let t = `Le contenu du paragraphe le ${moment().format()}`
      parag2.contents = t
      panneauNotes.parags.add([parag0, parag2, parag5, parag7])
      projet.saveAll( () => {


        parag2.contents = undefined
        parag2.duration = undefined

        // ======= PRÉPA-VÉRIFICATIONS =======
        expect(fs.existsSync(panneauNotes.store.path)).to.be.true
        expect(parag2.loaded).to.be.false
        expect(parag2.contents).to.be.undefined
        expect(parag2.duration).to.equal(60)

        // =======> TEST <========
        parag2.PRload().then(() => {

          // ======== VÉRIFICATION ===========

          expect(parag2.contents).to.equal(t)
          expect(parag2.duration).to.equal(3600)

        })


      }) // /projet.saveAll

    })
  })


  describe('PRdisplay', function () {

    it("répond", function(){
      expect(parag2).to.respondsTo('PRdisplay')
    })

    it("retourne une Promise", function(){
      panneauNotes.parags.add(parag2)
      expect(parag2.PRdisplay()).to.be.instanceOf(Promise)
    })

    it("affiche le paragraphe dans le container du panneau", function(){

      resetTests({nombre_parags:4})

      // ========= PRÉPARATION ===========
      panneauManuscrit.parags.add( [ parag1, parag2, parag3 ] )
      delete panneauManuscrit._container

      // ======== PRÉ-VÉRIFICATIONS ==============
      expect(parag3.panneau_id).to.equal('manuscrit')
      expect(parag3.panneau.id).to.equal('manuscrit')

      expect(panneauManuscrit.container).to.not.haveTag('div', {id:'p-3'})

      // =======> TEST <==========

      parag3.PRdisplay()
        .then ( () => {

          // ==========  VÉRIFICATIONS ============

          expect(panneauManuscrit.container).to.haveTag('div', {id:'p-3'})

        })

    })
  })
})
