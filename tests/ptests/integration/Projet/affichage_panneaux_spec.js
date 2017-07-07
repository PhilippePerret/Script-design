/*
  Test de l'affichage des panneaux à l'aide du tabulator "boutons-panneaux"
*/
PTests.expose_dom_methods()


describe("Affichage des panneaux",[
  , describe("le tabulator #boutons-panneaux", [
    , it("répond au focus", ()=>{
      let tabulator = DOM.get('tabulator#boutons-panneaux')
      expect('tabulator#boutons-panneaux').asNode.to.exist

      // On focus après 4 secondes
      let timer = setTimeout(()=>{
        console.log("Je focus sur le tabulator")
        clearTimeout(timer)
        tabulator.focus()
      }, 4000)

      waitForVisible('button[data-tab="notes"]').then( () => {
        puts( "Le menu est ouvert, yes!")
        console.log( "Le menu est ouvert, yes!")
      }).else( () => {
        puts( "Je n'ai pas pu faire le truc…")
        console.log( "Je n'ai pas pu faire le truc…")
      })
    })
  ])
])
