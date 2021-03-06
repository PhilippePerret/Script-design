/*

  Test de la synchronisation d'un nouveau paragraphe

  On crée un parag d'id #18, avec
    - la synchronisation automatique enclenchée
    - aucun panneau chargé

*/
require('../../spec_helper.js')

describe('Synchronisation d’un nouveau parag dans seulement 1 panneau', function () {
  before(function () {
    resetTests({nombre_parags: 20})
  });
  describe('Les méthodes utiles', function () {

    describe('#allPanneauxButMine', function () {
      it("répond", function(){
        expect(parag2.allPanneauxButMine).to.not.be.undefined
      })
      it("retourne une liste des panneaux synchronisables sans le panneau du parag", function(){
        panneauNotes.add(parag3)
        let res = parag3.allPanneauxButMine
        expect(res).to.be.instanceOf(Array)
        expect(res.indexOf('scenier', "Le panneau Scénier devrait se trouver dans la liste des panneaux à synchroniser")).to.be.at.least(0)
        expect(res.indexOf('manuscrit', "Le panneau Manuscrit devrait se trouver dans la liste des panneaux à synchroniser")).to.be.at.least(0)
        expect(res.indexOf('notes', "Le panneau Notes ne devrait pas se trouver dans la liste des panneaux à synchroniser (c'est le panneau du parag à synchroniser)")).to.equal(-1)
        expect(res.indexOf('data'), 'Le panneau Data ne devrait pas se trouver dans la liste des panneaux synchronisables…').to.equal(-1) // au cas où
      })
    });
    describe('#PRsync', function () {
      it("répond", function(){
        expect(parag0).to.respondsTo('PRsync')
      })
      it("retourne une promise", function(){
        if (undefined === parag0.panneau_id){ panneauNotes.add(parag0)}
        expect(parag0.PRsync()).to.be.instanceOf(Promise)
      })
      it("met le busy du projet à true", function(){
        if (undefined === parag0.panneau_id){ panneauNotes.add(parag0)}
        projet.busy = false
        let res = parag0.PRsync()
        expect(projet.busy, "Le busy du projet devrait être true").to.be.true
        // Noter qu'il faut vérifier tout de suite, avant même que
        // PRsync ait fini ton travail, sinon on serait passer par
        // PRendSync qui remet projet.busy à false.
        return res
      })
      it("instanie et renseigne la propriété Parag@parags2sync_list", function(){
        resetTests({nombre_parags: 20})
        if (undefined === parag0.panneau_id){ panneauNotes.add(parag0)}
        expect(parag0.parags2sync_list).to.be.undefined
        let res = parag0.PRsync()
        // Comme l'instanciation de la liste se fait en "synchrone", on
        // peut vérifier son existence tout de suite après l'appel de la
        // méthode. En revanche, le nombre de parags collectés ne peut
        // se vérifier qu'à la fin, donc dans le 'then'
        .then( () => {
          expect(parag0.parags2sync_list.length).to.be.at.least(3)
        })
        expect(parag0.parags2sync_list).to.be.instanceOf(Array)
        return res
      })
    }) // #PRsync

    describe('#PRloadAllPanneaux', function () {
      it("répond", function(){
        expect(parag0).to.respondsTo('PRloadAllPanneaux')
      })
      it("retourne une Promise", function(){
        if (undefined === parag0.panneau_id){ panneauNotes.add(parag0)}
        expect(parag0.PRloadAllPanneaux()).to.be.instanceOf(Promise)
      })
    })


    describe('#PRsyncAllPanneaux', function () {
      it("répond", function(){
        expect(parag1).to.respondsTo('PRsyncAllPanneaux')
      })
      it("retourne une promesse", function(){
        if (undefined === parag2.panneau_id){ panneauNotes.add(parag2)}
        parag2.parags2sync_list = []
        expect(parag2.PRsyncAllPanneaux()).to.be.instanceOf(Promise)
      })
    });

    describe('#PRsyncInPanneau', function () {
      it("répond", function(){
        expect(parag0).to.respondsTo('PRsyncInPanneau')
      })
      it("retourne une promise", function(){
        if (undefined === parag2.panneau_id){ panneauScenier.add(parag2)}
        expect(parag0.PRsyncInPanneau('notes')).to.be.instanceOf(Promise)
      })
    });

    describe('#PRendSync', function () {
      it("répond", function(){
        expect(parag3).to.respondsTo('PRendSync')
      })
      it("retourne une promesse", function(){
        if (undefined === parag3.panneau_id){ panneauNotes.add(parag3)}
        parag3.parags2sync_list = []
        expect(parag3.PRendSync()).to.be.instanceOf(Promise)
      })
      it("met le busy du projet à false", function(){
        if (undefined === parag4.panneau_id){ panneauNotes.add(parag4)}
        projet.busy = true
        parag4.parags2sync_list = []
        return parag4.PRendSync()
        .then( () => {
          expect(projet.busy, "le busy du projet devrait être false").to.be.false
        })
      })
    });


    describe('Synchronisation du parag', function () {
      before(function () {
        // ====== PRÉPARATION =========
        resetTest({nombre_parags: 10})
        panneauScenier.add(parag4)

        // ======= PRÉ-VÉRIFICATIONS =========
        expect(panneauNotes.parags.count).to.equal(0)
        expect(panneauSynopsis.parags.count).to.equal(0)
        expect(panneauManuscrit.parags.count).to.equal(0)
        expect(parag4.relatives.size).to.equal(0)

        // ========> TEST <==========
        return parag4.PRsync()

      })
      it("crée un nouveau parag dans chaque panneau synchronisable", function(){
        parag4.allPanneauxButMine.forEach( pan_id => {
          expect(projet.panneau(pan_id).parags.count).to.equal(1)
        })
      })
      it("régle correctement les relatives du parag synchronisé", function(){
        let nombreAutresPanos = parag4.allPanneauxButMine.length
        expect(parag4.relatives.size).to.equal(nombreAutresPanos)
      })
    });

  });
//   /*
//     C'est une version simplifiée pour vérifier la base.
//    */
//   before(function (done) {
//     // - On reconstruit seulement 18 paragraphes -
//
//     resetTest({nombre_parags : 18})
//     expect(parag0).to.be.instanceOf(Parag)
//     expect(()=>{return parag19}).to.throw()
//     expect(Parags.get(19), 'Le parag#19 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(Parags.get(20), 'Le parag#20 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(Parags.get(21), 'Le parag#21 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(projet.relatives.all['19'], 'La donnée relatives du parag#18 ne devrait pas exister').to.be.undefined
//
//
//     // - On vérifie qu'aucun panneau ne soit chargé -
//     // - On vérifie que tous les panneaux soit vides -
//
//     Projet.PANNEAUX_SYNC.forEach( (panid) => {
//       expect(projet.panneau(panid).loaded, `Le panneau "${panid}" ne devrait pas être chargé`).to.be.false
//       expect(projet.panneau(panid).parags.count, `Le panneau ${panid} ne devrait pas avoir de parags`).to.equal(0)
//       expect(projet.panneau(panid)._modified, `Le panneau "${panid}" ne devrait pas être marqué modifié.`).to.be.false
//     })
//
//     // - On enclenche l'auto-synchronisation -
//
//     setOptionProjet('autosync', 1)
//
//     /*  On ne met plus qu'un seul panneau pour la synchronisation */
//
//     this.original_panneaux_sync = Projet.PANNEAUX_SYNC.slice(0)
//     Projet._panneauxSync = ['scenier', 'notes']
//
//     // - Création du parag #18 -
//
//     projet.current_panneau = panneauScenier
//     let newP = panneauScenier.parags.createAndEdit()
//
//     // - La synchronisation n'est demandée qu'au changement de contenu -
//     //   Donc on le simule.
//     newP.newContents = "Le nouveau contenu du paragraphe créé."
//     return newP.onChangeContents()
//
//
//   })
//   after(function () {
//
//     /*  On remet la liste original de panneaux synchronisés */
//
//     Projet._panneauxSync = this.original_panneaux_sync
//     // console.log("Projet.PANNEAUX_SYNC remis à ", Projet.PANNEAUX_SYNC)
//
//   });
//
//   it("crée le nouveau parag", function(){
//     expect(Parags.get(19)).to.be.instanceOf(Parag)
//   })
//   it("a ajouté le parag au panneau notes", function(){
//     expect(panneauNotes.parags._ids).to.include(20)
//     expect(panneauNotes.parags._ids).to.deep.equal([20])
//   })
//   it("a synchronisé les deux parags", function(){
//     expect(Parags.get(19).isRelativeOf(20), 'les parags 19 et 20 doivent être relatifs').to.be.true
//     expect(Parags.get(20).isRelativeOf(19), 'les parags 19 et 20 doivent être relatifs').to.be.true
//   })
//   it("marque les deux panneaux modifiés", function(){
//     expect(panneauNotes._modified, 'le panneau Notes devrait être marqué modifié').to.be.true
//     expect(panneauScenier._modified, 'le panneau Scénier devrait être marqué modifié').to.be.true
//   })
//
// });
//
//
//
//
//
//
//
//
//
//
//
// describe('Synchronisation d’un nouveau paragraphe dans 2 panneaux', function () {
//   /*
//     C'est une version simplifiée pour vérifier la base.
//    */
//   before(function (done) {
//     // - On reconstruit seulement 18 paragraphes -
//
//     resetTest({nombre_parags : 18})
//     expect(parag0).to.be.instanceOf(Parag)
//     expect(()=>{return parag19}).to.throw()
//     expect(Parags.get(19), 'Le parag#19 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(Parags.get(20), 'Le parag#20 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(Parags.get(21), 'Le parag#21 ne devrait pas exister').to.be.instanceOf(Parag)
//     expect(projet.relatives.all['19'], 'La donnée relatives du parag#18 ne devrait pas exister').to.be.undefined
//
//
//     // - On vérifie qu'aucun panneau ne soit chargé -
//     // - On vérifie que tous les panneaux soit vides -
//
//     Projet.PANNEAUX_SYNC.forEach( (panid) => {
//       expect(projet.panneau(panid).loaded, `Le panneau "${panid}" ne devrait pas être chargé`).to.be.false
//       expect(projet.panneau(panid).parags.count, `Le panneau ${panid} ne devrait pas avoir de parags`).to.equal(0)
//       expect(projet.panneau(panid)._modified, `Le panneau "${panid}" ne devrait pas être marqué modifié.`).to.be.false
//     })
//
//     // - On enclenche l'auto-synchronisation -
//
//     projet.option('autosync', 1)
//
//     /*  On ne met plus qu'un seul panneau pour la synchronisation */
//
//     this.original_panneaux_sync = Projet.PANNEAUX_SYNC.slice(0)
//     Projet._panneauxSync = ['scenier', 'notes', 'manuscrit']
//
//     // - Création du parag #18 -
//
//     projet.current_panneau = panneauScenier
//     let newP = panneauScenier.parags.createAndEdit()
//
//     // - La synchronisation n'est demandée qu'au changement de contenu -
//     //   Donc on le simule.
//
//     newP.onChangeContents()
//
//   })
//   after(function () {
//
//     /*  On remet la liste original de panneaux synchronisés */
//
//     Projet._panneauxSync = this.original_panneaux_sync
//     console.log("Projet.PANNEAUX_SYNC remis à ", Projet.PANNEAUX_SYNC)
//
//   });
//
//   it("crée le nouveau parag", function(){
//     expect(Parags.get(19)).to.be.instanceOf(Parag)
//   })
//   it("a ajouté le parag au panneau notes", function(){
//     expect(panneauNotes.parags._ids).to.deep.equal([20])
//     expect(panneauManuscrit.parags._ids).to.deep.equal([21])
//   })
//   it("a synchronisé les trois parags", function(){
//     expect(Parags.get(19).isRelativeOf(20), 'les parags 19 et 20 doivent être relatifs').to.be.true
//     expect(Parags.get(20).isRelativeOf(19), 'les parags 19 et 20 doivent être relatifs').to.be.true
//     expect(Parags.get(20).isRelativeOf(21), 'les parags 21 et 20 doivent être relatifs').to.be.true
//     expect(Parags.get(19).isRelativeOf(21), 'les parags 21 et 19 doivent être relatifs').to.be.true
//   })
//   it("marque les deux panneaux modifiés", function(){
//     expect(panneauNotes._modified, 'le panneau Notes devrait être marqué modifié').to.be.true
//     expect(panneauScenier._modified, 'le panneau Scénier devrait être marqué modifié').to.be.true
//     expect(panneauManuscrit._modified, 'le panneau Manuscrit devrait être marqué modifié').to.be.true
//   })
//
// });
//
//
//
//
//
//
//
//
//
//
//
// describe('Synchronisation d’un nouveau paragraphe', function () {
//
//   describe('methodes utiles', function () {
//     describe('sync', function () {
//       resetTest()
//       expect(parag0).to.respondsTo('sync')
//       expect(parag0.startPos).to.equal(0)
//     });
//   });
//
//   describe('avec l’autosynchronisation', function () {
//     before( (done) => {
//
//       // - On reconstruit seulement 18 paragraphes -
//
//       resetTest({nombre_parags : 18})
//       expect(parag0).to.be.instanceOf(Parag)
//       expect(()=>{parag19.id}).to.throw()
//       expect(Parags.get(19), 'Le parag#18 ne devrait pas exister').to.be.instanceOf(Parag)
//       expect(projet.relatives.all['19'], 'La donnée relatives du parag#19 ne devrait pas exister').to.be.undefined
//
//
//       // - On vérifie qu'aucun panneau ne soit chargé -
//       // - On vérifie que tous les panneaux soit vides -
//
//       Projet.PANNEAU_LIST.forEach( (panid) => {
//         expect(projet.panneau(panid).loaded, `Le panneau "${panid}" ne devrait pas être chargé`).to.be.false
//         expect(projet.panneau(panid).parags.count, `Le panneau ${panid} ne devrait pas avoir de parags`).to.equal(0)
//         expect(projet.panneau(panid)._modified, `Le panneau "${panid}" ne devrait pas être marqué modifié.`).to.be.false
//       })
//
//       // - On enclenche l'auto-synchronisation -
//
//       projet.option('autosync', 1)
//
//       // - Création du parag #18 -
//
//
//       setCurrentPanneau(panneauScenier)
//       let newP = createAndEditParag()
//
//       // - La synchronisation n'est demandée qu'au changement de contenu -
//       //   Donc on le simule.
//
//       newP.onChangeContents()
//
//       done()
//
//     }) // fin de before
//
//     it("crée le parag", function(){
//       expect(Parags.get(19), 'Le parag#19 devrait exister').to.be.instanceOf(Parag)
//     })
//     it("ajoute le parag au panneau", function(){
//       expect(panneauScenier.parags._ids).to.deep.equal([19])
//     })
//     it("crée la donnée relatives pour le parag", function(){
//       expect(projet.relatives.all['19'],'La donnée relatives du parag#19 devrait exister').not.to.be.undefined
//     })
//     it("marque le panneau comme modifié", function(){
//       expect(panneauScenier._modified).to.be.true
//     })
//     it("crée les autres parags synchronisés", function(){
//       Projet.PANNEAU_LIST.forEach( (panid) => {
//         let pan = projet.panneau(panid)
//         if ( pan.absData.synchronizable )
//         {
//           // <= C'est un panneau synchronisable
//           // => Il doit avoir reçu un paragraphe avec un identifiant > 19
//           expect(pan.parags.count, `Le panneau ${pan.id} devrait posséder un parag`).to.equal(1)
//           expect(pan.parags._ids[0], `Le parag du panneau ${pan.id} devrait avoir un ID supérieur à 19`).to.be.at.least(19)
//         }
//         else
//         {
//           // <= Ce n'est pas un panneau synchronisable
//           // => Il ne doit pas avoir reçu du paragraphe
//           expect(pan.parags.count, `Le parag ${pan.id} ne devrait avoir aucun parag.`).to.equal(0)
//         }
//       })
//     })
//   })
//
//   describe('Création d’un parag synchronisé avant un parag déjà synchronisé', function () {
//
//     before(function(){
//
//       /* On réinitialise tout */
//
//       resetTests({nombre_parags: 20})
//
//       /*  On ajoute des paragraphes  */
//
//       panneauNotes.add([parag0, parag1])
//       panneauScenier.add([parag2, parag3])
//       panneauTreatment.add([parag4, parag5, parag6, parag7, parag8])
//
//       console.log("<- fin de before")
//     });
//
//     it("on associe les parags #1 et #2", function(done){
//       /*  On associe certains paragraphes  */
//
//       expect(projet.relatives.areRelatifs(parag1, parag2), 'les parag1 et parag2 ne devraient pas être relatifs').to.be.false
//       projet.relatives.associate([parag1, parag2, parag6])
//       expect(projet.relatives.areRelatifs(parag1, parag2), 'les parag1 et parag2 devraient être relatifs').to.be.true
//
//       done()
//     })
//
//     it("on sauve tous les paragraphes", function(done){
//
//       projet.saveAll( () => {
//         expect(panneauScenier._modified, 'panneauScenier ne devrait pas être marqué modified').to.be.false
//         expect(panneauManuscrit._modified, 'le panneau Manuscrit ne devrait pas être marqué modified').to.be.false
//         done()
//       })
//
//     })
//
//     it("on fait des premières vérifications avant initialisation", function(){
//
//       expect(panneauSynopsis.parags.count, 'le panneau Synopsis ne devrait pas avoir de parags').to.equal(0)
//       expect(panneauManuscrit.parags.count, 'le panneau Manuscrit ne devrait pas avoir de parags').to.equal(0)
//       expect(panneauScenier.parags._ids[0], 'l’ID du premier parag du scénier devrait être 2').to.equal(2)
//       expect(panneauTreatment.parags._ids[2], 'l’ID du 3e parag du Traitement devrait être 6').to.equal(6)
//
//     })
//
//     it("on reset les panneaux autre que celui courant", function(){
//
//       panneauScenier.reset()
//       panneauManuscrit.reset()
//       panneauSynopsis.reset()
//       panneauTreatment.reset()
//
//     })
//
//     it("on fait quelques vérifications", function(){
//
//       /*  Dernières vérifications  */
//
//       [
//         panneauScenier, panneauManuscrit, panneauSynopsis, panneauTreatment
//       ].forEach( ( pan ) => {
//         expect(pan.dataLoaded, `dataLoaded du panneau ${pan.id} devrait être false`).to.be.false
//         expect(pan.parags._ids, `parags._ids du panneau ${pan.id} devrait être undefined`).to.be.undefined
//       })
//
//     })
//
//     it("le container du scénier est vide", function(){
//
//       expect(panneauScenier.container.childNodes.length).to.equal(0)
//       // Parce qu'on a resetté les panneaux avant
//
//     })
//     it("On crée le paragraphe synchronisé", function(done){
//
//       // - On enclenche l'auto-synchronisation -
//
//       setOptionProjet('autosync', 1)
//
//       /*  On sélectionne le parag0 du panneau notes
//           et on crée le nouveau paragraphe            */
//
//       setCurrentPanneau(panneauNotes)
//
//       selectParag(parag0)
//       // Le nouveau parag devra être inséré après la paragraphe sélectionné,
//       // donc après le premier parag.
//
//       // console.log("Parags du panneau Notes avant synchro :", panneauNotes.parags._ids)
//       let newP = createAndEditParag()
//       expect(newP.sync_after_save, `@sync_after_save du parag#${newP.id} devrait être true pour synchroniser`).to.be.true
//
//       newP.onChangeContents() // pour lancer la synchronisation
//       // console.log("Parags du panneau Notes APRÈS synchro :", panneauNotes.parags._ids)
//
//       done()
//     })
//
//     it("le panneau notes a 3 parags", function(){
//
//       expect(panneauNotes.parags.count).to.equal(3)
//
//     })
//
//     it("le nouveau parag a été créé en 2e position", function(){
//
//       // Noter que c'est bien APRÈS le parag0 que le nouveau parag doit
//       // être inséré, pas avant.
//       expect(panneauNotes.parags._ids[1], 'le deuxième parag du panneau Notes ne devrait plus être 1').not.to.equal(1)
//       expect(panneauNotes.parags._ids[1], 'le deuxième parag du panneau Notes devrait avoir l’ID 21').to.equal(21)
//       expect(panneauNotes.parags._ids[2], 'le troisième parag du panneau Notes devrait être le #1').to.equal(1)
//
//     })
//
//     it("Le panneau scénier a 3 parags", function(){
//       expect(panneauScenier.parags.count, 'le panneau Scénier devrait avoir 3 parags').to.equal(3)
//     })
//
//     it("a créé le nouveau parag en tout premier dans le panneau Scénier", function(){
//
//       expect(panneauScenier.parags._ids[0], 'le premier parag du panneau Scénier ne doit pas être le #2').not.to.equal(2)
//       expect(panneauScenier.parags._ids[0], 'l’ID du premier parag du panneau Scénier devrait valoir au moins 20').to.be.at.least(20)
//
//     })
//     it("Le panneau treatment possède 6 parags", function(){
//       expect(panneauTreatment.parags.count, 'le panneau Treatment devrait avoir 6 parags').to.equal(6)
//     })
//     it("a créé le nouveau parag en 3e position dans le panneau Treatment", function(){
//       expect(panneauTreatment.parags._ids[2], 'l’ID du 3e parag du panneau Traitement ne devrait pas être #6').not.to.equal(6)
//       expect(panneauTreatment.parags._ids[2], 'l’ID du 3e parag du panneau Traitement devrait être supérieur à #20').to.be.at.least(20)
//     })
//     it("a créé un nouveau parag dans le panneau Synopsis", function(){
//       expect(panneauSynopsis.parags.count, 'le panneau Synopsis devrait avoir 1 parag').to.equal(1)
//     })
//     it("a créé un nouveau parag dans le panneau Manuscrit", function(){
//       expect(panneauManuscrit.parags.count, 'le panneau Manuscrit devrait avoir 1 parag').to.equal(1)
//     })
//     it("toutes les données des panneaux ont dû être chargées", function(){
//       expect(panneauScenier.dataLoaded, 'le dataLoaded du panneau Scénier devrait être true').to.be.true
//       expect(panneauManuscrit.dataLoaded, 'le dataLoaded du panneau Manuscrit devrait être true').to.be.true
//       expect(panneauSynopsis.dataLoaded, 'le dataLoaded du panneau Synopsis devrait être true').to.be.true
//       expect(panneauTreatment.dataLoaded, 'le dataLoaded du panneau Traitement devrait être true').to.be.true
//     })
//     it("aucun des panneaux n'a dû être chargé", function(){
//       expect(panneauScenier.loaded, 'le loaded du panneau Scénier devrait être false').to.be.false
//       expect(panneauManuscrit.loaded, 'le loaded du panneau Manuscrit devrait être false').to.be.false
//       expect(panneauSynopsis.loaded, 'le loaded du panneau Synopsis devrait être false').to.be.false
//       expect(panneauTreatment.loaded, 'le loaded du panneau Traitement devrait être false').to.be.false
//     })
//   });
})
