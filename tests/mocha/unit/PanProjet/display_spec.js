/*
  Tests de l'affichage d'un panneau
*/

describe('Affichage des panneaux', function () {

  describe('Méthodes PanProjet', function () {

    describe('PRactivate', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRactivate')
      })

    })

  }) // Méthodes PanProjet


  describe('construction d’un panneau après chargement', function () {
    before(function () {
      resetTests({nombre_parags: 10})
      let arr = [parag2, parag0, parag5, parag6]
      panneauNotes.parags.add(arr)
      panneauNotes.modified = true
      arr.forEach(p => {p.modified = true})
      return projet.saveAll()
    })

    it("le panneau n'est pas encore construit", function(){
      expect(panneauNotes.container.childNodes.length).to.equal(0)
      expect(panneauNotes.built, 'la marque "built" du panneau Notes est à false').to.be.false
    })

    it("on demande la construction du panneau en l'activant", function(){

      return panneauNotes.PRactivate()
        .then( () => {
          expect(panneauNotes.built, "la marque 'built' du panneau Notes devrait être à true").to.be.true
          expect(panneauNotes.container.childNodes.length).to.equal(4)
        })
    })
  })
})
describe('Chargement d’un projet avec des parags', function () {
  /*
    Ce test doit permettre de voir si les paragraphes sont bien affichés à
    partir d'un projet enregistré.
    Pour ce faire, on crée un autre projet que le projet utilisé pour tous
    les tests.
  */
  before(function () {
    resetTests()

    let p = Projet.new('autreProjetTest')
    this.autreProj = p
    p.panneau('data').modified = true
    p.panneau('notes').add([parag0, parag2, parag10])
    p.panneau('scenier').add([parag15, parag9, parag5])
    p.panneau('manuscrit').add([parag11, parag1])
    return p.saveAll()
  })

  it("possède bien les fichiers voulus", function(){
    const p = this.autreProj
    expect(this.autreProj.id).to.equal('autreProjetTest')
    p.data.title    = "Le nouveau projet provisoire"
    p.data.authors  = ["Phil", "Marion"]
    p.data.symmary  = "Le résumé du projet provisoire, pour voir l'affichage."
    let stores = new Map()
    stores.set(p.panneau('notes').store, 'données du panneau Notes')
    stores.set(p.panneau('scenier').store, 'données du panneau Scénier')
    stores.set(p.panneau('manuscrit').store, 'données du panneau Manuscrit')

    stores.forEach( (nom, st) => {
      expect(fs.existsSync(st.path),`Le fichier des '${nom}' devrait exister`).to.be.true
    })
  })
});
