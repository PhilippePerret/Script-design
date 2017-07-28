/*
  Tests de l'affichage d'un panneau
*/

describe('Affichage des panneaux', function () {

  describe('Méthodes PanProjet', function () {

    describe('#displayParags', function () {
      before(function () {
        resetTests({nombre_parags: 0})
      });
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('displayParags')
      })
    }) // /#displayParags

  }) // Méthodes PanProjet


  describe('construction d’un panneau après chargement', function () {
    before(function (done) {
      resetTests({nombre_parags: 10})
      panneauNotes.parags.add([parag2, parag0, parag5, parag6])
      panneauNotes.modified = true
      projet.saveAll(done)
    })

    it("le panneau n'est pas encore construit", function(){

      expect(panneauNotes.container.childNodes.length).to.equal(0)
      expect(panneauNotes.built, 'la marque "built" du panneau Notes est à false').to.be.false
    })

    it("on demande la construction du panneau en l'activant", function(done){

      panneauNotes.activate( () => {

        expect(panneauNotes.built, "la marque 'built' du panneau Notes devrait être à true").to.be.true
        expect(panneauNotes.container.childNodes.length).to.equal(4)
        done()

      })

    })

  })
})
describe.only('Chargement d’un projet avec des parags', function () {
  /*
    Ce test doit permettre de voir si les paragraphes sont bien affichés à
    partir d'un projet enregistré.
    Pour ce faire, on crée un autre projet que le projet utilisé pour tous
    les tests.
  */
  before(function (done) {
    resetTests()

    let p = Projet.new('autreProjetTest')
    p.panneau('data').modified = true
    p.panneau('notes').add([parag0, parag2, parag10])
    p.panneau('scenier').add([parag15, parag9, parag5])
    p.panneau('manuscrit').add([parag11, parag1])
    p.saveAll( done )

    this.autreProj = p
  })

  it("possède bien les fichiers voulus", function(){
    const p = this.autreProj
    expect(this.autreProj.id).to.equal('autreProjetTest')
    p.set_title("Le nouveau projet provisoire")
    p.set_authors(["Phil", "Marion"])
    p.set_symmary("Le résumé du projet provisoire, pour voir l'affichage.")
    stores.set(p.store_data, 'data')
    stores.set(p.panneau('notes').store, 'données du panneau Notes')
    stores.set(p.panneau('scenier').store, 'données du panneau Scénier')
    stores.set(p.panneau('manuscrit').store, 'données du panneau Manuscrit')

    stores.forEach( (nom, st) => {
      console.log(st.path)
      expect(fs.existsSync(st.path),`Le fichier des '${nom}' devrait exister`).to.be.true
    })
  })
});
