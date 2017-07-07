/*

  On test l'interface

*/

describe("L'interface contient",[
  , describe("des panneaux ",[
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
    , describe("pour les personnages du projet",[
      , it("contient la section panneau-personnages", ()=>{
        expect('section#panneau-personnages').asNode.to.exist
      })
    ])
    , describe("pour le traitement du projet",[
      , it("contient la section panneau-treatment", ()=>{
        expect('section#panneau-treatment').asNode.to.exist
      })
    ])
    , describe("pour le manuscrit ou le script du projet",[
      , it("contient la section panneau-manuscrit", ()=>{
        expect('section#panneau-manuscrit').asNode.to.exist
      })
    ])
    , describe("pour le scénier du projet",[
      , it("contient la section panneau-scenier", ()=>{
        expect('section#panneau-scenier').asNode.to.exist
      })
    ])
    , describe("pour les notes du projet",[
      , it("contient la section panneau-notes", ()=>{
        expect('section#panneau-notes').asNode.to.exist
      })
    ])
  ])

  , describe("des tabulators",[

    , describe("pour le choix des panneau",[
      , it("contient le tabulator#boutons-panneaux", ()=>{
        expect('tabulator#boutons-panneaux').asNode.to.exist
      })
      , it("contient chaque bouton panneau", ()=>{
        expect('tabulator#boutons-panneaux')
          .to.have_tag('button',{'data-tab':'data'})
          .and.have_tag('button',{'data-tab':'personnages'})
          .and.have_tag('button',{'data-tab':'scenier'})
          .and.have_tag('button',{'data-tab':'synopsis'})
          .and.have_tag('button',{'data-tab':'manuscrit'})
          .and.have_tag('button',{'data-tab':'treatment'})
          .and.have_tag('button',{'data-tab':'notes'})
      })
    ])

    , describe("pour les opérations courantes",[
      , it("contient le tabulator#operations", ()=>{
        expect('tabulator#operations').asNode.to.exist
      })
      , it("contient les opérations voulues", ()=>{

      })
    ])
  ])
])
