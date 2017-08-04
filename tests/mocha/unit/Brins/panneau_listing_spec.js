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
    it("unchooseCurrent", function(){
      expect(brins).to.respondsTo('unchooseCurrent')
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
      createProjetNoSave()
      projet.current_panneau = panneauSynopsis
      brins.showPanneau({parag: parag5})
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
      expect(brins.ibrin_selected).to.equal(1)
      expect(first.className).not.to.include('selected')
      expect(second.className).to.include('selected')
      expect(third.className).not.to.include('selected')
      // ========> TEST <============
      brins.selectNext()
      expect(brins.ibrin_selected).to.equal(2)
      expect(first.className).not.to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).to.include('selected')
    })
    it("s'arrête de sélectionner le suivant s'il n'y en a plus", function(){
      let ilast = brins.nombre_brins_displayed - 1
      let last  = brins.panneau.querySelectorAll('ul#brins > li.brin')[ilast]
      brins.ibrin_selected = ilast
      brins.selectBrinCurrent()
      expect(brins.ibrin_selected).to.equal(ilast)
      expect(last.className).to.include('selected')
      // ========> TEST <============
      brins.selectNext()
      expect(brins.ibrin_selected).to.equal(ilast)
      expect(last.className).to.include('selected')
    })
    it("avec Maj, sélectionne 10 brins plus loin ou le dernier", function(){
      this.skip()
    })
  });
  describe('#selectPrevious', function () {
    it("sélectionne le brin précédent", function(){
      // Pour le moment, on essaie dans la suite de ce qui précède
      brins.ibrin_selected = 2
      brins.selectBrinCurrent()
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let second  = brins.panneau.querySelectorAll('ul#brins > li.brin')[1]
      let third   = brins.panneau.querySelectorAll('ul#brins > li.brin')[2]
      expect(brins.ibrin_selected).to.equal(2)
      expect(first.className).not.to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).to.include('selected')
      // ========> TEST <============
      brins.selectPrevious()
      expect(brins.ibrin_selected).to.equal(1)
      expect(first.className).not.to.include('selected')
      expect(second.className).to.include('selected')
      expect(third.className).not.to.include('selected')
      // ========> TEST <============
      brins.selectPrevious()
      expect(brins.ibrin_selected).to.equal(0)
      expect(first.className).to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).not.to.include('selected')
    })
    it("s'arrête de monter s'il n'y en a plus", function(){
      let first   = brins.panneau.querySelectorAll('ul#brins > li.brin')[0]
      let second  = brins.panneau.querySelectorAll('ul#brins > li.brin')[1]
      let third   = brins.panneau.querySelectorAll('ul#brins > li.brin')[2]
      // On poursuit le précédent
      expect(brins.ibrin_selected).to.equal(0)
      // ========> TEST <============
      brins.selectPrevious()
      brins.selectPrevious()
      brins.selectPrevious()
      expect(brins.ibrin_selected).to.equal(0)
      expect(first.className).to.include('selected')
      expect(second.className).not.to.include('selected')
      expect(third.className).not.to.include('selected')

    })
    it("avec la touche Maj, sélectionne celui 10 plus loin ou le premier", function(){
      this.skip()
    })
  });

  describe('#chooseCurrent', function () {
    it("choisit le brin courant et le met en exergue (chosen)", function(){
      this.skip()
      // TODO le faire pour plusieurs
    })
    it("ajoute un autre brin à la liste si un autre choisi", function(){
      this.skip()
    })
  });

  describe('#unchooseCurrent', function () {
    it("désélectionne le brin courant et le retire de l'exergue", function(){
      this.skip()
      // n'a  plus la classe 'chosen'
    })
  });

  describe('#adopterChoix', function () {
    it("attribut les brins retenus au parag", function(){
      this.skip()
    })
    it("attribut le parag aux brins sélectionné", function(){
      this.skip()
      // En vérifiant les doublons (garder la trace de la valeur initiale)
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
