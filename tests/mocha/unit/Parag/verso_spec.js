/*

  Test de toutes les méthodes qui s'occupe du verso du parag
  pour voir ses données propres

  Rappel : il y a un seul formulaire, qui est déplacé chaque fois
  que le parag est édité.

*/
require('../../spec_helper.js')

function expectRectoVisibleFor (parag)
{
  expect(parag.panneau.container).not.to.haveTag(
    'div', {id: `p-${parag.id}-recto`, class: 'hidden'}
  )
}
function expectRectoNotVisibleFor (parag) {
  expect(parag.panneau.container).to.haveTag(
    'div', {id: `p-${parag.id}-recto`, class: 'hidden'}
  )
}
function expectVersoVisibleFor (parag) {
  expect(parag.panneau.container).not.to.haveTag(
    'div', {id: `p-${parag.id}-verso`, class: 'hidden'}
  )
}
function expectVersoNotVisibleFor (parag) {
  expect(parag.panneau.container).to.haveTag(
    'div', {id: `p-${parag.id}-verso`, class: 'hidden'}
  )
}

describe.only('Verso du parag', function () {
  before(function () {
    resetTests({nombre_parags: 20})

    /*- Introduction du parag #12 dans le panneau Scénier -*/

    panneauScenier.parags.add(parag12)

  });

  describe('Méthodes impliquées', function () {

    describe('Parag#isRecto', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('isRecto')
      })
      it("retourne true si le recto est affiché", function(){
        this.skip()
      })
      it("retourne false si le verso est affiché", function(){
        this.skip()
      })
    });


    describe('showVerso', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('showVerso')
      })

      it("affiche le formulaire et masque le content", function(){

        // ======== PRÉPARATION ==========
        panneauScenier.parags.add(parag12)
        panneauScenier.reset()

        // ======= VÉRIFICATIONS PRÉLIMINAIRES =======

        expectRectoVisibleFor(parag12)
        expectVersoNotVisibleFor(parag12)
        expect(parag12.isRecto()).to.be.true

        // ========> TEST <========
        parag12.showVerso()

        // ========== VÉRIFICATIONS ========

        expectRectoNotVisibleFor(parag12)
        expectVersoVisibleFor(parag12)
        expect(parag12.isRecto()).to.be.false

      })
    });

    describe('Parag#showRecto', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('showRecto')
      })
      it("réaffiche le recto", function(){
        this.skip()
      })
      it("remet isRecto à true", function(){
        parag12.showVerso()
        expect(parag12.isRecto()).to.be.false
        parag12.showRecto()
        expect(parag12.isRecto()).to.be.true
      })
    });

    describe('Projet#brins#new', function () {
      it("répond", function(){
        expect(projet.brins).to.respondsTo('new')
      })
    });
  });


  describe('Éléments DOM utiles', function () {
    describe('div.p-verso (pour recevoir le formulaire)', function () {
      it("existe dans le mainDiv du parag", function(){
        expect(parag12.mainDiv).to.haveTag('div', {class:'p-verso', id:'p-12-verso'})
      })
    });
  });

  describe('Contrôle du verso du parag', function () {
    before(function () {

      /*- Mettre le parag en édition pour voir son verso -*/

      parag12.showVerso()

      panneauManuscrit.add(parag12)
      // L'ajout dans le panneau Manuscrit provoque aussi, si nécessaire,
      // l'inscription du formulaire de verso.

      verso = parag12.mainDiv.querySelector('div.p-verso')
    });
    describe('contenu du verso', function () {

      it("un formulaire général", function(){
        expect(verso).to.haveTag('form', {id: 'parag_verso_form'})
      })
      it("un champ pour la durée", function(){
        expect(verso).to.haveTag('span', {id:'span-duration'})
        expect(verso.querySelector('span#span-duration')).to.haveTag(
          'span', {id:'parag-duration', class:'editable', text:'0:00'}
        )
        .and.haveTag(
          'label', {for:'parag-duration', text:'Durée'}
        )
      })

      it("un champ pour la position (soit fixe soit calculée)", function(){
        expect(verso).to.haveTag('span', {id:'span-position'})
        expect(verso.querySelector('span#span-position')).to.haveTag(
          'input', {type:'text', name:'parag[position]', id:'parag-position'}
        )
        .and.haveTag(
          'span', {id:'parag-position', class:'editable', text: '0:00:00'}
        )
        .and.haveTag(
          'label', {for:'parag-position', text:'Position'}
        )
      })

      it("un menu pour le type du parag", function(){
        expect(verso).to.haveTag('span', {id:'span-type'})
        expect(verso.querySelector('span#span-type')).to.haveTag(
          'select', {name:'parag[type]', id:'parag-type'}
        )
      })

      it("un champ pour les brins", function(){
        expect(verso).to.haveTag('span', {id: 'span-brins'})
        expect(verso.querySelector('span#span-brins')).to.haveTag(
          'span', {text:'Nouveau brin : b'}
        )
        .and.haveTag(
          'select', {id:'list-brins', name:'brins'}
        )
      })
    });



  });


});
