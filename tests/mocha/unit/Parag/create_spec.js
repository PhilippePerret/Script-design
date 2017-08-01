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
      before(function () {
        resetTest({nombre_parags : 0})
        projet.option('autosync', 0)
        expect(()=>{parag1.id == 1}).to.throw()
      })
      it("crée un nouveau parag", function(){

        // - l'identifiant du nouveau paragraphe devra être #12 -
        Parag._lastID = 11
        let newP_id   = 12

        projet.current_panneau = panneauScenier

        // ========> TEST <=========
        let newP = panneauScenier.parags.createNewParag()
        expect(newP).to.be.instanceOf(Parag)
        expect(newP.id).to.equal(newP_id)
        expect(newP).to.respondsTo('PRsync')
        expect(newP._modified).to.be.true
        // Un seul paragraphe doit avoir été créé
        expect(panneauScenier.parags._ids).to.deep.equal([newP.id])

        // Mais à ce moment-là, le paragraphe n'est pas encore enregistré
        expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt ne devrait pas exister').to.be.false

        return projet.saveAll()
        .then( () => {
          expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt devrait exister').to.be.true

          // On s'assure que
          let codeinfile = fs.readFileSync(projet.parags_file_path,'utf8')
          // console.log(`CODE FICHIER : '${codeinfile}'`)
          expect(newP.startPos).to.equal(newP.id * Parag.dataLengthInFile)
          expect(newP.startPos).to.be.at.least(5000)
          let codePinfile = codeinfile.substr(newP.startPos, Parag.dataLengthInFile)
          // console.log("Segment data parag: '%s'", codePinfile)

          // On scanne un peu le contenu, mais c'est surtout le test save_spec
          // qui va se charger de voir si c'est bon.

          expect(codePinfile[0]).to.equal('n')
          expect(codePinfile.substr(1, Parag.DATA['id'].length).trim()).to.equal('12')

        })
      })
    })// sans auto-synchronisation


    describe('avec l’auto-synchronisation', function () {

      before(function (done) {
        resetTest({nombre_parags : 0})
        expect(()=>{return parag0}).to.throw()
        projet.option('autosync', 1)

        Parag._lastID   = 25

        // ======== PRÉ-VÉRIFICATION =========

        expect(panneauManuscrit.parags.count).to.equal(0)
        expect(panneauNotes.parags.count).to.equal(0)
        expect(panneauScenier.parags.count).to.equal(0)
        expect(panneauSynopsis.parags.count).to.equal(0)

        // ========> TEST <=======

        let newP = panneauManuscrit.parags.createNewParag()

        newP.sync_after_save = true
        // Maintenant, ce n'est plus dans la méthode createNewParag qu'on
        // met sync_after_save à true (c'est dans createAndEdit — cf. la
        // raison).
        newP.newContents = "Un premier contenu pour voir."
        newP.onChangeContents()
        // La synchronisation n'est demandée qu'au changement
        // de contenu. Mais il faut le définir avec newContents

        // setTimeout( () => {
        //   done()
        // }, 1000)
        done()
      });
      it("crée le nouveau parag", function(){

      // ======== VÉRIFICATION =========
        expect(panneauManuscrit.parags.count, "le panneau Manuscrit devrait avoir maintenant avoir 1 parag").to.equal(1)
        let parag = panneauManuscrit.parags._items[0]
        expect(parag, "Le parag devrait être une instance Parag").to.be.instanceOf(Parag)
        expect(parag.id, `Le parag devrait avoir un ID de 26 (il vaut ${parag.id})`).to.equal(26)

      })

      it("crée les parags synchronisés", function(){

        expect(panneauNotes.parags.count).to.equal(1)
        expect(panneauScenier.parags.count).to.equal(1)
        expect(panneauSynopsis.parags.count).to.equal(1)

      })

    }) // avec l'autosynchronisation

  }) // ::createNewParag

})
