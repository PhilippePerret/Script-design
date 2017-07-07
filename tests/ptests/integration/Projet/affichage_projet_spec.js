PTests.expose_dom_methods()

// On récupère les données du projet actuel dans le JS et on ne commencera
// le test que lorsqu'on aura pu les avoir

let timer = setInterval( () => {
  if (Projet.current){
    clearInterval(timer)
    puts("Le projet est chargé.")

    describe("Affichage des données du projet",[
      , describe("l'affichage contient",[
        , it("le titre du projet dans #projet_titre", ()=>{
          expect('title').asNode.to.exist
          expect('div#title').asNode.to.exist
        })
      ])
    ])



  }else{
    puts("Attente pour le chargement du projet…")
  }

}, 200)
