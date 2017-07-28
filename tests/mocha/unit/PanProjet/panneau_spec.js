require('../../spec_helper.js')

describe('PanProjet', function () {
  describe('Instanciation', function () {
    it("répond à constructor", function(){
      expect(panneauSynopsis).to.respondsTo('constructor')
    })
    it("attend un identifiant et un projet", function(){
      let goodpan = new PanProjet('scenier', projet)
      expect(goodpan.constructor.name).to.equal('PanProjet')
    })
    it("ne peut pas être instancié sans ID de panneau", function(){
      expect(()=>{new PanProjet()}).to.throw("Il faut fournir l'identifiant du panneau à initialiser.")
    })
    it("ne peut pas être instancié sans ID de panneau valide", function(){
      expect(()=>{new PanProjet('badid')}).to.throw("'badid' n'est pas un identifiant de panneau valide.")
    })
    it("ne peut pas être instancié sans projet", function(){
      expect(()=>{new PanProjet('scenier')}).to.throw("Un panneau doit obligatoirement être initialisé avec son projet.")
    })
    it("n'est pas actif à son instanciation", function(){
      let pan = new PanProjet('notes',projet)
      expect(pan.actif).to.be.false
    })
    it("n'est pas chargé à son instanciation", function(){
      let pan = new PanProjet('notes',projet)
      expect(pan.loaded).to.be.false
    })
    it("n'est pas en chargement à son instanciation", function(){
      let pan = new PanProjet('notes',projet)
      expect(pan.loading).to.be.false
    })
    it("n'a pas de parags à son instanciation", function(){
      let pan = new PanProjet('notes',projet)
      expect(pan.parags_ids).to.be.undefined
    })
  });
  describe('Propriétés', function () {
    describe('name', function () {
      it('répond', function(){
        expect(panneauNotes.name).not.to.be.undefined
      })
      it('possède la bonne valeur', function(){
        expect(panneauNotes.name).to.equal('notes')
      });
    });
    describe('id', function () {
      it('répond', function(){
        expect(panneauScenier.id).not.to.be.undefined
      })
      it('possède la bonne valeur', function(){
        expect(panneauScenier.id).to.equal('scenier')
      })
    })
    describe('@parags_ids', function () {
      it('existe', function(){
        expect(panneauNotes.parags_ids).not.to.be.undefined
      });

    });
  })
  describe('Méthodes', function () {
    describe('#add', function () {
      it("répond", function(){
        expect(panneauManuscrit).to.respondsTo('add')
      })
      it("produit une erreur si un Parag n'est pas passé en argument", function(){
        expect(()=>{panneauNotes.add()}).to.throw("Il faut fournir un Parag en premier argument de `add`.")
        expect(()=>{panneauNotes.add(12)}).to.throw("Il faut fournir un Parag en premier argument de `add`.")
      })
      it("ajoute le parag à la liste des parags_ids du panneau", function(){
        panneauNotes.parags.reset()
        panneauNotes.add(parag6)
        expect(panneauNotes.parags_ids).to.deep.equal([6])
      })
      it("place le Parag à l'endroit voulu avec l'option `before`", function(done){
        panneauNotes.parags.reset()
        panneauNotes.add([parag1, parag2, parag3, parag4])
        panneauNotes.add(parag5, {before:parag2})
        expect(panneauNotes.parags_ids).to.deep.equal([1, 5, 2, 3, 4])
        done()
      })
      it("marque le panneau modifié", function(){
        panneauManuscrit._modified = false
        expect(panneauManuscrit.modified).to.be.false
        panneauManuscrit.add(parag12)
        expect(panneauManuscrit.modified).to.be.true
      })
    });
    describe('#save', function () {
      it("répond", function(){
        expect(panneauScenier).to.respondsTo('save')
      })
    }) // #save
    describe('#activate', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('activate')
      })
      it("charge le panneau s'il n'est pas encore chargé", function(done){
        // ==== ON CRÉE DES PARAGRAPHES DANS LE SCÉNIER ===
        let parags = [parag0, parag1, parag2, parag4, parag8]
        panneauScenier.add(parags)
        parags.forEach( p => p._modified = true)
        panneauScenier.modified = true
        projet.saveAll( () => {
          // ========= PRÉ-TEST ========
          resetTests()
          // ======> TEST <========
          let pan = new PanProjet('scenier', projet)
          expect(pan.loaded).to.be.false
          expect(pan.parags_ids).to.be.undefined
          pan.activate( () => {
            expect(pan.loaded, `loaded du panneau '${pan.id}' devrait être true`).to.be.true
            expect(pan.actif, `actif du panneau '${pan.id}' devrait être true`).to.be.true
            expect(pan.section, `Le panneau ${pan.id} devrait avoir la classe CSS 'actif'`).to.haveClass('actif')
            expect(pan.parags_ids, `parags_ids du paneau ${pan.id} ne devrait pas être undefined`).not.to.be.undefined
            expect(pan.parags_ids, `parags_ids du panneau ${pan.id} devrait être une liste`).to.be.instanceOf(Array)
            done()
          })

        })
      })
    }) // #activate
  });
})
