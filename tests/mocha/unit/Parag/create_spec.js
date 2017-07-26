/*

  Test de la création d'un paragraphe

  Parags#createNewParag
  Parags::createAndEdit
*/
require('../../spec_helper.js')

describe('Création d’un nouveau Parag', function () {


  describe('méthode Parags::createdAndEdit', function () {
    it("répond", function(){
      expect(Parags).to.respondsTo('createAndEdit')
    })
  }) // ::createAndEdit


  describe('méthode Parags::createNewParag', function () {
    it("répond", function(){
      expect(Parags).to.respondsTo('createNewParag')
    })

    describe('sans auto-synchronisation', function () {
      it("crée un nouveau parag", function(done){
        projet.option('autosync', 0)
        resetTest({nombre_parags : 0})
        expect(()=>{return parag0}).to.throw()

        // - l'identifiant du nouveau paragraphe devra être #12 -
        Parag._lastID = 11
        let newP_id   = 12

        projet.current_panneau = panneauScenier
        let newP = panneauScenier.parags.createNewParag()
        expect(newP).to.be.instanceOf(Parag)
        expect(newP.id).to.equal(newP_id)
        expect(newP).to.respondsTo('sync')
        expect(newP._modified).to.be.true
        // Un seul paragraphe doit avoir été créé
        expect(panneauScenier.parags._ids).to.deep.equal([newP.id])

        // Mais à ce moment-là, le paragraphe n'est pas encore enregistré
        expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt ne devrait pas exister').to.be.false

        projet.saveParags( () => {

          expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt devrait exister').to.be.true

          // On s'assure que
          let codeinfile = fs.readFileSync(projet.parags_file_path,'utf8')
          console.log("Longueur de data in file : %d", codeinfile.length)
          // console.log(`CODE FICHIER : '${codeinfile}'`)
          expect(newP.startPos).to.equal(newP.id * Parag.dataLengthInFile)
          expect(newP.startPos).to.be.at.least(5000)
          console.log("Position start de parag #%d : %d", newP.id, newP.startPos)
          let codePinfile = codeinfile.substr(newP.startPos, Parag.dataLengthInFile)
          // console.log("Segment data parag: '%s'", codePinfile)

          // On scanne un peu le contenu, mais c'est surtout le test save_spec
          // qui va se charger de voir si c'est bon.

          expect(codePinfile[0]).to.equal('n')
          expect(codePinfile.substr(1, Parag.DATA['id'].length).trim()).to.equal('12')

          // - on finit -

          done()

        })
      })
    })// sans auto-synchronisation


    describe('avec l’auto-synchronisation', function () {

      it("crée le nouveau parag", function(done){
        resetTest({nombre_parags : 0})
        expect(()=>{return parag0}).to.throw()
        this.skip()
        done()
      })

      it("crée les parags synchronisés", function(done){

        this.skip()
        done()
      })

    }) // avec l'autosynchronisation

  }) // ::createNewParag

})
