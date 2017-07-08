/*
  Test de l'affichage des panneaux à l'aide du tabulator "boutons-panneaux"
*/

PTests.expose_dom_methods()

describe("Affichage des panneaux",[
  , describe("le tabulator #boutons-panneaux", [
    , it("répond au focus", ()=>{
      let tabulator = DOM.get('tabulator#boutons-panneaux')
      expect('tabulator#boutons-panneaux').asNode.to.exist
      waitForTrue( ()=>{return Tabulator.instanceFrom(tabulator).ready}, {timeout:10} )
        .else( () => {
          console.log("Le tabulator N'est PAS ready, je dois renoncer")
        })
        .then( ()=>{
          // Le tabulateur est prêt, je peux focusser dedanst et attendre que
          // le bouton soit prêt
          EV.focusIn(tabulator)
          waitForVisible('button[data-tab="notes"]')
            .then( () => {
              // On passe par ici lorsque le tabulator est ouvert. On va
              // activer les touches claviers pour sélectionner les éléments
              KB.press('f', {target: tabulator})
              KB.press('Enter', {target: tabulator})
              waitForVisible('section#panneau-scenier')
                .then( () => {
                  expect('section#panneau-scenier').asNode.to.exist
                })
            })
        })
    })
  ])
])
