/*

  On test l'interface
  
*/

describe("L'interface",[
  , describe("pour les données du projet",[
    , it("contient la section data", ()=>{
      expect('section#panneau-data').asNode.to.exist
    })
  ])
  , describe("pour le synopsis du projet",[
    , it("contient la section panneau-synopsis", ()=>{
      expect('section#panneau-synopsis').asNode.to.exist
    })
  ])
  , describe("pour le résumé du projet",[
    , it("contient la section panneau-resume", ()=>{
      expect('section#panneau-resume').asNode.to.exist
    })
  ])
])
