/*

  Test de la class Brins

*/
require('../../spec_helper.js')

let brins = projet.brins
let brin, brin1, brin2


function resetBrins ()
{
  Brins._items = new Map()
  brin  = new Brin({id: 0, projet: projet, titre: "Brin sans titre"})
  brin1 = new Brin({id: 1, projet: projet, titre: "Brin #1"})
  brin2 = new Brin({id: 2, projet: projet, titre: "Brin #2"})
}

resetBrins()


describe.only('Brins', function () {
  it("existe", function(){
    expect('undefined' === typeof(Brins)).to.be.false
    expect(typeof Brins).to.equal('function')
  })

  describe('Projet#brins', function () {
    it("répond", function(){
      expect(projet.brins).not.to.be.undefined
    })
    it("est une instance 'Brins'", function(){
      expect(projet.brins.constructor.name).to.equal('Brins')
    })
    it("répond à la méthode `add`", function(){
      expect(projet.brins).to.respondsTo('add')
    })
  });


  describe('<#projet>.brins.add', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('add')
    })
  })


  describe('<#projet>.brins.remove', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('remove')
    })
    it("produit une erreur si aucun ID n'est fourni", function(){
      expect(()=>{projet.brins.remove()}).to.throw("Il faut fournir l'ID du brin à détruire.")
    })
    it("détruit le brin spécifié", function(){
      this.skip("En attente d'implémentation")
    })
  });


  /** ---------------------------------------------------------------------
    *
    *   TEST DES MÉTHODES D'HELPER
    *
  *** --------------------------------------------------------------------- */

  describe('Méthodes d’helper', function () {

    describe('panneau', function () {
      it("existe", function(){
        expect(brins.panneau).to.not.be.undefined
      })
      it("retourne un HTMLSectionElement", function(){
        expect(brins.panneau).to.be.instanceOf(HTMLElement)
      })
      it("avec les attributs voulus", function(){
        expect(brins.panneau).to.haveTag('section', {id:'panneau_brins'})
      })
      it("contient tous les brins du projet", function(){
        expect(Brins.items.size).to.be.at.least(3)
        resetBrins()
        Brins.items.forEach( (brin, bid) => {
          expect(brins.panneau).to.haveTag('div', {class:'brin', id:`brin-${bid}`})
        })
      })
      it("tous les brins sont bien formatés", function(){
        let o = brins.panneau
        expect(o).to.haveTag('div', {id:'brin-1'})
        o = o.querySelector('div#brin-1')
        expect(o).to.haveTag('div', {class:'titre', id:'brin-1-titre'})
        expect(o).to.haveTag('div', {class:'children', id:'brin-1-children'})
      })
      it("rassemble les brins parents et enfants", function(){
        brin.data.id  = 0
        brin1.data.id = 1
        brin2.data.id = 2
        brin.parent = brin1
        brin2.parent = brin1

        brins.panneauBuilt = false // forcer sa reconstruction

        expect(brins.panneau).to.haveTag('div',{id:'brin-1'})
        let o = brins.panneau.querySelector('div#brin-1')
        expect(o).to.haveTag('div', {class:'children', id:'brin-1-children'})
        o = o.querySelector('div.children')
        // Les deux brins enfants sont dans les enfants.
        expect(o).to.haveTag('div', {id:'brin-0'})
        expect(o).to.haveTag('div', {id:'brin-2'})

      })
    });

    describe('showPanneau', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('showPanneau')
      })
      it("affiche le panneau brins dans le panneau", function(){
        expect(panneauNotes.section).not.to.haveTag('section', {id:'panneau_brins'})
        return panneauNotes.PRactivate()
        .then( () => {
          brins.showPanneau()
          expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins'})
        })
      })
    });

    describe('hidePanneau', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('hidePanneau')
      })
      it("masque le panneau", function(){
        brins.showPanneau()
        expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins'})
        brins.hidePanneau()
        expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins', 'style':'display:none'})
      })
    });



    describe('form', function () {
      it("existe", function(){
        expect(brins.form).to.not.be.undefined
      })
      it("retourne un HTMLSectionElement", function(){
        expect(brins.form).to.be.instanceOf(HTMLElement)
      })
      it("contient un formulaire avec les bons éléments", function(){
        let f = brins.form
        expect(f)
          .to.haveTag('span', {'data-tab':"titre", class:"editable"})
          .and.haveTag('span', {'data-tab':"description", class:"editable"})
          .and.haveTag('span', {'data-tab':"parent_id", class:"editable"})
      })
    });

    describe('showForm', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('showForm')
      })
    });

    describe('hideForm', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('hideForm')
      })
      it("masque le formulaire", function(){
        return panneauScenier.PRactivate()
        .then( () => {
          brins.showForm()
          expect(panneauScenier.section).not.to.haveTag('section', {id:'form_brins', style:'display:none'})
          brins.hideForm()
          expect(panneauScenier.section).to.haveTag('section', {id:'form_brins', style:'display:none'})
        })
      })
    });


  });
});
