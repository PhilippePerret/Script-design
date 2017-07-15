/*

Test de la destruction d'un paragraphe

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))

const oof = {only_on_fail: true}

describe("Destruction d'un paragraphe",[
  , context("avec un paragraphe existant",[
    , it("connait les méthodes #remove, #removeCurrent et #unRemove", ()=>{
      expect(typeof panneau.parags.remove,'typeof panneau.parags.remove').to.equal('function')
      expect(typeof panneau.parags.removeCurrent,'typeof panneau.parags.removeCurrent').to.equal('function')
      expect(typeof panneau.parags.unRemove,'typeof panneau.parags.unRemove').to.equal('function')
    })
    , describe("#remove",[
      , it("détruit le paragraphe spécifié dans le DOM", ()=>{
        resetAll()
        panneau.parags.add([parag2, parag10, parag4, parag6])
        expect(panneau.parags._ids).to.equal([2,10,4,6], oof)
        expect(panneau.container,'panneau.container').to.have_tag('div',{id:'p-10'},oof)
        expect(panneau.parags._items.length).to.equal(4)
        expect(panneau.parags._items[1].id,'parags._items[1].id').to.equal(10,oof)
        // ====> TEST <=====
        panneau.parags.remove(parag10)
        // ==== VÉRIFICATIONS
        expect(panneau.container,'panneau.container').not.to.have_tag('div',{id:'p-10'})
      })
      , it("décrémente le count de paragraphes", ()=>{
        expect(panneau.parags.count,'parags.count').to.equal(3)
      })
      , it("retire le paragraphe de parags._ids", ()=>{
        // puts(`panneau.parags._ids = ${panneau.parags._ids.join(', ')}`)
        expect(panneau.parags._ids,'parags._ids').to.equal([2,4,6], oof)
      })
      , it("retire le paragraphe de parags._items", ()=>{
        expect(panneau.parags._items.length,'parags._items.length').to.equal(3)
        expect(panneau.parags._items[1].id,'parags._items[1].id').to.equal(4)
      })
      , it("retire le paragraphe de parags._dict", () => {
        expect(panneau.parags._dict[10],'panneau.parags._dict[10]').to.equal(undefined)
      })
      , it("retire le paragraphe des relations qu'il entretient", ()=>{
        console.log(projet.relatives)
        pending()
      })
    ])
    , describe("#removeCurrent",[
      , context("sans sélection courante",[
        , it("ne détruit rien du tout", ()=>{
          resetAll()
          panneau.parags.add([parag2, parag10, parag4, parag6])
          expect(panneau.parags._ids).to.equal([2,10,4,6], oof)
          expect(panneau.container,'').to.have_tag('div',{class:'p', count:4}, oof)
          expect(panneau.parags.count,'parags.count').to.equal(4)
          // ======> TEST <=======
          panneau.parags.removeCurrent()
          // ====== VÉRIFICATION ========
          expect(panneau.container,'').to.have_tag('div',{class:'p', count:4})
          expect(panneau.parags._ids,'parags._ids').to.equal([2,10,4,6])
          expect(panneau.parags._items.length,'parags._items.length').to.equal(4)
          expect(panneau.parags.count,'parags.count').to.equal(4)
        })
      ])
      , context("avec une sélection courante",[
        , it("détruit le paragraphe courant dans le DOM", ()=>{
          resetAll()
          panneau.parags.add([parag2, parag10, parag4, parag6])
          expect(panneau.parags._ids).to.equal([2,10,4,6], oof)
          panneau.parags.select(parag10)
          expect(panneau.parags.selection.current.id).to.equal(10,oof)
          expect(panneau.parags._items[1].id).to.equal(10,oof)
          // ====> TEST <=====
          panneau.parags.removeCurrent()
          // ====== VÉRIFICATION ========
          expect(panneau.container,'').to.have_tag('div',{class:'p', count:3})
          expect(panneau.parags.count,'parags.count').to.equal(3)
        })
        , it("retire le paragraphe courant de parags._ids", ()=>{
          expect(panneau.parags._ids,'parags._ids').to.equal([2,4,6])
        })
        , it("retire le paragraphe courant de parags._items", ()=>{
          expect(panneau.parags._items.length,'parags._items.length').to.equal(3)
          expect(panneau.parags._items[1].id, 'parags._items[1].id').to.equal(4)
        })
        , it("retire le paragraphe courant des relations qu'il entretient", ()=>{
          pending()
        })
      ])
    ])
  ])
  , context("avec un paragraphe inexistant",[
    , it("ne fait rien", ()=>{

    })
  ])
])

describe("Annulation de la destruction d'un paragraphe",[
  , describe("avec la combinaison CMD+Z",[
    , it("préparation", ()=>{
      // Note : ne pas mettre d'expectation à jouer ici, c'est juste la
      // préparation avec vérification.
      resetAll()
      panneau.parags.add([parag2, parag12, parag4, parag6])

      parag1  .panneau_id = 'notes'
      parag11 .panneau_id = 'manuscrit'

      projet.relatives.associate([parag4, parag1, parag10])
      console.log(parag4.relatifs)
      console.log(parag1.relatifs)
      console.log(parag10.relatifs)
    })
    , it("remet le paragraphe en place dans le DOM", ()=>{
      pending()
    })
    , it("remet le paragraphe dans parags._ids", ()=>{
      pending()
    })
    , it("remet le paragraphe dans parags._items", ()=>{
      pending()
    })
    , it("remet les relations avec les autres paragraphes", ()=>{
      pending()
    })
  ])
])
