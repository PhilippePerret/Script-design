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
    it("confirmerChoix", function(){
      expect(brins).to.respondsTo('confirmerChoix')
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

  describe('#chooseCurrent puis #confirmerChoix', function () {
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

      brins.confirmerChoix()

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
      resetBrins()
      resetTabulator()

      const parag = parag2
      brins.showPanneau({parag: parag})
      brins.wantsNew()
      expect(currentPanneau.section).to.haveTag('section', {id: 'form_brins'})
      expect(currentPanneau.section).not.to.haveTag('section', {id: 'form_brins', style:'display:none'})
      expect(brins.currentParag).not.to.be.undefined
      expect(brins.currentParag.id).to.equal(2)

      this.nombre_brins_depart    = Brins.items.size
      brins.current_brin_ids = []

      let form = brins.form
      // console.log("\nformulaire", cont.outerHTML)

      // On met des valeurs dans le formulaire
      DOM.inner(form.querySelector('span#brin_titre'),        "Mon brin de createNew")
      DOM.inner(form.querySelector('span#brin_description'),  "Description du brin depuis createNew")
      DOM.inner(form.querySelector('span#brin_parent_id'),    "")
      DOM.inner(form.querySelector('span#brin_type'),         '20')

      projet.modified = false

      // Il faut indiquer la méthode qui suivra la création
      brins.formParams = {callback_oncreate: brins.onCreateNew.bind(brins) }

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
    it("ajoute le brin au panneau des brins", function(){
      let brin_id = Brin._lastID
      expect(brins.panneau).to.haveTag('li', {id: `brin-${brin_id}`})
    })
    it("sélectionne le nouveau brin", function(){
      let brin_id = Brin._lastID
      expect(brins.panneau).to.haveTag('li', {id: `brin-${brin_id}`, class: 'selected'})
    })
    it("ajoute le brin à la liste des brins courant (current_brin_ids)", function(){
      // En fait, c'est à la liste current_brin_ids qu'il suffit de l'ajouter
      let brin_id = Brin._lastID
      expect(brins.current_brin_ids).to.include(brin_id)
      expect(brins.currentBrin.id).to.equal(brin_id)
      // expect(brins.ULlisting).to.haveTag('li', {id: `brin-${brin_id}`, class: 'chosen'})
    })
    it("marque le projet modifié", function(){
      expect(projet.modified).to.be.true
    })
  });


  describe('#confirmerChoix', function () {
    before(function () {

      // ======== PRÉPARATION ============
      if ( ! brins.panneau.opened ) {
        brins.showPanneau({parag:parag4})
      } else {
        brins.currentParag = parag4
      }

      parag4.modified = false
      expect(brins.currentParag.id).to.equal(4)
      parag4.brin_ids = [0,1,2]
      brin.data.parag_ids = [4,2]
      brin1.data.parag_ids = [4,2]
      brin2.data.parag_ids = [4,2]
      expect(Parags.get(4).brin_ids).to.deep.equal([0,1,2])
      brins.current_brin_ids = [1,2,3]
      // C'est-à-dire qu'on doit retirer le 0 et ajouter le 3

      // =========> TEST <=============
      brins.confirmerChoix()

    });
    it("attribut les bons brins au parag", function(){
      expect(parag4.brin_ids).to.deep.equal([1,2,3])
    })
    it("attribut le bon parag aux nouveaux brins", function(){
      expect(brin3.parag_ids).to.include(4)
    })
    it("retire bien le parag aux ancienx brins", function(){
      expect(brin.parag_ids).not.to.include(4)
    })
    it("marque le parag modifié", function(){
      expect(parag4.modified).to.be.true
    })
    it("marque les brins modifiés modifiés (sic)", function(){
      expect(brin.modified).to.be.true
      expect(brin3.modified).to.be.true
    })
  });

  describe('#editCurrent', function () {
    before(function () {

      resetTabulator()

      // On mocke des méthodes
      const my    = brins
      const brin  = brins.currentBrin

      my.oldBrinsCreateNew = Brins.prototype.createNew
      Brins.prototype.createNew = undefined
      Brins.prototype.createNew = function(){ throw 'Brins#createNew'}
      my.oldBrinUpdate = Brins.prototype.updateCurrent
      Brins.prototype.updateCurrent = undefined
      Brins.prototype.updateCurrent = function(){throw 'Brins#updateCurrent'}

      expect(()=>{brins.updateCurrent()}).to.throw('Brins#updateCurrent')
      expect(()=>{brins.createNew()}).to.throw('Brins#createNew')

      brins.showPanneau()
      brins.iselected = 0

      // On met des données propres pour vérifier
      brins.titrePourTest = `Un titre le ${moment().format()}`
      brins.currentBrin.data.titre = brins.titrePourTest

      brins.currentBrin.modified = false

      // ======= PRÉ-VÉRIFICATIONS =========

      if ( brins.form.displayed ) {
        expect(brins.form.opened).to.be.false
        expect(currentPanneau.section).to.haveTag('section', {id:'form_brins', style:'display:none'})
        // Si le formulaire est déjà affiché, il doit être fermé
      }

    });
    after(function () {
      // On remet les méthodes originales (mais normalement, elles doivent être
      // remise déjà avant)
      const my = brins
      Brins.prototype.createNew     = my.oldBrinsCreateNew
      Brins.prototype.updateCurrent = my.oldBrinUpdate
    });
    it("est déclenchée par la touche 'e'", function(){

      // ========> TEST <==========

      window.onkeyup({key:'e'})

      // ======== VÉRIFICATIONS ============

      expect(currentPanneau.section).not.to.haveTag('section', {id:'form_brins', style:'display:none'})
      expect(currentPanneau.section).to.haveTag('section', {id:'form_brins'})
      expect(brins.form.opened).to.be.true

    })
    it("met les valeurs du brin dans les champs", function(){
      expect(brins.form.querySelector('span#brin_titre').innerHTML).to.equal(brins.titrePourTest)
    })
    it("appelle l'actualisation du brin avec la touche Enter", function(){
      // Un peu violent mais simple et pratique (pour voir si elle n'est
      // pas utilisée ailleurs)
      expect(brins.form.opened).to.be.true
      expect(()=>{window.onkeyup({key:'Enter'})}).to.throw('Brins#updateCurrent')
    })
    it("actualise les données du brin en le marquant modifié", function(){
      const my    = brins
      const brin  = brins.currentBrin
      // Remettre les méthodes
      Brins.prototype.createNew     = my.oldBrinsCreateNew
      Brins.prototype.updateCurrent = my.oldBrinUpdate

      let nouveauTitre = "Nouveau titre pour update"
      let newDescription = "Une nouvelle description pour l'update du brin dans les tests"
      expect(brin.titre).not.to.equal( nouveauTitre )
      expect(brin.description).not.to.equal(newDescription)
      brins.form.querySelector('span#brin_titre').innerHTML = nouveauTitre
      brins.form.querySelector('span#brin_description').innerHTML = newDescription

      // window.onkeyup({key:'Enter'}) // on le fait vraiment
      brins.updateCurrent()

      expect(brin.titre).to.equal(nouveauTitre)
      expect(brin.description).to.equal(newDescription)
      expect(brin.modified).to.be.true
    })

    it("ferme le formulaire", function(){
      expect(brins.form.opened, 'La propriété opened du formulaire devrait être à false').to.be.false
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
