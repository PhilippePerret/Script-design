require('../../spec_helper.js')

describe.only('Panneau du listing des brins', function () {
  before(function () {
    return resetProjetWithBrins()
  });
  describe('répond au méthode', function () {
    it("showPanneau", function(){
      expect(brins).to.respondsTo('showPanneau')
    })
    it("selectNext", function(){
      expect(brins).to.respondsTo('selectNext')
    })
    it("selectPrevious", function(){
      expect(brins).to.respondsTo('selectPrevious')
    })
    it("chooseCurrent", function(){
      expect(brins).to.respondsTo('chooseCurrent')
    })
    it("adopterChoix", function(){
      expect(brins).to.respondsTo('adopterChoix')
    })
    it("renoncerChoix", function(){
      expect(brins).to.respondsTo('renoncerChoix')
    })
    it("afficherAide", function(){
      expect(brins).to.respondsTo('afficherAide')
    })
    it("createNew", function(){
      expect(brins).to.respondsTo('createNew')
    })
  });



  describe('Une ouverture par un parag', function () {
    before(function () {
      return createProjetNoSave()
      .then( () => {
        projet.current_panneau = panneauSynopsis
        brins.showPanneau({parag: parag5})
        return Promise.resolve()
      })
    });
    it("ouvre le panneau", function(){
      expect(brins.panneau.opened, 'opened du panneau devrait être true').to.be.true
      expect(brins.panneau.getAttribute('style')).to.equal('')
    })
    it("choisit tous les brins du parag", function(){
      Brins.items.forEach( (dbrin, bid) => {
        if ( parag5.brin_ids.indexOf(bid) < 0 ) {
          expect(brins.panneau).not.to.haveTag('li', {id:`brin-${bid}`, class: 'chosen'})
        } else {
          expect(brins.panneau).to.haveTag('li', {id:`brin-${bid}`, class: 'chosen'})
        }
      })
    })
    it("à la première ouverture, sélectionne le premier brin", function(){
      let first = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      expect(first.className).to.include('brin selected')
    })
  });

  describe('#selectNext', function () {
    it("sélectionne le brin suivant", function(){
      // Pour le moment, on essaie dans la suite de ce qui précède
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let second  = brins.panneau.querySelectorAll('ul#brins > li.brin')[1]
      let third   = brins.panneau.querySelectorAll('ul#brins > li.brin')[2]
      expect(first.className).to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).not.to.include('selected')
      // ========> TEST <============
      brins.selectNext()
      expect(brins.iselected).to.equal(1)
      expect(first.className).not.to.include('selected')
      expect(second.className).to.include('selected')
      expect(third.className).not.to.include('selected')
      // ========> TEST <============
      brins.selectNext()
      expect(brins.iselected).to.equal(2)
      expect(first.className).not.to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).to.include('selected')
    })
    it("s'arrête de sélectionner le suivant s'il n'y en a plus", function(){
      let ilast = brins.nombre_brins_displayed - 1
      let last  = brins.panneau.querySelectorAll('ul#brins > li.brin')[ilast]
      brins.iselected = ilast
      brins.selectBrinCurrent()
      expect(brins.iselected).to.equal(ilast)
      expect(last.className).to.include('selected')
      // ========> TEST <============
      brins.selectNext()
      expect(brins.iselected).to.equal(ilast)
      expect(last.className).to.include('selected')
    })
    it("avec Maj, sélectionne 10 brins plus loin ou le dernier", function(){
      let ilast = brins.nombre_brins_displayed - 1
      if ( ilast > 9 ) { ilast = 9 }
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let dernier = brins.panneau.querySelectorAll('ul#brins > li.brin')[ilast]
      brins.iselected = 0
      expect(dernier).not.to.be.undefined
      expect(first.className).to.include('selected')
      expect(dernier.className).not.to.include('selected')
      // ==========> TEST <============
      brins.selectNext({shiftKey: true})
      expect(first.className).not.to.include('selected')
      expect(dernier.className).to.include('selected')
    })
  });
  describe('#selectPrevious', function () {
    it("sélectionne le brin précédent", function(){
      // Pour le moment, on essaie dans la suite de ce qui précède
      brins.iselected = 2
      brins.selectBrinCurrent()
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let second  = brins.panneau.querySelectorAll('ul#brins > li.brin')[1]
      let third   = brins.panneau.querySelectorAll('ul#brins > li.brin')[2]
      expect(brins.iselected).to.equal(2)
      expect(first.className).not.to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).to.include('selected')
      // ========> TEST <============
      brins.selectPrevious()
      expect(brins.iselected).to.equal(1)
      expect(first.className).not.to.include('selected')
      expect(second.className).to.include('selected')
      expect(third.className).not.to.include('selected')
      // ========> TEST <============
      brins.selectPrevious()
      expect(brins.iselected).to.equal(0)
      expect(first.className).to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).not.to.include('selected')
    })
    it("s'arrête de monter s'il n'y en a plus", function(){
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let second  = brins.panneau.querySelectorAll('ul#brins > li.brin')[1]
      let third   = brins.panneau.querySelectorAll('ul#brins > li.brin')[2]
      // On poursuit le précédent
      expect(brins.iselected).to.equal(0)
      // ========> TEST <============
      brins.selectPrevious()
      brins.selectPrevious()
      brins.selectPrevious()
      expect(brins.iselected).to.equal(0)
      expect(first.className).to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).not.to.include('selected')

    })
    it("avec la touche Maj, sélectionne celui 10 plus loin ou le premier", function(){
      let ilast = brins.nombre_brins_displayed - 1
      if ( ilast > 9 ) { ilast = 9 }
      let first = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let last  = brins.panneau.querySelectorAll('ul#brins > li.brin')[ilast]
      brins.iselected = ilast
      expect(brins.iselected).to.equal(ilast)
      expect(first.className).not.to.include('selected')
      expect(last.className).to.include('selected')
      // =========> TEST <==========
      brins.selectPrevious({shiftKey: true})
      // ========== VÉRIFICATION ============
      expect(brins.iselected).to.equal(0)
      expect(first.className).to.include('selected')
      expect(last.className).not.to.include('selected')
    })
  });

  describe('#chooseCurrent puis #adopterChoix', function () {
    it("choisit le brin courant et le met en exergue (chosen) et indique la modification", function(){

      brins.showPanneau({parag: parag5})

      const listing = brins.panneau.querySelector('ul#brins')
      // Noter : on répète l'opération pour trois paragraphes successif,
      // qu'on retire ou qu'on ajoute au paragraphe.
      let arr = [0, 2, 5]

      parag5.modified = false
      projet.modified = false

      arr.forEach( isel => {

        brins.iselected = isel // sélectionne vraiment le brin
        let selected = brins.selected
        let parag_brins = brins.current_brin_ids

        selected.modified = false

        // ============ PRÉ-VÉRIFICATIONS ================

        let choisir = parag_brins.indexOf(brins.selected.id) < 0
        if ( choisir ) {
          // Le parag n'est pas (encore) dans ce brin
          expect(parag_brins).not.to.include(selected.id)
          expect(listing).not.to.haveTag('li', {id:`brin-${selected.id}`, class:'chosen'})
        } else {
          // Le parag est dans ce brin
          expect(parag_brins).to.include(selected.id)
          expect(listing).to.haveTag('li', {id:`brin-${selected.id}`, class:'chosen'})
        }

        // ===========> TEST <==============

        brins.chooseCurrent()

        // ============== VÉRIFICATION ===========
        if ( choisir ) {
          expect(brins.current_brin_ids).to.include(selected.id)
          // Mais les listes originales ne contiennent pas le brin ou le parag
          expect(selected.parag_ids).not.to.include(5)
          expect(brins.currentParag.brin_ids).not.to.include(selected.id)
          // Marque le brin chosen dans la liste
          expect(listing).to.haveTag('li', {id:`brin-${selected.id}`, class:'chosen'})
        }
        else
        {
          expect(brins.current_brin_ids).not.to.include(brins.selected.id)
          // Les liste dans les données contiennent encore cette marque
          expect(selected.parag_ids).to.include(5)
          expect(brins.currentParag.brin_ids).to.include(selected.id)

          // Marque le brin non chosen
          expect(listing).not.to.haveTag('li', {id:`brin-${selected.id}`, class:'chosen'})
        }

        // Rien ne doit avoir été marqué modifié, encore
        expect(selected.modified, `Le brin #${selected.id} ne devrait pas être marqué modifié`).to.be.false
        expect(parag5.modified, 'Le parag #5 ne devrait pas être marqué modifié').to.be.false
        expect(projet.modified, 'Le projet ne devrait pas être marqué modifié').to.be.false

      })


      /** ---------------------------------------------------------------------
        *
        *   On passe à l'adoptation du choix
        *
      *** --------------------------------------------------------------------- */

      // ========> T E S T <=========

      brins.adopterChoix()

      // ======== V É R I F I C A T I O N S ========

      arr.forEach( bid => {
        let brin = Brins.get(bid)
        expect(parag5.brin_ids).to.include(bid)
        expect(brin.modified).to.be.true
        expect(brin.parag_ids).to.include(5)
      })

      expect(brins.currentParag.modified).to.be.true

    })
  });


  describe('#renoncerChoix', function () {
    it("ferme le panneau sans rien faire", function(){
      this.skip()
    })
  });

  describe('#createNew', function () {
    it("ouvre la fenêtre de création d'un nouveau brin", function(){
      this.skip()
    })
  });

});
