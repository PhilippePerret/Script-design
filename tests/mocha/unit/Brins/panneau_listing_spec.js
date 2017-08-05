require('../../spec_helper.js')

describe.only('Panneau du listing des brins', function () {
  before(function () {
    return resetProjetWithBrins()
  });
  describe('répond aux méthodes', function () {
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
    it("selectNext", function(){
      expect(brins).to.respondsTo('selectNext')
    })
    it("selectPrevious", function(){
      expect(brins).to.respondsTo('selectPrevious')
    })
    it("selectPrevious", function(){
      expect(brins).to.respondsTo('selectPrevious')
    })
    it("editCurrent", function(){
      expect(brins).to.respondsTo('editCurrent')
    })
  });

  describe('définit les propriétés', function () {
    before(function () {
      brins.showPanneau({parag:parag0})
    });
    it("@selected (Brin)", function(){
      expect(brins.selected).not.to.be.undefined
    })
    it("@iselected (Number)", function(){
      expect(brins.iselected).not.to.be.undefined
    })
    it("@current_brin_ids (Array)", function(){
      expect(brins.current_brin_ids).not.to.be.undefined
      expect(brins.current_brin_ids).to.deep.equal(parag0.brin_ids)
    })
    it("@currentParag (Parag)", function(){
      expect(brins.currentParag).not.to.be.undefined
      expect(brins.currentParag.id).to.equal(0)
    })
    it("@panneau (HTMLElement)", function(){
      expect(brins.panneau).not.to.be.undefined
      expect(brins.panneau).to.be.instanceOf(HTMLElement)
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
      /*
        On affiche le panneau des brins pour le parag3 et on le
        met dans les brins 0, 2 et 5
      */
      const parag = parag7
      const brins_initiaux = parag.brin_ids.map(n => {return n})
      let watcher_brin_ids = parag.brin_ids.map(n => {return n})
      brins.showPanneau({parag: parag})
      expect(brins.currentParag.id).to.equal(7)
      const listing = brins.panneau.querySelector('ul#brins')
      let arr = [0, 2]
      arr.forEach( isel => {
        brins.iselected = isel // sélectionne vraiment le brin
        let selected = brins.selected
        brins.chooseCurrent()
        watcher_brin_ids.push(selected.id)
      })

      expect(brins.current_brin_ids).to.deep.equal(watcher_brin_ids)

      // ===========> TEST <==============

      brins.renoncerChoix()

      // ========= VÉRIFICATIONS =============

      expect(brins.current_brin_ids).to.deep.equal(watcher_brin_ids) // la même
      expect(parag.brin_ids).to.deep.equal(brins_initiaux)
      arr.forEach( bid => {
        expect(Brins.get(bid).parag_ids).not.to.include(parag.id)
      })

    })
  });

  describe('#wantsNew', function () {
    it("ouvre la fenêtre de création d'un nouveau brin", function(){
      const parag = parag1
      brins.showPanneau({parag: parag})

      expect(currentPanneau.section).not.to.haveTag('section', {id: 'form_brins'})

      // ==========> TEST <==========
      brins.wantsNew()

      expect(currentPanneau.section).to.haveTag('section', {id: 'form_brins'})
    })
  });

  describe('#createNew', function () {
    before(function () {
      const parag = parag2
      brins.showPanneau({parag: parag})
      brins.wantsNew()
      expect(currentPanneau.section).to.haveTag('section', {id: 'form_brins'})
      expect(currentPanneau.section).not.to.haveTag('section', {id: 'form_brins', style:'display:none'})

      this.nombre_brins_depart = Brins.items.size
      this.current_brin_ids_init = brins.current_brin_ids.map(n=>{return n})

      let form = currentPanneau.section.querySelector('section#form_brins')
      // console.log("\nformulaire", cont.outerHTML)

      // On met des valeurs dans le formulaire
      DOM.inner(form.querySelector('span#brin_titre'),        "Mon brin de createNew")
      DOM.inner(form.querySelector('span#brin_description'),  "Description du brin depuis createNew")
      DOM.inner(form.querySelector('span#brin_parent_id'),    "")
      DOM.inner(form.querySelector('span#brin_type'),         '20')

      projet.modified = false

      // ===========> TEST <=============
      brins.createNew()
    });
    it("crée un nouveau brin", function(){
      expect(Brins.items.size).to.equal(this.nombre_brins_depart + 1)
    })
    it("ferme le formulaire d'édition du brin", function(){
      expect(currentPanneau.section).to.haveTag('section', {id: 'form_brins', style:'display:none'})
    })
    it("crée le nouveau brin avec les données fournies", function(){
      let brin_id = Brin._lastID
      let brin = Brins.get(brin_id)
      expect(brin.titre).to.equal("Mon brin de createNew")
      expect(brin.description).to.equal("Description du brin depuis createNew")
      expect(brin.type).to.equal(20)
    })
    it("Tabulator.sectionMap est de nouveau le panneau des brins", function(){
      expect(Tabulator.curSectionMap.get('objet_id')).to.equal('panneau_brins')
    })
    it("Remet le gestionnaire de keyUp du panneau des brins", function(){
      // expect(currentPanneau.section).to.haveTag('section', {id:'panneau_brins'})
      // expect(currentPanneau.section).not.to.haveTag('section', {id:'panneau_brins', style:'display:none'})
      // window.onkeyup({key:'Escape'})
      // expect(currentPanneau.section).to.haveTag('section', {id:'panneau_brins', style:'display:none'})
    })
    it("ajoute le brin au panneau des brins", function(){
      let brin_id = Brin._lastID
      expect(brins.panneau).to.haveTag('li', {id: `brin-${brin_id}`})
    })
    it("sélectionne le nouveau brin", function(){
      let brin_id = Brin._lastID
      expect(brins.panneau).to.haveTag('li', {id: `brin-${brin_id}`, class: 'selected'})
    })
    it("ajoute le brin au parag courant par défaut", function(){
      // En fait, c'est à la liste current_brin_ids qu'il suffit de l'ajouter
      let brin_id = Brin._lastID
      expect(brins.panneau).to.haveTag('li', {id: `brin-${brin_id}`, class: 'chosen'})
      expect(brins.current_brin_ids).to.include(brin_id)
    })
    it("marque le projet modifié", function(){
      expect(projet.modified).to.be.true
    })
  });


  describe('#afficherAide', function () {
    it("ouvre la fenêtre de l'aide pour les brins", function(){
      // this.skip()
      // TODO Pour le moment, comme c'est une vraie nouvelle fenêtre, je
      // ne sais pas comment la tester en tests unitaire.
      // Ou peut-être faudrait-il la faire apparaitre dans la fenêtre
      // courante ?
    })
  });

});
