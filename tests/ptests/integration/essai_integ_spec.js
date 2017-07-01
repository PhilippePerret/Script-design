/*
  Pour essayer les tests d'intégration dans l'application elle-même

 */
PTests.expose_dom_methods()


describe("Un essai de test",[
  context("dans le contexte de la page Projets",[
    it("peut tester cette page", () => {
      expect('footer').asNodeId.not.to.exist
      expect('footer').asNodeClass.to.exist
      expect('footer').asNodeClass.to.not.have.attributes({'pour':'voir'})
    })
  ])
])

, describe("La section du formulaire du film",[
  , it("contient un champ pour entrer le titre", ()=>{
    expect('projet_titre').asNode.to.exist
  })
  , it("permet d'entre le titre du projet", ()=>{
    let monTitre = `Titre du film ${String(new Date())}`
    DOM.get('projet_titre').value = monTitre
    expect('projet_titre').asNode.to.have.value(monTitre)
  })
])
