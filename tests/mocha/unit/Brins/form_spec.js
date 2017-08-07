require('../../spec_helper.js')


describe('Formulaire de brin', function () {
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
        brins.showForm()
        let divTitre = brins.form.querySelector('div#titre-form-brin')
        brins.setTitreFormTo()
        expect(divTitre.innerHTML).to.equal("Formulaire de brin")
        let newTitre = 'Brins du parag #12'
        brins.setTitreFormTo(newTitre)
        expect(divTitre.innerHTML).to.equal(newTitre)
      })
      it("sans argument, permet de remettre le titre par défaut", function(){
        brins.showForm()
        let divTitre = brins.form.querySelector('div#titre-form-brin')
        brins.setTitreFormTo()
        expect(divTitre.innerHTML).to.equal("Formulaire de brin")
      })
      it("sans argument et avec un parag courant, met le titre adéquat", function(){
        brins.currentParag = parag4
        brins.showForm()
        let divTitre = brins.form.querySelector('div#titre-form-brin')
        brins.setTitreFormTo()
        expect(divTitre.innerHTML).to.equal("Brins du parag #4")
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
    function setParentIdTo (id)
    {
      brins.form.querySelector('span#brin_parent_id').innerHTML = String(id)
    }
    describe('ajout dans un parent quand sans parent', function () {
      before(function () {
        resetBrins()
        expect(brin.ULChildren).not.to.haveTag('li', {id:'brin-1'})
        brins.showPanneau()
        brins._selected = brin1
        brins.showForm(brin1)
        setParentIdTo(0)
        window.onkeyup({key:'Enter'})
      });
      it("modifie le parent_id du brin", function(){
        expect(brin1.parent_id).to.equal(0)
        expect(brin1.parent.id).to.equal(brin.id)
      })
      it("ajoute le brin dans le UL.children du parent", function(){
        console.log("brin.ULChildren = ", brin.ULChildren.outerHTML)
        expect(brin.ULChildren).to.haveTag('li', {id:'brin-1'})
      })
    });
    describe('ajout dans un parent quand avait un autre parent', function () {
      before(function () {
        resetBrins()

        brin1.update({parent_id: 3})
        brins.showPanneau()
        expect(brin3.ULChildren).to.haveTag('li', {id:'brin-1'})
        expect(brin1.parent_id).to.equal(3)
        brins._selected = brin1
        brins.showForm(brin1)
        expect(brins.currentBrin.id).to.equal(1)
        // On change le parent du brin en le mettant dans le brin 0
        setParentIdTo(0)
        window.onkeyup({key:'Enter'})
      });
      it("modifie le parent_id du brin", function(){
        expect(brin1.parent_id).to.equal(0)
        expect(brin1.parent.id).to.equal(0)
      })
      it("sort le brin de l'ancien parent", function(){
        expect(brin3.ULChildren).not.to.haveTag('li', {id:'brin-1'})
      })
      it("ajoute le brin dans le UL.children du nouveau parent", function(){
        expect(brin.ULChildren).to.haveTag('li', {id:'brin-1'})
      })
    });

    describe('retrait du parent (sans ajout autre part)', function () {
      before(function () {

      });
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

  describe('Choix du parent', function () {
    it("sélectionne le brin courant comme parent du nouveau si brin sans parent sélectionné", function(){
      this.skip()
    })
    it("ne sélectionne pas le brin courant comme parent du nouveau si brin sélectionné est un brin avec parent", function(){
      this.skip()
    })
    it("propose un menu avec la liste des brins (ou la liste ?)", function(){
      this.skip()
    })
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
