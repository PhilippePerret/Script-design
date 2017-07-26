/*

  Test de la synchronisation d'un nouveau paragraphe

  On crée un parag d'id #18, avec
    - la synchronisation automatique enclenchée
    - aucun panneau chargé

*/
require('../../spec_helper.js')

describe.only('Synchronisation d’un nouveau paragraphe', function () {

  describe('methodes utiles', function () {
    describe('sync', function () {
      expect(parag0).to.respondsTo('sync')
      expect(parag0.startPos).to.equal(0)
    });
  });

  describe('Création d’un nouveau paragraphe avec l’autosynchronisation', function () {
    before( () => {
      console.log("Before seulement avant la création du parag avec autosync")

      // - On reconstruit seulement 18 paragraphes -

      resetTest({nombre_parags : 18})
      expect(parag0).to.be.instanceOf(Parag)
      expect(()=>{return parag19}).to.throw()
      expect(Parags.get(19), 'Le parag#18 ne devrait pas exister').to.be.instanceOf(Parag)
      expect(projet.relatives.all['19'], 'La donnée relatives du parag#18 ne devrait pas exister').to.be.undefined


      // - On vérifie qu'aucun panneau ne soit chargé -
      // - On vérifie que tous les panneaux soit vides -

      Projet.PANNEAU_LIST.forEach( (panid) => {
        expect(projet.panneau(panid).loaded, `Le panneau "${panid}" ne devrait pas être chargé`).to.be.false
        expect(projet.panneau(panid).parags.count, `Le panneau ${panid} ne devrait pas avoir de parags`).to.equal(0)
      })

      // - On enclenche l'auto-synchronisation -

      projet.option('autosync', 1)

      // - Création du parag #18 -

      projet.current_panneau = panneauScenier
      let newP = panneauScenier.parags.createNewParag()

    })
    it("crée le parag", function(){
      expect(Parags.get(19), 'Le parag#19 devrait exister').to.be.instanceOf(Parag)
    })
    it("ajoute le parag au panneau", function(){
      expect(panneauScenier.parags._ids).to.deep.equal([19])
    })
    it("crée la donnée relatives pour le parag", function(){
      expect(projet.relatives.all['19'],'La donnée relatives du parag#19 devrait exister').not.to.be.undefined
    })
    it("crée les autres parags synchronisés", function(){
      this.skip()
    })

  })
})
