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

PTests.options.one_line_describe = false

let act_pass, act_fail, expected

function hCopy (h)
{
  let newH = {}
  for(p in h){if(h.hasOwnProperty(p)){newH[p]=h[p]}}
  return newH
}
function produitSuccess()
{
  console.log('expected = ',expected)
  // let exp = JSON.parse(JSON.stringify(expected)) // NON !!! TRANSFORME LES REGEXP EN OBJECT
  let exp = hCopy(expected)
  res = resfor(act_pass, exp)
  console.log('res',res)
  expect(res.success, 'res.success').to.be.true
}
function produitFailure()
{
  console.log('expected = ',expected)
  let exp = hCopy(expected)
  res = resfor(act_fail, exp)
  console.log('res',res)
  expect(res.success, 'res.success').to.be.false

}

// act_pass  = '<div><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)<span>petit span</span></div></div>'
// act_fail  = '<fieldset><span>Le texte</span></fieldset>'
//
// context("avec un actual en string", [
//
//   , describe("recherche d'une balise sans attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec un attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv"}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec seulement text (string) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'Le texte (dans le div)'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'LE TEXTE'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec text contenant des balises",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /<span(.*)<\/span>/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
// ])
//
//
// // act_pass  = '<div><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)<span>petit span</span></div></div>'
// let div  = DOM.create('div',{id:'mondiv', class:'moncss macss', 'data-id':'12', inner:"Le texte (dans le div)<span>petit span</span>"})
// act_pass = DOM.create('div')
// act_pass.appendChild(div)
// act_fail  = '<fieldset><span>Le texte</span></fieldset>'
// let span = DOM.create('span', {inner: 'Le texte'})
// act_fail = DOM.create('fieldset')
// act_fail.appendChild(span)
//
// context("avec un actual en HTMLElement", [
//
//   , describe("recherche d'une balise sans attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec un attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv"}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec seulement text (string) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'Le texte (dans le div)'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'LE TEXTE'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec text contenant des balises",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /<span(.*)<\/span>/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
// ])
//
//
// let code_act_pass  = '<div id="act_pass"><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)<span>petit span</span></div></div>'
// document.body.insertAdjacentHTML('beforeend', code_act_pass)
// let code_act_fail  = '<fieldset id="act_fail"><span>Le texte</span></fieldset>'
// document.body.insertAdjacentHTML('beforeend', code_act_fail)
//
// act_pass = 'div#act_pass'
// act_fail = 'fieldset#act_fail'
//
// context("avec un actual en SELECTOR CSS (String)", [
//
//   , describe("recherche d'une balise sans attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec un attribut spécifié",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv"}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
//     , it("produit un succès si la balise existe", ()=>{
//       expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec seulement text (string) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'Le texte (dans le div)'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       expected = {tag: 'div', text: 'LE TEXTE'}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//   , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
//
//   , describe("recherche d'une balise avec text contenant des balises",[
//     , it("produit un succès si la balise existe et contient le texte", ()=>{
//       // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
//       let re = /<span(.*)<\/span>/i
//       expected = {tag: 'div', text: re}
//       produitSuccess()
//     })
//     , it("produit un échec si la balise n'existe pas", ()=>{
//       produitFailure()
//     })
//   ])
//
// ])


// ---------------------------------------------------------------------

act_pass = `
<button class="but">bouton 1</button>
<button class="but in">bouton 2</button>
<button class="but out">bouton 3</button>
<span class="maxspan in">span 1</span>
<span class="maxspan in">span 2</span>
<span class="maxspan out">span 3</span>
<span class="maxspan out">span 4</span>
<span class="maxspan out">span 5</span>
`
act_fail = `
<button class="but">bouton 1</button>
<button class="but in">bouton 2</button>
<button class="nonbut">bouton 2</button><!-- ne doit pas être compté -->
<span class="maxspan in">span 1</span>
<span class="maxspan in">span 2</span>
<span class="maxspan out">span 3</span>
<span class="maxspan out">span 4</span>
<span class="maxspan out">span 5</span>
<span class="maxspan out">span 6</span>
`

describe("Vérification du nombre de fois avec un actual en STRING",[
  , describe("recherche d'un nombre précis d'éléments",[
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'button', class:'but', count: 3}
      produitSuccess()
    })
    , it("produit un échec si le nombre est inférieur", ()=>{
      // Pas assez de button .but
      produitFailure()
    })
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'span', class:'maxspan', count: 4}
      produitSuccess()
    })
    , it("produit un échec si le nombre des supérieurs", ()=>{
      // trop de span maxspan
      produitFailure()
    })
  ])
])


describe("avec un actual en HTMLELEMENT",[


])

describe("avec un actual en SELECTOR CSS",[

])
