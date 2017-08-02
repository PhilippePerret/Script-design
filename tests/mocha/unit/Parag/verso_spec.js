/*

  Test de toutes les méthodes qui s'occupe du verso du parag
  pour voir ses données propres

  Rappel : il y a un seul formulaire, qui est déplacé chaque fois
  que le parag est édité.

*/
require('../../spec_helper.js')


// Le premier before
// Je le mets dans une méthode séparée, car il faudra revenir
// à ça en cours de test
function reinitialisationInitiale ()
{
  resetTests({nombre_parags: 20})

  /*- Introduction du parag #12 dans le panneau Scénier -*/

  panneauScenier.parags.add(parag12)

}

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

describe('Verso du parag', function () {
  before(function () {

    reinitialisationInitiale()

  });

  describe('Méthodes impliquées', function () {

    describe('Propriété Parag@recto', function () {
      it("existe", function(){
        expect(parag12.recto).to.not.be.undefined
        expect(parag12.recto).to.be.instanceOf(HTMLDivElement)
      })
    });

    describe('Propriété Parag@verso', function () {
      it("existe", function(){
        expect(parag12.verso).to.not.be.undefined
        expect(parag12.verso).to.be.instanceOf(HTMLDivElement)
      })
    });

    describe('Parag#isRecto', function () {
      before(function () {
        panneauNotes.add(parag12)
      });
      it("répond", function(){
        expect(parag12).to.respondsTo('isRecto')
      })
      it("retourne true si le recto est affiché", function(){
        parag12.showVerso()
        expect(parag12.isRecto()).to.be.false
        parag12.showRecto()
        expect(parag12.isRecto()).to.be.true
      })
      it("retourne false si le verso est affiché", function(){
        parag12.showRecto()
        expect(parag12.isRecto()).to.be.true
        parag12.showVerso()
        expect(parag12.isRecto()).to.be.false
      })
    });

    describe('#toggleRectoVerso', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('toggleRectoVerso')
      })
      describe('Appel de la méthode dans les deux cas', function () {
        before(function () {
          const my = this
          // Mocker les méthodes showVerso et showRecto
          this.methodShowVersoOriginale = Parag.prototype.showVerso
          Parag.prototype.showVerso = undefined
          Parag.prototype.showVerso = function(){
            my.methode_utilised = 'showVerso'
            return 'showVerso'
          }
          this.methodShowRectoOriginale = Parag.prototype.showRecto
          Parag.prototype.showRecto = undefined
          Parag.prototype.showRecto = function(){
            my.methode_utilised = 'showRecto'
            return 'showRecto'
          }
        });
        after(function () {
          // Remettre les méthode original
          Parag.prototype.showRecto = this.methodShowRectoOriginale
          delete this.methodShowRectoOriginale
          Parag.prototype.showVerso = this.methodShowVersoOriginale
          delete this.methodShowVersoOriginale
        });
        it("appelle la méthode showVerso si c'est le recto", function(){
          parag12._isRecto = true
          // =========> TEST <==========
          parag12.toggleRectoVerso()
          // ========== VÉRIFICATION ==========
          expect(this.methode_utilised).to.equal('showVerso')
        })
        it("appelle la méthode showRecto si c'est le verso", function(){
          parag12._isRecto = false
          // =========> TEST <==========
          parag12.toggleRectoVerso()
          // ========== VÉRIFICATION ==========
          expect(this.methode_utilised).to.equal('showRecto')
        })
      });
    });

    describe('showVerso', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('showVerso')
      })

      it("affiche le verso (formulaire) et masque le recto", function(){

        // ======== PRÉPARATION ==========
        resetTests({nombre_parags: 20})
        panneauScenier.parags.add(parag12)
        return panneauScenier.PRactivate()
        .then( () => {

          // ======= VÉRIFICATIONS PRÉLIMINAIRES =======

          // Par défaut, c'est le recto qui est évidemment affiché
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

      })
    });

    describe('Parag#showRecto', function () {
      it("répond", function(){
        expect(parag12).to.respondsTo('showRecto')
      })
      describe('Réaffichage du recto', function () {
        before(function () {
          resetTests()
          panneauNotes.add(parag4)

        })
        after(function(){
          reinitialisationInitiale()
        })
        it("réaffiche le recto", function(){

          return panneauNotes.PRactivate()
          .then( () => {

            parag4.showVerso()
            expect(parag4.isRecto()).to.be.false
            expectRectoNotVisibleFor(parag4)
            expectVersoVisibleFor(parag4)

            // ==========> TEST <==========
            parag4.showRecto()
            expect(parag4.isRecto()).to.be.true
            expectRectoVisibleFor(parag4)
            expectVersoNotVisibleFor(parag4)

          })

        })

      });
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
      it("un champ pour l'id", function(){
        expect(verso).to.haveTag('span', {id:'parag_id'})
      })
      it("un champ pour la durée", function(){
        expect(verso).to.haveTag('span', {id:'span-duration'})
        expect(verso.querySelector('span#span-duration')).to.haveTag(
          'span', {id:'parag_duration', class:'editable dashed', text:'1:00'}
        )
        .and.haveTag(
          'label', {for:'parag_duration', text:'Durée'}
        )
      })

      it("un champ pour la position (soit fixe soit calculée)", function(){
        expect(verso).to.haveTag('span', {id:'span-position'})
        expect(verso.querySelector('span#span-position')).to.haveTag(
          'span', {id:'parag_position', class:'editable dashed', text: 'auto'}
        )
        .and.haveTag(
          'label', {for:'parag_position', text:'Position'}
        )
      })

      it("un menu pour le type du parag", function(){
        expect(verso).to.haveTag('span', {id:'span-type'})
        expect(verso.querySelector('#span-type')).to.haveTag(
          'span', {id: 'parag_type'}
        )
      })

      it("un champ pour les brins", function(){
        expect(verso).to.haveTag('span', {id: 'span-brins'})
        expect(verso.querySelector('span#span-brins')).to.haveTag(
          'span', {text:'b : Nouveau brin'}
        )
      })
    });



  });


});
