require('../../spec_helper.js')

let pan = null

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
      it("ajoute le parag à la liste des parags._ids du panneau", function(){
        panneauNotes.parags.reset()
        panneauNotes.add(parag6)
        expect(panneauNotes.parags._ids).to.deep.equal([6])
      })
      it("place le Parag à l'endroit voulu avec l'option `before`", function(){
        panneauNotes.parags.reset()
        panneauNotes.add([parag1, parag2, parag3, parag4])
        panneauNotes.add(parag5, {before:parag2})
        expect(panneauNotes.parags._ids).to.deep.equal([1, 5, 2, 3, 4])
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
      it("retourne une Promise si le panneau est modifié", function(){
        panneauScenier._modified = true
        expect(panneauScenier.save()).to.be.instanceOf(Promise)
      })
      it("retourne une Promise même si le panneau N'est PAS modifié", function(){
        panneauScenier._modified = false
        expect(panneauScenier.save()).to.be.instanceOf(Promise)
      })
      it("enregistre les données du panneau de façon asynchrone et remet modified à false", function(){
        resetTests({nombre_parags:10})
        expect(panneauNotes.store.exists()).to.be.false
        panneauNotes.add([parag5, parag0, parag3])
        panneauNotes.modified = true
        return panneauNotes.save()
          .then( () => {
            expect(panneauNotes.store.exists()).to.be.true
            expect(panneauNotes.modified).to.be.false
          })
      })
    }) // #save


    describe('#PRactivate', function () {
      it("répond", function(){
        expect(panneauNotes).to.respondsTo('PRactivate')
      })
      it("retourne une promise", function(){
        expect(panneauNotes.PRactivate()).to.be.instanceOf(Promise)
      })
      it("charge le panneau s'il n'est pas encore chargé", function(){
        resetTests({nombre_parags:10})
        // ==== ON CRÉE DES PARAGRAPHES DANS LE SCÉNIER ===
        let parags = [parag0, parag1, parag2, parag4, parag8]
        panneauScenier.add(parags)
        parags.forEach( p => p._modified = true)
        panneauScenier.modified = true
        pan = new PanProjet('scenier', projet)
        return projet.saveAll()
          // ========= PRÉ-TEST ========
          .then( () => {
            resetTests()
            // ======> TEST <========
            expect(pan.loaded).to.be.false
            expect(pan.parags_ids).to.be.undefined
            return Promise.resolve()
          })

          // =======> TEST <=========
          .then(pan.PRactivate.bind(pan))

          // ======== VÉRIFICATIONS =========
          .then( () => {
            expect(pan.loaded, `loaded du panneau '${pan.id}' devrait être true`).to.be.true
            expect(pan.actif, `actif du panneau '${pan.id}' devrait être true`).to.be.true
            expect(pan.section, `Le panneau ${pan.id} devrait avoir la classe CSS 'actif'`).to.haveClass('actif')
            expect(pan.parags._ids, `parags._ids du paneau ${pan.id} ne devrait pas être undefined`).not.to.be.undefined
            expect(pan.parags._ids, `parags._ids du panneau ${pan.id} devrait être une liste`).to.be.instanceOf(Array)
          })

      })
    })
  }) // #activate
})
