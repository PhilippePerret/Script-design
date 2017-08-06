require('../../spec_helper.js')


describe.only('Formulaire de brin', function () {
  before(function () {
    resetBrins()
  });
  describe('#showForm', function () {
    // Note : la méthode est déjà bien testée dans panneau_listing_spec.js

    it("initialise les champs si aucun parag n'est fourni", function(){
      // ======== PRÉPARATION =========

      // On met des valeurs dans les champs
      Brin.PROPERTIES.forEach( (dProp, prop) => {
        let newVal    = `BAD PROP ${prop}`
        let selector  = `span#brin_${prop}`
        brins.form.querySelector(selector).innerHTML = newVal

        // ======== PRÉ-TESTS ==========

        expect(brins.form.querySelector(selector).innerHTML).to.equal(newVal)
      })

      // ==========> TEST <===========

      brins.showForm()

      // ========= CONTROLE =============
      Brin.PROPERTIES.forEach( (dProp, prop) => {
        let selector  = `span#brin_${prop}`
        expect(brins.form.querySelector(selector).innerHTML).to.equal(dProp.default || '')
      })

    })

    it("possède un menu avec tous les types", function(){
      expect(projet.brins.form).to.haveTag('select', {id:'types_brin'})
    })

    describe('#setTitreFormTo', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('setTitreFormTo')
      })
      it("permet de définir le titre de la fenêtre", function(){
        this.skip()
      })
    });

  });


  describe('actualisation Form <-> Listing', function () {
    before(function () {


      brins.showPanneau()
      brins.iselected = 1 // le deuxième
      const brin_id = brins.selected.id
      const brin = Brins.get(brin_id) // = brins.selected
      this.oldTitreBrin = `${brin.titre}`

      // On édite le brin
      brins.showForm(brin)

      this.newTitre = 'Nouveau titre pour essai synchro form et panneau'
      brins.setFormValue('titre', this.newTitre)

      // ========= PREMIÈRE VÉRIFICATION ============
      expect(brin.titre).to.equal(this.oldTitreBrin)
      expect(brins.ULlisting).to.haveTag('div', {id:'brin-2-titre', text: this.oldTitreBrin})
      expect(brins.form.querySelector('span#brin_titre').innerHTML).to.equal(this.newTitre)

      // console.log( "getFormValues retourne : ", brins.getFormValues() )
      // =========> TEST <==========
      window.onkeyup({key: 'Enter'})


    });
    it("a bien enregistré le nouveau titre ", function(){
      expect(brins.selected.titre).to.equal(this.newTitre)
    })
    it("un changement de titre de brin se change dans la liste des brins ", function(){
      expect(brins.ULlisting).not.to.haveTag('div', {id:'brin-2-titre', text: this.oldTitreBrin})
      expect(brins.ULlisting).to.haveTag('div', {id:'brin-2-titre', text: this.newTitre})
    })
  });

  describe('actualisation du parent_id du brin', function () {
    describe('ajout dans un parent quand sans parent', function () {
      it("modifie le parent_id du brin", function(){
        this.skip()
      })
      it("ajoute le brin dans le UL.children du parent", function(){
        this.skip()
      })
    });
    describe('ajout dans un parent quand avait u n autre parent', function () {
      it("modifie le parent_id du brin", function(){
        this.skip()
      })
      it("sort le brin de l'ancien parent", function(){
        this.skip()
      })
      it("ajoute le brin dans le UL.children du nouveau parent", function(){
        this.skip()
      })
    });

    describe('retrait du parent (sans ajout autre part)', function () {
      it("retire du UL.children de l'ancien parent", function(){
        this.skip()
      })
      it("ajoute à la fin de sa liste de type", function(){
        this.skip()
      })
      it("modifie le parent_id du brin", function(){
        this.skip()
      })
    });
  });


  describe('Modification du type du brin', function () {
    describe('avec un type déjà affiché (i.e. qui comprend déjà des brins)', function () {
      before(function () {

      });
      it("modifie la valeur type du brin", function(){
        this.skip()
      })
      it("retire le brin de son ancien type", function(){
        this.skip()
      })
      it("ajoute le brin dans son nouveau type", function(){
        this.skip()
      })
    });
    describe('avec un type pas encore affiché (i.e. qui n’a pas de brin)', function () {
      before(function () {

      });
      it("modifie la valeur type du brin", function(){
        this.skip()
      })
      it("retire le brin de son ancien type", function(){
        this.skip()
      })
      it("a créé le titre du nouveau titre", function(){
        this.skip()
      })
      it("a créé la liste pour le nouveau titre", function(){
        this.skip()
      })
      it("ajoute le brin dans son nouveau type", function(){
        this.skip()
      })
    });
  });
});
