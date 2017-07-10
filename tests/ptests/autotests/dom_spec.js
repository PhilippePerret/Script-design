/*

  Test de PTests/doms.js

  Note : on se sert tout simplement du document de test lui-même pour insérer et tester
  des éléments. Il suffit d'utiliser `document.insertAdjacentHTML`.

*/

// let PTestsDomFacilities = require_module('./lib/utils/PTests/dom')
let path = require('path')
let PTestsDOMFacilities = require(path.join(C.LIB_UTILS_FOLDER,'PTests','dom'))
let DOM = require(path.join(C.LIB_UTILS_FOLDER,'dom_class'))

let act, exp, res

function resfor(a, e, o){
  return PTestsDOMFacilities.actualTagContainsExpect(a, e, o)
}
//
// describe("PTestsDOMFacilities",[
//
//   , describe("Méthode #actualTagContainsExpect",[
//
//     // , describe("en général",[
//     //   , it("répond", ()=>{
//     //     expect(PTestsDOMFacilities).to.respond_to('actualTagContainsExpect')
//     //   })
//     //   , it("retourne un objet", ()=>{
//     //     expect(PTestsDOMFacilities.actualTagContainsExpect()).to.be.classOf('object')
//     //   })
//     //   , it("retourne l'HTMLElement de l'élément DOM", ()=>{
//     //     res = resfor('<div id="essai"></div>')
//     //     expect(res.domActual).to.be.classOf('htmlunknownelement')
//     //   })
//     // ])
//     //
//     //
//     // , describe("le domActual testé",[
//     //   , it("peut être défini par un simple string", ()=>{
//     //     act = '<div id="undivstring"></div>'
//     //     res = resfor(act)
//     //     expect(res.domActual,'res.domActual par String').to.be.classOf('htmlunknownelement')
//     //   })
//     //   , it("peut être défini par un HTMLElement", ()=>{
//     //     act = DOM.create('div',{id:"undivpardom"})
//     //     res = resfor(act)
//     //     expect(res.domActual,'res.domActual par DOM élément').to.be.classOf('htmlunknownelement')
//     //   })
//     //   , it("peut être défini par un selector", ()=>{
//     //     document.body.insertAdjacentHTML('beforeend', '<div id="undivparselector"></div>')
//     //     act = 'div#undivparselector'
//     //     res = resfor(act)
//     //     expect(res.domActual,'res.domActual par Selector CSS').to.be.classOf('htmldivelement')
//     //   })
//     // ])
//     , context("avec un actual HTMLElement",[
//       , describe("recherche d'une balise sans attribut",[])
//     ])
//
//     , describe("une balise existante (sans attribut recherché)",[
//       , context("avec un actual en string",[
//         , it("retourne un succès", ()=>{
//           act = '<div></div>'
//           res = resfor(act, {tag:'div'})
//           expect(res.success,'res.success').to.be.true
//         })
//       ])
//       , context("avec un actual HTMLElement",[
//         , it("retourne un succès", ()=>{
//           act = DOM.create('div')
//           res = resfor(act, {tag:'div'})
//           expect(res.success, 'res.success').to.be.true
//         })
//       ])
//       , context("avec un actual en sélector CSS",[
//         , it("retourne un succès", ()=>{
//           document.body.insertAdjacentHTML('beforeend','<div id="mondiv"><div>Avec du texte</div></div>')
//           act = "div#mondiv"
//           res = resfor(act, {tag:'div'})
//           expect(res.success, 'res.success').to.be.true
//         })
//       ])
//     ])
//   ])
// ])

let act_pass, act_fail, expected

function produitSuccess()
{
  console.log('expected = ',expected)
  let exp = JSON.parse(JSON.stringify(expected))
  res = resfor(act_pass, exp)
  // console.log('res',res)
  expect(res.success, 'res.success').to.be.true
}
function produitFailure()
{
  console.log('expected = ',expected)
  let exp = JSON.parse(JSON.stringify(expected))
  res = resfor(act_fail, exp)
  // console.log('res',res)
  expect(res.success, 'res.success').to.be.false

}

act_pass  = '<div><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)</div></div>'
act_fail  = '<fieldset><span>Le texte</span></fieldset>'

context("avec un actual en string", [

  , describe("recherche d'une balise sans attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div'}
      produitSuccess()
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure()
    })
  ])

  , describe("recherche d'une balise avec un attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv"}
      produitSuccess()
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure()
    })
  ])


  , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
      produitSuccess()
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure()
    })
  ])


  , describe("recherche d'une balise avec seulement text (string) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'Le texte (dans le div)'}
      produitSuccess()
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure()
    })
  ])

])
