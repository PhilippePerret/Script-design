/*

  Tests unitaire de l'instance `parags` des panneaux, qui permet de
  gérer ses pararaphes propres (en distinction des tous les paragraphes du
  projet).

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}


describe("les méthodes auxquelles répond le panneau",[
  , it("PanProjet#parags retourne une instance de Parags", ()=>{
    expect(panneau.parags).to.be.classOf('parags')
  })
])

describe("La propriété #parags du panneau",[
  , it("ne répond pas à #jenesuispasunemethode", ()=>{
    expect(panneau.parags).asInstanceOf(Parags).not.to.respond_to('jenesuispasunemethode')
  })

  // ==== TOUTES LES MÉTHODES DE PanPanneau#Parags ====

  , it("répond à toutes les méthodes", ()=>{
    [
      'reset', 'add', 'remove', 'select', 'deselect', 'deselectAll', 'setUnmodified',
      'moveBefore', 'selectPrevious', 'selectNext', 'getPrevious', 'getNext',
      'moveCurrentUp', 'moveCurrentDown',
      'hasCurrent', 'editCurrent'
    ].forEach( (m) => {
      expect(panneau.parags).asInstanceOf(Parags).to.respond_to(m)
    })
  })

  // ====== TOUTES LES PROPRIÉTÉS =======

  , it("possède toutes les propriétés requises", ()=>{
    ['count', 'as_data', 'items', 'first', 'last'].forEach( (p) => {
      expect(panneau.parags[p], `la propriété '${p}'`).not.to.be.strictly.equal(undefined, 'undefined')
    })
  })


  // Suppression de la marque modified pour les paragraphes
  , describe("Méthode #setUnmodified",[
    , it("marque tous les parags non modifiés", ()=>{
      panneau.parags.reset()
      let arr = [parag1, parag2, parag3, parag5, parag10]
      panneau.parags.add(arr)
      arr.forEach( p => p.setModified() )
      expect(panneau.parags.items[0].modified).to.equal(true, {only_on_fail: true})
      expect(panneau.parags.items[2].modified).to.equal(true, {only_on_fail: true})
      expect(panneau.parags.items[4].modified).to.equal(true, {only_on_fail: true})
      // ========> TEST <============
      panneau.parags.setUnmodified()
      // ====== VÉRIFICATION ======
      arr.forEach( (p) => {
        expect(p.modified, `modified de parag #${p.id}`).to.equal(false)
      })
    })
  ])
])


/** ---------------------------------------------------------------------
  *
  *   Étude des méthodes séparément
  *
*** --------------------------------------------------------------------- */


describe("La méthode #reset",[
  , it("partant d'une liste avec des items", ()=>{
    resetAll()
    panneau.parags.add([parag2, parag5, parag10])
    expect(panneau.parags.items.length, 'nombre d’items').to.equal(3, {only_if_fail:true})
    expect(panneau.parags.count, 'items.count').to.equal(3, {only_if_fail:true})
    expect(panneau.container, 'le panneau').to.have_tag('div', {class:'p', count:3}, {only_if_fail:true})

    // Une sélection
    panneau.parags.select(parag5)
    expect(panneau.parags.selection.count,'selection.count').to.equal(1)
    expect(parag5.selected,'parag5.selected').to.equal(true)
    expect(parag5.current,'parag5.current').to.equal(true)

    // ===> TEST <===
    panneau.parags.reset()

  })
  , it("met la liste items à []", ()=>{
    expect(panneau.parags.items).to.equal([])
  })
  , it("met le nombre de parags à 0", ()=>{
    expect(panneau.parags.count).to.equal(0)
  })
  , it("vide le container du panneau", ()=>{
    expect(panneau.container).not.to.have_tag('div', {class:'p'})
  })
  , it("ne possède plus de sélection", ()=>{
    expect(panneau.container,'panneau.container').not.to.have_tag('div', {class:['p','selected']})
    expect(panneau.parags.selection.count,'selection.count').to.equal(0)
  })
  , it("n'a plus de paragraphe courant", ()=>{
    expect(parag5.selected,'parag5.selected').to.equal(false)
    expect(parag5.current,'parag5.current').to.equal(false)
  })
])


// --- #items ---

describe("La propriété #items",[
  , it("permet de définir la liste des items", ()=>{
    resetAll()
    expect(panneau.container.innerHTML, 'le container du panneau').to.equal('', oof)
    expect(panneau.parags.count,'le nombre des items').to.equal(0, oof)
    panneau.parags.add([parag1, parag4, parag12])
    expect(panneau.parags.count,'le nombre des items').to.equal(3)
    expect(panneau.parags.items[2].id, 'l’ID du 3e item').to.equal(12)
  })
  , it("règle l'index de chaque élément en fonction de son rang dans le document", ()=>{
    resetAll()
    panneau.parags.add([parag12, parag2, parag4, parag1])
    expect(parag12.index, "l'index du premier élément").to.equal(0)
    expect(parag2.index, "l'index du 2e élément").to.equal(1)
    expect(parag4.index, "l'index du 3e élément").to.equal(2)
    expect(parag1.index, "l'index du 4e élément").to.equal(3)
  })
])


// --- #add ---

let nombre_parags
describe("Ajout d'un paragraphe avec #add",[
  , context("avec une seule donnée valide",[
    , it("ajoute le paragraphe à la liste des items", ()=>{
      resetAll()
      panneau.parags.add(parag1)
      panneau.parags.add(parag2)
      nombre_parags = 2
      panneau.parags.add(parag11)
      expect(panneau.parags.items[2].id).to.equal(11)
    })
    , it("ajoute le paragraphe au container du panneau", ()=>{
      expect(panneau.container).to.have_tag('div',{class:'p', id:'p-11'})
    })
    , it("actualise le count des parags", ()=>{
      expect(panneau.parags.count).to.equal(nombre_parags + 1)
    })
  ])
  , context("avec une liste de paragraphes",[
    , it("ajoute tous les paragraphes", ()=>{
      panneau.parags.reset()
      panneau.parags.add(parag3)
      panneau.parags.add(parag4)
      nombre_parags = 2
      expect(panneau.container).to.have_tag('div', {class:'p', count:2}, {only_if_fail:true})
      // ===> TEST <===
      panneau.parags.add([parag10, parag11, parag2])
    })
    , it("ajoute chaque paragraphe dans l'ordre dans _items", ()=>{
      expect(panneau.parags.items[2].id).to.equal(10)
      expect(panneau.parags.items[3].id).to.equal(11)
      expect(panneau.parags.items[4].id).to.equal(2)
    })
    , it("ajoute tous les paragraphes au panneau", ()=>{
      expect(panneau.container).to.have_tag('div', {class:'p', count:5})
    })
    , it("actualise le nombre de parags (count)", ()=>{
      expect(panneau.parags.count,'parags.count').to.equal(5)
    })
    , it("donne le bon index aux paragraphes ajoutés", ()=>{
      expect(parag10.index,'parag10.index').to.equal(2)
      expect(parag11.index,'parag11.index').to.equal(3)
      expect(parag2.index,'parag2.index').to.equal(4)
    })
  ])
  , context("avec des options",[
    , it("ne sélectionne rien si aucune option", ()=>{
      resetAll()
      panneau.parags.selection.setMultiple(true)
      panneau.parags.add(parag3)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'p',count:1})
      expect(panneau.parags.selection.count,'selection.count').to.equal(0)
      expect(panneau.container,'panneau.container').not.to.have_tag('div',{class:['p','selected']})
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{'contenteditable':"true", id:'p-3'})
    })
    , it("sélectionne le paragraphe (sans le mettre en courant) avec options.selected", ()=>{
      panneau.parags.add(parag5, {edited: false, selected: true, current: false})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'p',count:2})
      expect(panneau.parags.selection.count,'selection.count').to.equal(1)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:['p','selected'], count:1})
      expect(parag5.selected,'parag5.selected').to.be.true
      expect(parag5.current,'parag5.current').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{'contenteditable':"true", id:'p-5'})
    })
    , it("met le paragraphe en courant (toujours, quand il doit être sélectionné)", ()=>{
      panneau.parags.add(parag10, {edited: false, selected: true})
      expect(panneau.parags.selection.count,'selection.count').to.equal(2)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:['p','selected'], count:2})
      expect(parag5.selected,'parag5.selected').to.be.true
      expect(parag5.current,'parag5.current').to.be.false
      expect(parag10.selected,'parag10.selected').to.be.true
      expect(parag10.current,'parag5.current').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{'contenteditable':"true", id:'p-10'})
    })
    // , it("met le paragraphe en édition avec options.edited", ()=>{
    //   panneau.parags.add(parag2, {edited: true})
    //   expect(panneau.parags.selection.count,'selection.count').to.equal(3)
    //   expect(panneau.container,'panneau.container').to.have_tag('div',{'contenteditable':"true", id:'p-2-contents'})
    // })
  ])
  // ==== Les erreurs possibles ====
  , context("avec un paragraphe qui se trouve déjà dans le panneau",[
    , it("produit une erreur et n'ajoute pas le paragraphe", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag3])
      expect(panneau.parags.count, 'count').to.equal(3, oof)
      // =========> TEST <==========
      panneau.parags.add(parag2)
    })
    , it("n'ajoute pas deux fois l'item dans le panneau", ()=>{
      expect(panneau.container, 'panneau.container').to.have_tag('div',{id:'p-2', count:1})
      expect(panneau.container).not.to.have_tag('div',{id:'p-2', count:2})
    })
    , it("ne modifie pas le nombre de parags", ()=>{
      expect(panneau.parags.count,'count',{values:true}).to.equal(3)
    })
  ])
])


// --- #remove ---

describe("Destruction d'un parag avec #remove",[
  , context("avec un {Parag} en argument",[
    , it("supprime le parag dans la liste des items", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag3, parag4, parag5])
      expect(panneau.container).to.have_tag('div',{class:'p', count:5}, {only_if_fail:true})
      nombre_parags = panneau.parags.count

      // On vérifie quelques valeurs
      expect(panneau.parags.count, 'nombre de parags').to.equal(5, {only_if_fail:true})
      expect(panneau.container).to.have_tag('div', {id:'p-2'}, {only_on_fail: true})
      expect(parag1.next.id, 'ID du next de parag1').to.equal(2)
      expect(parag3.previous.id,'ID du previous du parag3').to.equal(2)

      // =====> TEST <======
      panneau.parags.remove(parag2)
    })
    , it("supprime le parag dans le conteneur du panneau", ()=>{
      expect(panneau.container,'panneau.container').not.to.have_tag('div', {id:'p-2'})
    })
    , it("actualise le count de parags", ()=>{
      expect(panneau.parags.count, 'parags.count').to.equal(nombre_parags - 1)
    })
    , it("actualise la donnée `next` du paragraphe précédent", ()=>{
      expect(parag1.next.id, 'l’ID du next de parag1').to.equal(3)
    })
    , it("actualise la donnée `previous` du paragraphe suivant ()", ()=>{
      expect(parag3.previous.id, 'l’ID du previous de parag3').to.equal(1)
    })
  ])


  , context("avec un {Number} en argument (ID du paragraphe)",[
    , it("supprime le parag dans la liste des items", ()=>{
      nombre_parags = panneau.parags.count
      // =====> TEST <======
      panneau.parags.remove(4)
    })
    , it("supprime le parag dans le conteneur du panneau", ()=>{
      expect(panneau.container).not.to.have_tag('p',{id:'p-4'})
    })
    , it("actualise le count de parags", ()=>{
      expect(panneau.parags.count).to.equal(nombre_parags - 1)
    })
  ])


  , context("avec une liste de paragraphes",[
    , it("supprimer tous les paragraphes fournis en arguments", ()=>{
      panneau.parags.reset()
      arr = [parag2, parag4, parag6, parag10]
      panneau.parags.add(arr)
      expect(panneau.container).to.have_tag('div',{id: 'p-4'})
      expect(panneau.container).to.have_tag('div',{id: 'p-6'})
      // ====> TEST <====
      panneau.parags.remove([4,6])
      // ====== VÉRIFICATION ======
      expect(panneau.parags.items[4]).to.be.undefined
      expect(panneau.parags.items[6]).to.be.undefined
      expect(panneau.container).not.to.have_tag('div',{id: 'p-4'})
      expect(panneau.container).not.to.have_tag('div',{id: 'p-6'})
    })
  ])

  , context("avec une liste d'identifiant de paragraphes",[
    , it("supprime tous les paragraphes fournis en argument", ()=>{
      panneau.parags.reset()
      let arr = [parag5, parag10, parag11, parag12]
      panneau.parags.add(arr)
      expect(panneau.container).to.have_tag('div',{id:'p-5'}, {only_on_fail: true})
      expect(panneau.container).to.have_tag('div',{id:'p-10'}, {only_on_fail: true})
      expect(panneau.container).to.have_tag('div',{id:'p-11'}, {only_on_fail: true})
      expect(panneau.container).to.have_tag('div',{id:'p-12'}, {only_on_fail: true})
      // =========> TEST <===========
      panneau.parags.remove([10,11])
      // ========== VÉRIFICATION =========
      expect(panneau.container).to.have_tag('div',{id:'p-5'}, {only_on_fail: true})
      expect(panneau.container).not.to.have_tag('div',{id:'p-10'}, {only_on_fail: true})
      expect(panneau.container).not.to.have_tag('div',{id:'p-11'}, {only_on_fail: true})
      expect(panneau.container).to.have_tag('div',{id:'p-12'}, {only_on_fail: true})
      expect(panneau.parags.items[10]).strictly.equal(undefined)
      expect(panneau.parags.items[11]).strictly.equal(undefined)
    })
  ])
  , context("avec une liste mixte, identifiant et paragraphes",[
    , it("supprime tous les paragraphes fournis en argument", ()=>{
      panneau.parags.reset()
      let arr = [parag5, parag10, parag11, parag12]
      panneau.parags.add(arr)
      // =========> TEST <===========
      panneau.parags.remove([10, parag11])
      // ========== VÉRIFICATION =========
      expect(panneau.container).to.have_tag('div',{id:'p-5'}, {only_on_fail: true})
      expect(panneau.container).not.to.have_tag('div',{id:'p-10'}, {only_on_fail: true})
      expect(panneau.container).not.to.have_tag('div',{id:'p-11'}, {only_on_fail: true})
      expect(panneau.container).to.have_tag('div',{id:'p-12'}, {only_on_fail: true})
      expect(panneau.parags.items[10]).strictly.equal(undefined)
      expect(panneau.parags.items[11]).strictly.equal(undefined)
    })
  ])

  , context("avec un paragraphe sélectionné",[
    , it("le supprime de la sélection", ()=>{
      resetAll()
      panneau.parags.selection.setMultiple()
      let arr = [parag5, parag10, parag11, parag12]
      panneau.parags.add(arr)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'p', count:4})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'p', id:'p-11'})
      panneau.parags.select([parag10, parag11])
      expect(panneau.parags.selection.count,'selection.count').to.equal(2)
      expect(panneau.parags.selection._dict[11]).not.strictly.equal(undefined)
      // ========> TEST <=========
      panneau.parags.remove(parag11)
    })
    , it("le supprime du conteneur", ()=>{
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'p', id:'p-11'})
    })
    , it("le supprimer de la liste des items", ()=>{
      expect(panneau.parags.items[11]).strictly.equal(undefined)
    })
    , it("le supprime de la sélection", ()=>{
      expect(panneau.parags.selection._dict[11]).strictly.equal(undefined)
    })
  ])
])


// --- Parags#moveBefore


describe("Parags#moveBefore",[
  , context("avec l'ID du parag à déplacer et l'ID du parag avant lequel placer le parag",[
    , it("il déplace le parag avant le second argument", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag3, parag4])
      expect(getListeOfIds()).to.equal([1,2,3,4])
      panneau.parags.moveBefore(1,3)
      expect(getListeOfIds()).to.equal([2,1,3,4])
    })
  ])
  , context("avec l'ID du parag à déplacer à la fin, donc sans second argument",[
    , it("il déplace le parag à la fin", ()=>{
      expect(getListeOfIds()).to.equal([2,1,3,4])
      panneau.parags.moveBefore(2)
      expect(getListeOfIds()).to.equal([1,3,4,2])
    })
  ])
])

// --- Parags#first ---

describe("Parags#first",[
  , context("sans paragraphe dans le panneau",[
    , it("retourne null", ()=>{
      resetAll()
      expect(panneau.parags.first,'parags.first').to.strictly.equal(null)
    })
  ])
  , context("avec des parags dans le panneau",[
    , it("retourne le premier parag du panneau", ()=>{
      panneau.parags.add([parag3, parag10, parag2])
      expect(panneau.parags.first, 'parags.first').to.be.classOf('parag')
      expect(panneau.parags.first.id, 'parags.first.id').to.equal(3)
    })
  ])
  , context("après un déplacement",[
    , it("retourne le bon premier parag", ()=>{
      expect(panneau.parags.first.id, 'parags.first.id').to.equal(3)
      panneau.parags.moveBefore(3,2)
      expect(panneau.parags.first.id, 'parags.first.id').to.equal(10)
      panneau.parags.moveBefore(2,10)
      expect(panneau.parags.first.id, 'parags.first.id').to.equal(2)
    })
  ])
])

// --- Parags#last ---

describe("Parags#last",[
  , context("sans paragraphe dans le panneau",[
    , it("retourne null", ()=>{
      resetAll()
      expect(panneau.parags.last,'parags.last').to.strictly.equal(null)
    })
  ])
  , context("avec des parags dans le panneau",[
    , it("retourne le premier parag du panneau", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      expect(panneau.parags.last.id, 'parags.last.id').equal(12)
    })
  ])
  , context("après un déplacement",[
    , it("retourne le bon premier parag", ()=>{
      expect(panneau.parags.last.id, 'parags.last.id').to.equal(12)
      panneau.parags.moveBefore(12,2)
      expect(panneau.parags.last.id, 'parags.last.id').to.equal(10)
      panneau.parags.moveBefore(2)
      expect(panneau.parags.last.id, 'parags.last.id').to.equal(2)
    })
  ])
])


// --- #getPrevious ---

describe("Méthode Parags#getPrevious",[
  , context("avec un paragraphe avant",[
    , it("retourne le paragraphe précédent", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      panneau.parags.select(parag4)
      expect(panneau.parags.getPrevious().id,'parags.getPrevious().id').to.equal(2)
      panneau.parags.select(parag10)
      expect(panneau.parags.getPrevious().id, 'parags.getPrevious().id').to.equal(5)
    })
  ])
  , context("sans paragraphe avant",[
    , it("retourne null", ()=>{
      panneau.parags.select(parag1)
      expect(panneau.parags.getPrevious(),'parags.getPrevious()').to.strictly.equal(null)
    })
  ])
  , context("avec la touche MAJ appuyée et assez de paragraphes",[
    , it("retourne le 5e parag avant", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      panneau.parags.select(parag12)
      expect(panneau.parags.getPrevious(5).id, 'parags.getPrevious().id').to.equal(1)
    })
  ])
  , context("avec MAJ mais pas assez de parag",[
    , it("retourne le premier parag", ()=>{
      panneau.parags.select(parag4)
      expect(panneau.parags.getPrevious(5).id, 'parags.getPrevious().id').to.equal(1)
    })
  ])
])

// --- #getNext ---

describe("Méthode Parags#getNext",[
  , context("avec un paragraphe après",[
    , it("retourne le paragraphe suivant", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      panneau.parags.select(parag1)
      expect(panneau.parags.getNext().id,'parags.getNext().id').to.equal(2)
      panneau.parags.select(parag10)
      expect(panneau.parags.getNext().id, 'parags.getNext().id').to.equal(12)
    })
  ])
  , context("sans paragraphe suivant",[
    , it("retourne null", ()=>{
      panneau.parags.select(parag12)
      expect(panneau.parags.getNext(),'parags.getNext().id').to.strictly.equal(null)
    })
  ])
  , context("avec la touche MAJ appuyée et assez de paragraphes",[
    , it("retourne le 5e parag après", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      panneau.parags.select(parag1)
      expect(panneau.parags.getNext(5).id, 'parags.getNext().id').to.equal(12)
    })
  ])
  , context("avec MAJ mais pas assez de parag",[
    , it("retourne le premier parag", ()=>{
      panneau.parags.select(parag5)
      expect(panneau.parags.getNext(5).id, 'parags.getNext().id').to.equal(12)
    })
  ])
])


// --- #selectPrevious ---

describe("Méthode Parags#selectPrevious",[
  , context("sans la touche Maj",[
    , it("sélectionne le paragraphe précédent", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag2, parag4, parag5, parag10, parag12])
      panneau.parags.select(parag2)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-2'}, {only_if_fail:true})
      expect(parag2.selected,'parag2.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectPrevious()
      // ======= VÉRIFICATION ========
      expect(parag2.selected,'parag2.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-2'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
  , context("avec la touche MAJ et suffisamment de paragraphe avant",[
    , it("sélectionne le 5e paragraphe avant", ()=>{
      panneau.parags.select(parag12)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-12'}, {only_if_fail:true})
      expect(parag12.selected,'parag12.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectPrevious({shiftKey:true})
      // ======= VÉRIFICATION ========
      expect(parag12.selected,'parag12.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-12'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
  , context("avec la touche MAJ mais pas suffisamment de parag avant",[
    , it("sélectionne le premier parag", ()=>{
      panneau.parags.select(parag4)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-4'}, {only_if_fail:true})
      expect(parag4.selected,'parag4.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectPrevious({shiftKey:true})
      // ======= VÉRIFICATION ========
      expect(parag4.selected,'parag4.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-4'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
])

// --- #selectNext ---

describe("Méthode Parags#selectNext",[
  , context("sans la touche MAJ",[
    , it("sélectionne le paragraphe suivant", ()=>{
      resetAll()
      panneau.parags.add([parag12, parag5, parag10, parag4, parag2, parag1])
      panneau.parags.select(parag2)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-2'}, {only_if_fail:true})
      expect(parag2.selected,'parag2.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectNext()
      // ======= VÉRIFICATION ========
      expect(parag2.selected,'parag2.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-2'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
  , context("avec la touche MAJ",[
    , it("sélectionne le 5e paragraphe suivant si c'est possible", ()=>{
      panneau.parags.select(parag12)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-12'}, {only_if_fail:true})
      expect(parag12.selected,'parag12.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectNext({shiftKey:true})
      // ======= VÉRIFICATION ========
      expect(parag12.selected,'parag12.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-12'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
  , context("avec la touche mAJ mais pas assez de paragraphe après",[
    , it("sélectionne le dernier parag", ()=>{
      panneau.parags.select(parag4)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-4'}, {only_if_fail:true})
      expect(parag4.selected,'parag4.selected').equal(true, {only_if_fail:true})
      expect(parag1.selected,'parag1.selected').equal(false,{only_on_fail:true})
      // ===========> TEST <============
      panneau.parags.selectNext({shiftKey:true})
      // ======= VÉRIFICATION ========
      expect(parag4.selected,'parag4.selected').to.be.false
      expect(parag1.selected,'parag1.selected').to.be.true
      expect(panneau.container,'panneau.container').to.not.have_tag('div',{class:'selected', id:'p-4'})
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected', id:'p-1'})
    })
  ])
])


// --- #moveCurrentUp ---

describe("Méthode Parags#moveCurrentUp",[
  , context("avec un paragraphe avant",[
    , it("déplace le paragraphe courant avant", ()=>{
      resetAll()
      panneau.parags.add([parag12, parag10, parag5, parag4])
      panneau.parags.select(parag5)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-5'})
      expect(getListeOfIds()).equal([12,10,5,4])
      // ========> TEST <=========
      panneau.parags.moveCurrentUp()
      // ========= VÉRIFICATION =========
      expect(getListeOfIds()).equal([12,5,10,4])
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-5'})
      // ========> TEST <=========
      panneau.parags.moveCurrentUp()
      // ========= VÉRIFICATION =========
      expect(getListeOfIds()).equal([5,12,10,4])
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-5'})
    })
  ])
  , context("sans paragraphe avant",[
    , it("ne bouge pas le paragraphe", ()=>{
      // ========> TEST <=========
      panneau.parags.moveCurrentUp()
      // ========= VÉRIFICATION =========
      expect(getListeOfIds()).equal([5,12,10,4])
    })
  ])
])

// --- #moveCurrentDown ---

describe("Méthode Parags#moveCurrentDown",[
  , context("avec un paragraphe après",[
    , it("déplace le paragraphe courant après", ()=>{
      resetAll()
      panneau.parags.add([parag12, parag10, parag5, parag4])
      panneau.parags.select(parag10)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-10'})
      expect(getListeOfIds(),'la liste des parags').equal([12,10,5,4])
      // ========> TEST <=========
      panneau.parags.moveCurrentDown()
      // ========= VÉRIFICATION =========
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-10'})
      expect(getListeOfIds(),'la liste des parags').equal([12,5,10,4])
      // ========> TEST <=========
      panneau.parags.moveCurrentDown()
      // ========= VÉRIFICATION =========
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-10'})
      expect(getListeOfIds(),'la liste des parags').equal([12,5,4,10])
    })
  ])
  , context("sans paragraphe après",[
    , it("ne bouge pas le paragraphe courant", ()=>{
      // ========> TEST <=========
      panneau.parags.moveCurrentDown()
      // ========= VÉRIFICATION =========
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:'selected',id:'p-10'})
      expect(getListeOfIds(),'la liste des parags').equal([12,5,4,10])
    })
  ])
])

/** ---------------------------------------------------------------------
  *
  *     SELECTION
  *
*** --------------------------------------------------------------------- */

// --- #selection ---

describe("La sélection #selection",[
  , describe("panneau.parags.selection",[
    , it("retourne une instance ParagsSelection", ()=>{
      resetAll()
      expect(panneau.parags.selection,'panneau.parags.selection').to.be.classOf('paragsselection')
    })
    , it("répond à la méthode #add", ()=>{
      expect(typeof panneau.parags.selection.add,'selection#add').to.equal('function')
    })
    , it("répond à la méthode #remove", ()=>{
      expect(typeof panneau.parags.selection.remove,'selection#remove').to.equal('function')
    })
    , it("répond à la méthode #count", ()=>{
      expect(typeof panneau.parags.selection.count,'selection.count').to.equal('number')
    })
    , it("connait la propriété @current", ()=>{
      expect(panneau.parags.selection.current,'selection.current').not.to.strictly.equal(undefined)
    })
    , it("connait la propriété @multiple", ()=>{
      expect(panneau.parags.selection.multiple).to.be.false
    })
    , it("connait la propriété @_dict", ()=>{
      expect(panneau.parags.selection._dict).to.be.classOf('object')
    })
    , it("connait la propriété @items", ()=>{
      expect(panneau.parags.selection.items).to.be.classOf('array')
    })
    // ====== EN MODE MULTIPLE =======
    , context("en mode multiple",[
      , it("#setMultiple([true]) permet de passer en mode multiple", ()=>{
        panneau.parags.reset()
        new Array(parag1, parag2, parag10, parag12, parag4).forEach( p => panneau.parags.add(p) )
        panneau.parags.selection.reset()
        panneau.parags.selection.setMultiple(false)
        expect(panneau.parags.selection.multiple,'selection.multiple').to.equal(false, {only_on_fail:true})
        panneau.parags.selection.setMultiple()
        expect(panneau.parags.selection.multiple,'selection.multiple').to.equal(true, {only_on_fail:true})
        panneau.parags.selection.setMultiple(false)
        expect(panneau.parags.selection.multiple,'selection.multiple').to.equal(false, {only_on_fail:true})
        panneau.parags.selection.setMultiple(true)
        expect(panneau.parags.selection.multiple,'selection.multiple').to.be.true
      })
      , it("#add ajoute le paragraphe en argument à la sélection en le mettant en courant", ()=>{
        panneau.parags.selection.add(parag2)
        expect(panneau.parags.selection.count,'selection.count').to.equal(1,{only_on_fail: true})
        expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(2,{only_on_fail: true})
        panneau.parags.selection.add(parag4)
        expect(panneau.parags.selection.count,'selection.count').to.equal(2)
        expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(4)
      })
      , it("#add passe les parags à “selected” dans le document", ()=>{
        expect(panneau.container).to.have_tag('div', {class:'selected', id:'p-2'}, {only_on_fail: true})
        expect(panneau.container).to.have_tag('div', {class:['selected','current'], id:'p-4'}, {only_on_fail: true})
        expect(panneau.container).to.have_tag('div', {class:'selected', count: 2})
      })
    ])
    // ====== EN MODE SIMPLE =======
    , context("en mode simple (non multiple)",[
      , it("préparation du terrain de jeu…", () => {
          panneau.parags.reset()
          new Array(parag6, parag3, parag2, parag1, parag10, parag12, parag5, parag11).forEach( p => panneau.parags.add(p) )
          panneau.parags.selection.reset()
          panneau.parags.selection.setMultiple()
          expect(panneau.parags.selection.multiple,'selection.multiple').to.equal(true)
        })
      , it("#setMultiple(false) permet de passer en mode simple", ()=>{
        panneau.parags.selection.setMultiple(false)
        expect(panneau.parags.selection.multiple,'selection.multiple').to.be.false
      })
      , it("permet d'ajouter une sélection avec #add, mais le compte reste à 1", ()=>{
        expect(panneau.container,'panneau.container').to.not.have_tag('div', {class:'selected', id:'p-3'}, {only_on_fail:true})
        panneau.parags.selection.add(parag3)
        expect(panneau.parags.selection.count).to.equal(1,{only_on_fail: true})
        expect(panneau.parags.selection.current.id).to.equal(3,{only_on_fail: true})
        expect(panneau.container,'panneau.container').to.have_tag('div', {class:['p','selected'], id:'p-3'})
        panneau.parags.selection.add(parag5)
        expect(panneau.parags.selection.count).to.equal(1,{only_on_fail: true})
        expect(panneau.parags.selection.current.id).to.equal(5,{only_on_fail: true})
        expect(panneau.container,'panneau.container').to.not.have_tag('div', {class:'selected', id:'p-3'}, {only_on_fail:true})
        expect(panneau.container,'panneau.container').to.have_tag('div', {class:'selected', id:'p-5'})
        panneau.parags.selection.add(parag10)
        expect(panneau.parags.selection.count, 'selection.count').to.equal(1)
        expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(10)
        expect(panneau.container,'panneau.container').to.not.have_tag('div', {class:'selected', id:'p-5'}, {only_on_fail:true})
        expect(panneau.container,'panneau.container').to.have_tag('div', {class:['selected','current'], id:'p-10'})
      })
      , it("s'il y a des sélections, le passage en mode simple ne conserve que le dernier", ()=>{
        panneau.parags.selection.reset()
        panneau.parags.selection.setMultiple()
        expect(panneau.parags.selection.multiple).to.equal(true,{only_on_fail:true})
        new Array(parag1, parag3, parag11, parag6).forEach( (p) => {
          panneau.parags.selection.add(p)
        })
        expect(panneau.container,'panneau.container').to.have_tag('div',{count:4, class:['p','selected']})
        expect(panneau.container,'panneau.container').to.have_tag('div',{count:1, class:'current'})

        panneau.parags.selection.setMultiple(false)
        expect(panneau.parags.selection.multiple,'selection.multiple').to.equal(false,{only_on_fail:true})
        expect(panneau.container,'panneau.container').to.have_tag('div',{count:1, class:'selected', id:'p-6'})
        expect(panneau.container,'panneau.container').to.have_tag('div',{count:1, class:'current', id:'p-6'})
      })
    ])
  ])

])

// --- PanProjet#hasCurrent ---

describe("Méthode PanProjet#hasCurrent",[
  , context("avec une sélection courant",[
    , it("retourne true", ()=>{
      panneau.parags.select(panneau.parags.first)
      expect(panneau.parags.hasCurrent(),'parags.hasCurrent()').to.equal(true)
    })
  ])
  , context("sans sélection courante",[
    , it("retourne false", ()=>{
      panneau.parags.deselectAll()
      expect(panneau.parags.hasCurrent(),'parags.hasCurrent()').to.equal(false)
    })
  ])
])

// --- @selection#add ---

describe("Sélection de parags selection#add",[
  , context("avec une instance parag en argument",[
    , it("prépare le terrain", ()=>{
      resetAll()
      // On injecte les paragraphes dans le document
      panneau.parags.add(parag1)
      panneau.parags.add(parag3)
      panneau.parags.add(parag10)
      panneau.parags.add(parag11)
      panneau.parags.selection.add(parag1)
      expect(parag1.selected,'parag1.selected').to.equal(true, {only_on_fail:true})
      expect(parag1.current,'parag1.current').to.equal(true, {only_on_fail:true})
    })
    , it("sélectionne le parag dans le document", ()=>{
      expect(panneau.container).to.have_tag('div',{class:['p','selected'], count:1},{only_on_fail:true})
      panneau.parags.selection.add(parag10)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:['p','selected'],id:'p-10'})
    })
    , it("règle la propriété selected du paragraphe à true", ()=>{
      expect(parag10.selected,'parag10.selected').to.equal(true)
    })
    , it("règle la propriété current du paragraphe à tre", ()=>{
      expect(parag10.current,'parag10.current').to.equal(true)
    })
    , it("met le parag en paragraphe courant", ()=>{
      expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(10)
    })
    , it("désélectionne le paragraphe courant s'il existait", ()=>{
      expect(parag1.selected,'parag1.selected').to.equal(false)
    })
    , it("décurrentise le paragraphe courant s'il existait", ()=>{
      expect(parag1.current,'parag1.current').to.equal(false)
    })
  ])

  , context("avec un identifiant en argument",[
    , it("sélectionne le parag dans le document", ()=>{
      panneau.parags.selection.add(3)
      expect(panneau.container,'panneau.container').to.have_tag('div',{id:'p-3', class:['p','current','selected']})
    })
    , it("met le parag en paragraphe courant", ()=>{
      expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(3)
    })
    , it("désélectionne le paragraphe courant s'il existait", ()=>{
      expect(parag10.selected,'parag10.selected').to.equal(false)
    })
    , it("décurrentise le paragraphe courant s'il existait", ()=>{
      expect(parag10.current,'parag10.current').to.equal(false)
    })
  ])

])

// --- Parags#editCurrent ---
describe("Parags#editCurrent",[
  , context("avec une sélection",[
    , it("édite le paragraphe courant", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag3, parag6])
      panneau.parags.select(parag3)
      expect(panneau.container).to.have_tag('div',{id:'p-3',class:['p','selected','current']}, {only_on_fail:true})
      expect(panneau.container).to.not.have_tag('div',{id:'p-3-contents', contenteditable:'true'}, {only_on_fail:true})
      // ======> TEST <========
      panneau.parags.editCurrent()
      // ====== VÉRIFICATIONS ======
      expect(panneau.container).to.have_tag('div',{id:'p-3-contents', contenteditable:'true'})
    })
  ])
  , context("sans sélection",[
    , it("ne met aucun paragraphe en édition", ()=>{
      resetAll()
      panneau.parags.add([parag1, parag3, parag6])
      // ======> TEST <========
      panneau.parags.editCurrent()
      // ====== VÉRIFICATIONS ======
      expect(panneau.container,'panneau.container').not.to.have_tag('div',{class:'p-contents', contenteditable:'true'})
    })
  ])
])

// --- Parags#select -----

describe("Parags#select",[
  , it("permet de sélectionner un paragraphe avec une instance", ()=>{
    resetAll()
    panneau.parags.add([parag2, parag10, parag5, parag6])
    expect(panneau.container,'panneau.container').not.to.have_tag('div', {class:'selected'})
    expect(panneau.parags.selection.count,'selection.count').to.equal(0)
    // ======> TEST <=========
    panneau.parags.select(parag10)
    // ===== VÉRIFICATION ======
    expect(panneau.container,'panneau.container').to.have_tag('div',{class:['current','p','selected'],id:'p-10'})
    expect(panneau.parags.selection.count,'selection.count').to.equal(1)
    expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(10)
    expect(parag10.selected,'parag10.selected').to.equal(true)
    expect(parag10.current,'parag10.current').to.equal(true)
  })

  , it("permet de sélectionner un paragraphe avec un identifiant", ()=>{
    // ======> TEST <=========
    panneau.parags.select(2)
    // ===== VÉRIFICATION ======
    expect(panneau.container,'panneau.container').not.to.have_tag('div',{class:['current','p','selected'],id:'p-10'})
    expect(panneau.container,'panneau.container').to.have_tag('div',{class:['current','p','selected'],id:'p-2'})
    expect(panneau.parags.selection.count,'selection.count').to.equal(1)
    expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(2)
    expect(parag10.selected,'parag10.selected').to.equal(false)
    expect(parag10.current,'parag10.current').to.equal(false)
    expect(parag2.selected,'parag2.selected').to.equal(true)
    expect(parag2.current,'parag2.current').to.equal(true)
  })
])

// --- Parags#deselectAll ---

describe("Déselection avec #deselectAll",[

  , context("sans paragraphes sélectionnés",[
    , it("ne change rien à la sélection", ()=>{
      resetAll()
      panneau.parags.add([parag3, parag2, parag1, parag10])
      expect(panneau.parags.selection.count,'selection.count').to.equal(0)
      // =======> TEST <=========
      panneau.parags.deselectAll()
      // ======== VÉRIFICATION =======
      expect(panneau.parags.selection.count,'selection.count').to.equal(0)
    })
  ])

  , context("avec des parags sélectionnés en mode multiple",[
    , it("déselectionne tous les paragraphs sélectionnés", ()=>{
      resetAll()
      panneau.parags.selection.setMultiple()
      panneau.parags.add([parag3, parag2, parag1, parag10])
      panneau.parags.select([parag2, parag1, parag10])
      expect(panneau.parags.selection.count,'selection.count').to.equal(3)
      expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(10)
      // =======> TEST <=========
      panneau.parags.deselectAll()
      // ======== VÉRIFICATION =======
      expect(panneau.parags.selection.count,'selection.count').to.equal(0)
    })
  ])
])

// --- parags#deselect ---

describe("Déselection avec parags#deselect", [
  , context("avec des parags sélectionnés (en mode multiple)",[
    , it("en désectionne plusieurs avec leur identifiant", ()=>{
      resetAll()
      panneau.parags.selection.setMultiple()
      panneau.parags.add([parag5, parag4, parag2, parag1, parag10, parag11])
      panneau.parags.select([parag4, parag2, parag5, parag1])
      expect(panneau.parags.selection.count,'selection.count').to.equal(4)
      // =============> TEST <===========
      panneau.parags.deselect([2,4])
      // ========== VÉRIFICATION ========
      expect(panneau.parags.selection.count,'selection.count').to.equal(2)
      expect(panneau.parags.selection.current.id,'selection.current.id').to.equal(1)
      expect(parag2.selected,'parag2.selected').to.equal(false)
      expect(parag2.current,'parag2.current').to.equal(false)
      expect(parag4.selected,'parag4.selected').to.equal(false)
      expect(parag4.current,'parag4.current').to.equal(false)
    })
    , it("ne désélectionne pas les autres paragraphes", ()=>{
      expect(parag5.selected,'parag5.selected').to.equal(true)
      expect(parag5.selected,'parag5.selected').to.equal(true)
      expect(parag1.current,'parag1.current').to.equal(true)
      expect(parag1.current,'parag1.current').to.equal(true)
      expect(panneau.container,'panneau.container').to.have_tag('div',{class:['p','selected'], count:2})
    })
  ])
  , context("en désélectionnant le paragraphe courant",[
    , it("met en paragraphe courant le paragraphe suivant", ()=>{
      resetAll()
      panneau.parags.selection.setMultiple()
      panneau.parags.add([parag5, parag4, parag2, parag1, parag10, parag11])
      panneau.parags.select([parag4, parag2, parag5, parag1])
      expect(panneau.parags.selection.count,'selection.count').to.equal(4)
      expect(parag2.selected,'parag2.selected').to.equal(true)
      expect(parag2.current,'parag2.current').to.equal(false)
      expect(parag1.selected,'parag1.selected').to.equal(true)
      expect(parag1.current,'parag1.current').to.equal(true)
      expect(parag5.selected,'parag5.selected').to.equal(true)
      expect(parag5.current,'parag5.current').to.equal(false)
      // =============> TEST <===========
      panneau.parags.deselect([1,5])
      // ========== VÉRIFICATION ========
      expect(panneau.parags.selection.count,'selection.count').to.equal(2)
      expect(parag1.selected,'parag1.selected').to.equal(false)
      expect(parag1.current,'parag1.current').to.equal(false)
      expect(parag5.selected,'parag5.selected').to.equal(false)
      expect(parag5.current,'parag5.current').to.equal(false)
      // C'est ici que ça se joue
      expect(parag2.selected,'parag2.selected').to.equal(true)
      expect(parag2.current,'parag2.current').to.equal(true) //<==== ICI

    })
  ])
])
