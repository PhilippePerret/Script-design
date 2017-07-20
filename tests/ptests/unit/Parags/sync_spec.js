/*

  Tests pseudo-unitaire ou pseudo-intégration pour tester la synchronisation
  d'un paragraphe.
  Noter que ce test vaut aussi pour l'autosync qui ne fait qu'appeler
  automatiquement la méthode Parag#sync

  Cette feuille de test, peut-être, ne servira qu'à vérifier que
  les paragraphes soient ajoutés au bon endroit.

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}


// Méthode qui met artificiellement la donnée +data+ dans les
// data_relatives.relatives du projet.
function setDataRelatives (data)
{
  projet.relatives._data || ( projet.relatives._data = {relatives: {}})
  projet.relatives._data.relatives = data
}

// Méthode ajoutant les paragraphes de +data+ dans les panneaux voulus.
// @param data :
//      <lettre panneau> : [<liste des ID de paragraphes>]
//      <lettre panneau> : [<liste des ID de paragraphes>]
//      etc.
function setItemsOfPanneaux(data)
{
  for(let p in data){
    let pan_name  = Projet.PANNEAUX_DATA[p] // p => personnages
    let panneau   = projet.panneau(pan_name)
    panneau.parags.reset()
    panneau.parags.add( data[p] )
  }
}


// ['personnages','notes','synopsis','scenier','treatment','manuscrit']
describe("Parag",[
  , describe("Fonctionnement de la méthode setDataRelatives (définition des relatives pour les tests)",[
    , it("définit à la volée les relatives des paragraphes", ()=>{
      setDataRelatives({'1':{'pour':'voir'}})
      expect(parag1.data_relatives,'parag1.data_relatives après première définition').to.equal({'pour':'voir'})
      setDataRelatives({'1':{'autre':'valeur'}})
      expect(parag1.data_relatives,'parag1.data_relatives après seconde définition').to.equal({'autre':'valeur'})
    })
  ])
  , describe("Méthode #sync",[
    , it("répond", ()=>{
      expect(parag1).asInstanceOf(Parag).to.respond_to('sync')
    })
    , context("avec un nouveau paragraphe dans un panneau sans paragraphe",[
      , it("ajoute les nouveaux paragraphes à la fin de chaque panneau", ()=>{
        resetAllPanneaux()
        // === PRÉ-VÉRIFCATIONS ===
        expect(parag0,'parag0').to.be.classOf('parag', oof)
        expect(parag1,'parag1').to.be.classOf('parag', oof)
        expect(parag39,'parag39').to.be.classOf('parag', oof)
        // Il n'y a aucun paragraphe dans aucun panneau
        expect(panneauNotes.parags.count, 'panneauNotes.parags.count').to.equal(0,oof)
        expect(panneauScenier.parags.count, 'panneauScenier.parags.count').to.equal(0,oof)
        expect(panneauManuscrit.parags.count, 'panneauManuscrit.parags.count').to.equal(0,oof)
        expect(panneauSynopsis.parags.count, 'panneauSynopsis.parags.count').to.equal(0,oof)
        expect(panneauPersonnages.parags.count, 'panneauPersonnages.parags.count').to.equal(0,oof)
        // On s'assure que la synchro-automatique n'est pas enclenchée
        projet.option('autosync', 0)
        // On ajoute un paragraphe au panneau Note
        parag0.contents = "Premier paragraphe ajouté au panneau Notes"
        panneauNotes.parags.add(parag12) // ça l'ajoute aussi aux relatives
        expect(panneauNotes.parags.count, 'panneauNotes.parags.count').to.equal(1,oof)
        // ======> TEST <=======
        parag12.sync()
        // ======= VÉRIFICATIONS ====
        let firstParag, pan_letter
        let rels = projet.relatives.all
        // puts(`projet.relatives.all = ${JSON.stringify(projet.relatives.all)}`)
        Projet.PANNEAUX_SYNC.forEach( (pan_id) => {
          if ( pan_id === 'notes' ) { return }

          expect(projet.panneau(pan_id).parags.count,`le nombre de parags du panneau '${pan_id}'`).to.equal(1)

          firstParag = projet.panneau(pan_id).parags.items[0]
          expect(firstParag,`premier parag du panneau '${pan_id}'`).to.be.classOf('parag')
          // Pour vérification, il ne doit pas avoir l'identifiant 0
          expect(firstParag.id,'firstParag.id').not.to.equal(0)

          expect(firstParag.contents,`Le contenu du parag du panneau '${pan_id}'`).to.contains('PARAG#12')

          pan_letter = Projet.PANNEAUX_DATA[pan_id].oneLetter
          // puts(`rels['12']['r'][${pan_letter}] = ${JSON.stringify(rels['12']['r'][pan_letter])}`)

          expect(rels['12']['r'][pan_letter], 'les relatifs du parag 12').to.contains(firstParag.id)

          expect(rels[firstParag.id]['r']['n'],'les relatifs notes du nouveau parag').to.contains(12)

        }) // fin de boucle sur tous les panneaux synchronisables

        // Aucun parag ne doit avoir été créé dans les panneaux non synchronisable
        expect(panneauPersonnages.parags.count,'panneauPersonnages.parags.count').to.equal(0)
        expect(panneauData.parags.count,'panneauData.parags.count').to.equal(0)

      })
    ])
    , context("avec des parags avant le nouveau parag mais pas après",[
      , it("ajoute le paragraphe à la fin des panneaux", ()=>{
        resetAllPanneaux()
        // On ajoute un paragraphe au panneau Note
        parag24.contents = "Premier paragraphe ajouté au panneau Scénier"
        panneauScenier.parags.add(parag24) // ça l'ajoute aussi aux relatives
        expect(panneauScenier.parags.count, 'panneauScenier.parags.count').to.equal(1,oof)
        panneauScenier.parags.add([parag0, parag1, parag2])
        expect(panneauScenier.parags.count, 'panneauScenier.parags.count').to.equal(4,oof)
        expect(parag24.index).to.equal(0,oof)
        // On ajoute des paragraphes aux autres panneaux
        panneauNotes.parags.add([parag3, parag4])
        expect(panneauNotes.parags.count).to.equal(2,oof)
        panneauTreatment.parags.add([parag5, parag6, parag7, parag8])
        expect(panneauTreatment.parags.count).to.equal(4,oof)
        // ======> TEST <=======
        parag24.sync()
        // ======= VÉRIFICATIONS ====
        let firstParag, pan_letter
        let rels = projet.relatives.all
        let nombre_expected
        // puts(`projet.relatives.all = ${JSON.stringify(projet.relatives.all)}`)
        Projet.PANNEAUX_SYNC.forEach( (pan_id) => {
          if ( pan_id === 'scenier' ) { return }

          // Les valeurs en fonction des panneaux
          switch(pan_id)
          {
            case 'notes':
              nombre_expected = 3
              break
            case 'treatment':
              nombre_expected = 5
              break
            default:
              nombre_expected = 1
          }

          expect(projet.panneau(pan_id).parags.count,`le nombre de parags du panneau '${pan_id}'`).to.equal(nombre_expected)

          lastParag = projet.panneau(pan_id).parags.items[nombre_expected-1]
          expect(lastParag,`dernier parag du panneau '${pan_id}'`).to.be.classOf('parag')

          expect(lastParag.id,'lastParag.id').not.to.equal(0) // précaution

          expect(lastParag.contents,`Le contenu du dernier parag du panneau '${pan_id}'`).to.contains('PARAG#24')

          pan_letter = Projet.PANNEAUX_DATA[pan_id].oneLetter

          expect(rels['24']['r'][pan_letter], 'les relatifs du parag 24').to.contains(lastParag.id)

          expect(rels[lastParag.id]['r']['s'],'les relatifs scénier du nouveau parag').to.contains(24)

        }) // fin de boucle sur tous les panneaux synchronisables

        // Aucun parag ne doit avoir été créé dans les panneaux non synchronisable
        expect(panneauPersonnages.parags.count,'le nombre de parags du panneau non synchronisable "Personnages"').to.equal(0)
        expect(panneauData.parags.count,'le nombre de parags du panneau non synchronisable "data"').to.equal(0)

      })
    ])
    , context("avec le paragraphe juste après synchronisé",[
      , it("place le nouveau parag juste avant", ()=>{
        resetAllPanneaux()
        projet.option('autosync', 0)
        panneauScenier.parags.add([parag0, parag1, parag3, parag2])
        panneauNotes.parags.add([parag8, parag9, parag10, parag11])
        panneauManuscrit.parags.add([parag20])
        // On doit synchroniser le parag2 et le parag10 et parag20
        projet.relatives.associate([parag2, parag10, parag20])
        expect(projet.relatives.areRelatifs(parag2, parag10)).to.equal(true, oof)
        expect(projet.relatives.areRelatifs(parag2, parag20)).to.equal(true, oof)
        // Les deux panneaux restant ne doivent pas avoir de parags
        expect(panneauSynopsis.parags.count).to.equal(0,oof)
        expect(panneauTreatment.parags.count).to.equal(0,oof)
        // Les modifications qui seront vérifiées ensuite
        expect(panneauNotes.parags.items[2].id).to.equal(10)
        expect(panneauManuscrit.parags.items[0].id).to.be.equal(20)

        // =========> TEST <============
        parag3.sync()

        // ========== VÉRIFICATIONS ========

        // Un nouveau paragraphe doit avoir été ajouté au panneau Notes, avant
        // le paragraphe 10
        expect(panneauNotes.parags.count).to.equal(5, oof)
        expect(panneauNotes.parags.items[2].id).to.be.greater_than(39)
        expect(panneauNotes.parags.items[3].id).to.equal(10)
        // Un nouveau paragraphe doit avoir été ajouté au panneau Manuscrit,
        // avant le parag20 donc au début
        expect(panneauManuscrit.parags.count).to.equal(2, oof)
        expect(panneauManuscrit.parags.items[0].id).not.to.be.equal(20)
        expect(panneauManuscrit.parags.items[0].id).to.be.greater_than(39)
        // Le nouveau paragraphe doit avoir été ajouté à la fin des autres
        // panneau
        expect(panneauSynopsis.parags.count).to.equal(1,oof)
        expect(panneauTreatment.parags.count).to.equal(1,oof)

      })
    ])
    , context("avec un paragraphe juste avant synchronisé",[
      , it("place le nouveau parag synchronisé juste après", ()=>{
        resetAllPanneaux()
        projet.option('autosync', 0)

        panneauNotes.parags.add([parag4, parag3, parag2, parag1, parag0])
        // On va synchroniser le PARAG2, c'est donc le parag3 qui doit être
        // associé avec des paragraphes d'autres panneaux
        panneauScenier.parags.add([parag9, parag8, parag7, parag6])
        // C'est le parag8 qui est associé au parag3, donc le nouveau parag
        // doit être ajouté après
        panneauTreatment.parags.add([parag30, parag29, parag28, parag27, parag26])
        // Les parags de 27 à 30 sont associé à parag3, donc le nouveau parg
        // doit être ajouté après le parag27

        projet.relatives.associate([parag3, parag8, parag29, parag30, parag27,parag28])

        // AVANT
        expect(panneauScenier.parags.items[2].id).to.equal(7,oof)
        expect(panneauTreatment.parags.items[4].id).to.equal(26,oof)
        expect(projet.relatives.areRelatifs(3,8)).to.equal(true,oof)

        // ========> TEST <===========
        parag2.sync()
        // ======== VÉRIFICATIONS ========

        // APRÈS
        // * Synchronisé avec un paragraphe d'un autre panneau, le nouveau
        //   est placé après
        expect(panneauScenier.parags.items[2].id).to.be.greater_than(39)
        expect(panneauScenier.parags.items[3].id).to.equal(7,oof)
        // * Synchronisé avec plusieurs paragraphes d'un même panneau,
        // le nouveau parag est ajouté juste après
        expect(panneauTreatment.parags.items[4].id).to.be.greater_than(39)
        expect(panneauTreatment.parags.items[5].id).to.equal(26,oof)
        expect(panneauSynopsis.parags.count).to.equal(1,oof)
        expect(panneauSynopsis.parags.items[0].id).to.be.greater_than(39,oof)

      })
    ])
    , context("avec un paragraphe déjà synchronisé dans tous les panneaux",[
      , it("ne produit aucun changement", () => {
        resetAllPanneaux()
        projet.option('autosync', 0)
        panneauNotes.parags.add([parag1, parag2, parag3])
        panneauScenier.parags.add([parag11, parag22, parag33])
        panneauSynopsis.parags.add([parag7, parag8, parag9])
        panneauTreatment.parags.add([parag30, parag31, parag32, parag33, parag34])
        panneauManuscrit.parags.add([parag20, parag22, parag24])
        let nombres = {
            'notes'     : 3
          , 'scenier'   : 3
          , 'synopsis'  : 3
          , 'treatment' : 5
          , 'manuscrit' : 3
        }
        for(let panid in nombres ){
          expect(projet.panneau(panid).parags.count).to.equal(nombres[panid],oof)
        }

        // On associe le paragraphe 2 à un paragraphe de chaque panneau
        projet.relatives.associate([parag2, parag11, parag9, parag31, parag20])

        // =========> TEST <=========
        parag2.sync()
        // ======== VÉRIFICATIONS ===========
        // Aucun paragraphe ne doit avoir été créé dans aucun panneau
        for(let panid in nombres ){
          expect(projet.panneau(panid).parags.count, `nombre de parags dans projet.panneau(${panid})`).to.equal(nombres[panid])
        }

      })
    ])
  ])
])
