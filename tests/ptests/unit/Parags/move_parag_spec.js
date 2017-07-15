/*

Test de la création d'un paragraphe

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))

const oof = {only_on_fail: true}


describe("Déplacement d'un paragraphe existant avec Parags#moveCurrentUp",[
  , describe("de un paragraphe en un paragraphe",[
    , context("s'il y a des paragraphes au-dessus",[
      , it("il se déplace en haut avec la touche UP", ()=>{
        resetAll()
        panneau.parags.add([parag1,parag2,parag3,parag4,parag5,parag6,parag7])
        expect(panneau.parags.count).to.equal(7, oof)
        panneau.parags.select(parag3)
        expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(3,oof)
        expect(parag3.index,'parag3.index').to.equal(2, oof)
        expect(parag3.previous.id,'parag3.previous.id').to.equal(2)
        expect(parag3.next.id,'parag3.next.id').to.equal(4)
        // =======> TEST <==========
        panneau.parags.moveCurrentUp({shiftKey:false})
        // ======== VÉRIFICATION =========
        expect(parag3.index,'parag3.index').to.equal(1, oof)
        expect(parag3.previous.id,'parag3.previous.id').to.equal(1)
        expect(parag3.next.id,'parag3.next.id').to.equal(2)
        expect(panneau.parags._items[2].id,'le nouveau 3e élément dans _items').to.equal(2)
        expect(panneau.parags._ids[2],'le nouveau 3e élément dans _ids').to.equal(2)
        expect(panneau.parags._items[1].id,'le nouveau 2e élément dans _items').to.equal(3)
        expect(panneau.parags._ids[1],'le nouveau 2e élément dans _ids').to.equal(3)
      })
    ])
    , context("si c'est le premier paragraphe",[
      , it("il ne se déplace pas", ()=>{
        panneau.parags.select(parag1)
        expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(1,oof)
        expect(parag1.index,'parag1.index avant le déplacement').to.equal(0,oof)
        // ==========> TEST <=========
        panneau.parags.moveCurrentUp({shiftKey:false})
        // ====== VÉRIFICATION ===========
        expect(parag1.index,'parag1.index après le déplacement').to.equal(0)
        expect(panneau.parags._ids[0],'parags._ids[0]').to.equal(1)
        expect(panneau.parags._items[0].id,'parags._items[0].id').to.equal(1)
      })
    ])


    , context("s'il y a des paragraphes après le sélectionné",[
      , it("il se déplace en bas avec la touche DOWN avec Parags#moveCurrentDown", ()=>{
        resetAll()
        panneau.parags.add([parag1,parag2,parag3,parag4,parag5,parag6,parag7])
        expect(panneau.parags.count).to.equal(7, oof)
        panneau.parags.select(parag5)
        expect(parag5.index).to.equal(4, oof)
        expect(panneau.parags._ids[4]).to.equal(5,oof)
        expect(panneau.parags._items[4].id).to.equal(5,oof)
        // ====> TEST <=====
        panneau.parags.moveCurrentDown({shiftKey:false})
        // ========= VÉRIFICATIONS =========
        expect(parag5.index,'parag5.index après le déplacement').to.equal(5)
        expect(panneau.parags._items[5].id,'parags._items[5].id').to.equal(5)
        expect(panneau.parags._ids.indexOf(5)).to.equal(5)
        expect(panneau.parags._ids[4],'le nouvel élément à l’index 4 dans _ids').to.equal(6)
        expect(panneau.parags._items[4].id,'le nouvel élément à l’index 4 dans _items').to.equal(6)
      })
      , it("se déplace plusieurs fois si l'on clique plusieurs fois", ()=>{
        resetAll()
        panneau.parags.add([parag1,parag2,parag3,parag4,parag5,parag6,parag7])
        panneau.parags.select(parag2)
        // ====> TEST <=====
        panneau.parags.moveCurrentDown({shiftKey:false})
        panneau.parags.moveCurrentDown({shiftKey:false})
        panneau.parags.moveCurrentDown({shiftKey:false})
        // ========= VÉRIFICATIONS =========
        // Doit être = 1, 3, 4, 5, 2, 6, 7
        expect(parag2.index,'parag2.index après le déplacement').to.equal(4)
        expect(panneau.parags._ids,'parags._ids après déplacement').to.equal([1,3,4,5,2,6,7])
        expect(panneau.parags._items[4].id,'parags._items[4].id').to.equal(2)
      })
    ])
    , context("si c'est le dernier paragraphe",[
      , it("ne le déplace pas", ()=>{
        panneau.parags.select(parag7)
        expect(parag7.index,'parag7.index avant le déplacement').to.equal(6,oof)
        expect(panneau.parags._ids[6]).to.equal(7,oof)
        // ====> TEST <=====
        panneau.parags.moveCurrentDown({shiftKey:false})
        // ========= VÉRIFICATIONS =========
        expect(parag7.index,'parag7.index après le déplacement').to.equal(6)
        expect(panneau.parags._ids[6],'parags._ids[6] après le déplacement').to.equal(7)
        expect(panneau.parags._items[6].id,'parags._items[6].id après le déplacement').to.equal(7)
      })
    ])
  ])
  , describe("de 5 parags en 5 parags",[
    , context("avec suffisamment de paragraphes au-dessus",[
      , it("il se déplace 5 au-dessus avec la touche UP", ()=>{
        pending()
      })
    ])
    , context("avec pas suffisamment de paragragrphes au-dessus",[
      , it("il arrive au début s'il n'y a pas assez de paragragphes", ()=>{
        pending()
      })
    ])
    , context("avec suffisamment de paragragphes en dessous",[
      , it("il se déplace 5 en dessous avec la touche DOWN", ()=>{
        pending()
      })
    ])
    , context("avec un nombre insuffisant de paragraphes",[
      , it("il se déplace tout en bas", ()=>{
        pending()
      })
    ])
  ])
])
