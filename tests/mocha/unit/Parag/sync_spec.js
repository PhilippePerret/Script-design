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

  describe('Création d’un tout premier paragraphe avec l’autosynchronisation', function () {
    before( () => {

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
        expect(projet.panneau(panid)._modified, `Le panneau "${panid}" ne devrait pas être marqué modifié.`).to.be.false
      })

      // - On enclenche l'auto-synchronisation -

      projet.option('autosync', 1)

      // - Création du parag #18 -

      projet.current_panneau = panneauScenier
      let newP = panneauScenier.parags.createAndEdit()

      // - La synchronisation n'est demandée qu'au changement de contenu -
      //   Donc on le simule.

      newP.onChangeContents()

    }) // fin de before

    it("crée le parag", function(){
      expect(Parags.get(19), 'Le parag#19 devrait exister').to.be.instanceOf(Parag)
    })
    it("ajoute le parag au panneau", function(){
      expect(panneauScenier.parags._ids).to.deep.equal([19])
    })
    it("crée la donnée relatives pour le parag", function(){
      expect(projet.relatives.all['19'],'La donnée relatives du parag#19 devrait exister').not.to.be.undefined
    })
    it("marque le panneau comme modifié", function(){
      expect(panneauScenier._modified).to.be.true
    })
    it("crée les autres parags synchronisés", function(){
      Projet.PANNEAU_LIST.forEach( (panid) => {
        let pan = projet.panneau(panid)
        if ( pan.absData.synchronizable )
        {
          // <= C'est un panneau synchronisable
          // => Il doit avoir reçu un paragraphe avec un identifiant > 19
          expect(pan.parags.count, `Le panneau ${pan.id} devrait posséder un parag`).to.equal(1)
          expect(pan.parags._ids[0], `Le parag du panneau ${pan.id} devrait avoir un ID supérieur à 19`).to.be.at.least(19)
        }
        else
        {
          // <= Ce n'est pas un panneau synchronisable
          // => Il ne doit pas avoir reçu du paragraphe
          expect(pan.parags.count, `Le parag ${pan.id} ne devrait avoir aucun parag.`).to.equal(0)
        }
      })
    })
  })

  describe.only('Création d’un parag synchronisé avant un parag déjà synchronisé', function () {
    before(function(){

      /* On réinitialise tout */

      resetTests({nombre_parags: 20})

      /*  On ajoute des paragraphes  */

      panneauNotes.add([parag0, parag1])
      panneauScenier.add([parag2, parag3])
      panneauTreatment.add([parag4, parag5, parag6, parag7, parag8])


      /*  On associe certains paragraphes  */

      expect(projet.relatives.areRelatifs(parag1, parag2)).to.be.false
      projet.relatives.associate([parag1, parag2, parag6])
      expect(projet.relatives.areRelatifs(parag1, parag2)).to.be.true

      /*  Dernières vérifications  */

      expect(panneauSynopsis.parags.count).to.equal(0)
      expect(panneauManuscrit.parags.count).to.equal(0)
      expect(panneauScenier.parags._ids[0]).to.equal(2)
      expect(panneauTreatment.parags._ids[2]).to.equal(6)

      // - On enclenche l'auto-synchronisation -

      projet.option('autosync', 1)

      /*  On sélectionne le parag0 du panneau notes
          et on crée le nouveau paragraphe            */
      projet.current_panneau = panneauNotes
      panneauNotes.select(parag0)
      let newP = panneauNotes.parags.createAndEdit()
      expect(newP.sync_after_save, `@sync_after_save du parag#${newP.id} devrait être true pour synchroniser`).to.be.true
      newP.onChangeContents() // pour lancer la synchronisation


    });

    it("le panneau notes a 3 parags", function(){
      expect(panneauNotes.parags.count).to.equal(3)
    })
    it("le nouveau parag a été créé en 2e position", function(){
      expect(panneauNotes.parags._ids[1]).not.to.equal(1)
      expect(panneauNotes.parags._ids[1]).to.equal(21)
      expect(panneauNotes.parags._ids[2]).to.equal(1)
    })
    it("Le panneau scénier a 3 parags", function(){
      expect(panneauScenier.parags.count, 'le panneau Scénier devrait avoir 3 parags').to.equal(3)
    })
    it("a créé le nouveau parag en tout premier dans le panneau Scénier", function(){
      expect(panneauScenier.parags._ids[0]).not.to.equal(2)
      expect(panneauScenier.parags._ids[0]).to.be.at.least(20)
    })
    it("Le panneau treatment possède 6 parags", function(){
      expect(panneauTreatment.parags.count, 'le panneau Treatment devrait avoir 6 parags').to.equal(6)
    })
    it("a créé le nouveau parag en 3e position dans le panneau Treatment", function(){
      expect(panneauTreatment.parags._ids[2]).not.to.equal(6)
      expect(panneauTreatment.parags._ids[2]).to.be.at.least(20)
    })
    it("a créé un nouveau parag dans le panneau Synopsis", function(){
      expect(panneauSynopsis.parags.count).to.equal(1)
    })
    it("a créé un nouveau parag dans le panneau Manuscrit", function(){
      expect(panneauManuscrit.parags.count).to.equal(1)
    })
  });
})
