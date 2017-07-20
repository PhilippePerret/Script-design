/*

Test de la création d'un paragraphe

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))

let newP, pid

describe("Pour savoir si la méthode Parag#index fonctionne",[
  , it("retourne l'index du paragraphe", ()=>{
    resetAll()
    panneau.parags.add([parag1,parag2,parag3,parag4,parag5])
    expect(parag1.index,'parag1.index').to.equal(0)
    expect(parag2.index,'parag2.index').to.equal(1)
    expect(parag3.index,'parag3.index').to.equal(2)
    expect(parag4.index,'parag4.index').to.equal(3)
    panneau.parags.moveBefore(4,1)
    expect(parag4.index,'parag4.index').to.equal(0)
    expect(parag1.index,'parag1.index').to.equal(1)
    expect(parag2.index,'parag2.index').to.equal(2)
  })
])
describe("Création d'un nouveau paragraphe",[
  , context("sans sélection",[
    , it("crée le paragraphe à la fin du panneau", ()=>{
      resetAll()
      panneau.parags.add([parag1,parag2,parag3,parag4,parag5])
      expect(panneau.container).to.not.have_tag('div',{id:'p-20'})
      // =======> TESTS <==========
      let newP = panneau.parags.create()
      // ====== VÉRIFICATION ========
      let pid = newP.id
      expect(panneau.container).to.have_tag('div',{id:`p-${pid}`})
      expect(panneau.container).to.have_tag('div',{id:`p-${pid}-contents`, 'contenteditable':'true'})
      expect(parag5.next.id,'parag5.next.id').to.equal(pid)
    })
  ])
  , context("avec une sélection",[
    , it("le paragraphe est créé après la sélection", ()=>{
      resetAll()
      panneau.parags.add([parag1,parag2,parag3,parag4,parag5])
      expect(panneau.container).to.not.have_tag('div',{id:'p-20'}, {only_on_fail:true})
      panneau.parags.select(parag2)
      expect(panneau.container).to.have_tag('div',{id:'p-2', class:['p','selected']}, {only_on_fail:true})
      expect(panneau.parags.count,'panneau.parags.count').to.equal(5)
      // =======> TESTS <==========
      newP = panneau.parags.create()
      // ===== VÉRIFICATION =======
      pid = newP.id
      // puts(panneau.container.inspect())
      expect(panneau.container).to.have_tag('div',{id:`p-${pid}`})
      expect(panneau.container).to.have_tag('div',{id:`p-${pid}-contents`, 'contenteditable':'true'})
      expect(parag2.next.id,'parag2.next.id').to.equal(pid)
    })
    , it("il y a bien une instance créée pour ce parag", ()=>{
      parag20 = panneau.parags._dict[pid]
      expect(parag20.id).to.equal(pid)
      expect(parag20).to.be.classOf('parag')
    })
    , it("le paragraphe est créé à la bonne place dans _items", ()=>{
      expect(panneau.parags._items[2].id).to.equal(pid)
    })
    , it("le parag est créé à la bonne place dans _ids", ()=>{
      expect(panneau.parags._ids[2]).to.equal(pid)
    })
    , it("le nombre de parags du panneau a augmenté d'un", ()=>{
      expect(panneau.parags.count,'panneau.parags.count').to.equal(6)
    })
  ])
])
