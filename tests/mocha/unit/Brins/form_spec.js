require('../../spec_helper.js')


describe.only('Formulaire de brin', function () {
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
});
