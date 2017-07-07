/*
  Test de l'affichage des panneaux à l'aide du tabulator "boutons-panneaux"
*/

PTests.expose_dom_methods()


describe("Affichage des panneaux",[
  , describe("le tabulator #boutons-panneaux", [
    , it("répond au focus", ()=>{
      let tabulator = DOM.get('tabulator#boutons-panneaux')
      expect('tabulator#boutons-panneaux').asNode.to.exist

      // On focusse sur le tabulator pour l'ouvrir
      tabulator.focus()

      // Pour tester l'asynchronicité
      // -----------------------------
      // Note : il faut ex-commenter la ligne tabulator.focus() ci-dessus
      // pour que ça fonctionne
      // // On focus après 4 secondes
      // let timer = setTimeout(()=>{
      //   console.log("Je focus sur le tabulator")
      //   clearTimeout(timer)
      //   tabulator.focus()
      // }, 4000)

      waitForVisible('button[data-tab="notes"]').then( () => {

        // On passe par ici lorsque le tabulator est ouvert. On va
        // activer les touches claviers pour sélectionner les éléments
        robot.typeString('j')
        robot.keyTap('enter')

        waitForVisible('section#panneau-scenier')

      }).else( () => {
        puts( "Je n'ai pas pu faire le truc…")
        console.log( "Je n'ai pas pu faire le truc…")
      })
    })
  ])
])
