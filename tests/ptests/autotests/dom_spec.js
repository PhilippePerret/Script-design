/*

  Test de PTests/doms.js

  Note : on se sert tout simplement du document de test lui-même pour insérer et tester
  des éléments. Il suffit d'utiliser `document.insertAdjacentHTML`.

*/

// let PTestsDomFacilities = require_module('./lib/utils/PTests/dom')
let path = require('path')
let PTestsDOM = require(path.join(C.LIB_UTILS_FOLDER,'PTests','dom'))
let DOM = require(path.join(C.LIB_UTILS_FOLDER,'dom_class'))

let act, exp, res

function resfor(a, e, o){
  return PTestsDOM.actualTagContainsExpect(a, e, o)
}

PTests.options.one_line_describe = false

let act_pass, act_fail, expected


// On ajoute dans le body une balise div#container_de_tests pour y mettre les
// codes qui doivent être lus dans le document
document.body.insertAdjacentHTML('beforeend','<div id="container_de_tests"></div>')
const CONTAINER_TESTS = document.getElementById('container_de_tests')

function hCopy (h)
{
  let newH = {}
  for(p in h){if(h.hasOwnProperty(p)){newH[p]=h[p]}}
  return newH
}
function produitSuccess(act)
{
  console.log('expected = ',expected)
  // let exp = JSON.parse(JSON.stringify(expected)) // NON !!! TRANSFORME LES REGEXP EN OBJECT
  let exp = hCopy(expected)
  res = resfor(act, exp)
  console.log('res',res)
  expect(res.success, 'res.success').to.be.true
}
function produitFailure(act)
{
  console.log('expected = ',expected)
  let exp = hCopy(expected)
  res = resfor(act, exp)
  console.log('res',res)
  expect(res.success, 'res.success').to.be.false

}




act_pass_str_noattr  = '<div><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)<span>petit span</span></div></div>'
act_fail_str_noattr  = '<fieldset><span>Le texte</span></fieldset>'

context("avec un actual en string", [

  , describe("recherche d'une balise sans attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div'}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])

  , describe("recherche d'une balise avec un attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv"}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])


  , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])


  , describe("recherche d'une balise avec seulement text (string) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'Le texte (dans le div)'}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])

  , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'LE TEXTE'}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])

  , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])


  , describe("recherche d'une balise avec text contenant des balises",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /<span(.*)<\/span>/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_str_noattr)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_str_noattr)
    })
  ])

])


let act_pass_hel, act_fail_hel
let div  = DOM.create('div',{id:'mondiv', class:'moncss macss', 'data-id':'12', inner:"Le texte (dans le div)<span>petit span</span>"})
act_pass_hel = DOM.create('div')
act_pass_hel.appendChild(div)
act_fail_hel  = '<fieldset><span>Le texte</span></fieldset>'
let span = DOM.create('span', {inner: 'Le texte'})
act_fail_hel = DOM.create('fieldset')
act_fail_hel.appendChild(span)

context("avec un actual en HTMLElement", [

  , describe("recherche d'une balise sans attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div'}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])

  , describe("recherche d'une balise avec un attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv"}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])


  , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])


  , describe("recherche d'une balise avec seulement text (string) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'Le texte (dans le div)'}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])

  , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'LE TEXTE'}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])

  , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])


  , describe("recherche d'une balise avec text contenant des balises",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /<span(.*)<\/span>/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_hel)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_hel)
    })
  ])

])


// ---------------------------------------------------------------------

let code_act_pass  = '<div id="act_pass"><div id="mondiv" class="moncss macss" data-id="12">Le texte (dans le div)<span>petit span</span></div></div>'
// CONTAINER_TESTS.insertAdjacentHTML('beforeend', code_act_pass)
let code_act_fail  = '<fieldset id="act_fail"><span>Le texte</span></fieldset>'
// CONTAINER_TESTS.insertAdjacentHTML('beforeend', code_act_fail)

let act_pass_sel_attrs = 'div#act_pass'
let act_fail_sel_attrs = 'fieldset#act_fail'

context("avec un actual en SELECTOR CSS (String)", [

  , describe("recherche d'une balise sans attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      CONTAINER_TESTS.innerHTML = ''
      CONTAINER_TESTS.insertAdjacentHTML('beforeend', code_act_pass)
      CONTAINER_TESTS.insertAdjacentHTML('beforeend', code_act_fail)
      expected = {tag: 'div'}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])

  , describe("recherche d'une balise avec un attribut spécifié",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv"}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])


  , describe("recherche d'une balise avec plusieurs attributs spécifiés",[
    , it("produit un succès si la balise existe", ()=>{
      expected = {tag: 'div', id: "mondiv", class:"moncss macss", 'data-id':'12'}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])


  , describe("recherche d'une balise avec seulement text (string) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'Le texte (dans le div)'}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])

  , describe("recherche d'une balise avec seulement text (string dans une autre casse) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      expected = {tag: 'div', text: 'LE TEXTE'}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])

  , describe("recherche d'une balise avec seulement text (regexp) spécifié",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /(TEXTE|PARAGRAPHE) \(dans le div\)/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])


  , describe("recherche d'une balise avec text contenant des balises",[
    , it("produit un succès si la balise existe et contient le texte", ()=>{
      // let re = new RegExp("(TEXTE|PARAGRAPHE) \(dans le div\)",'i')
      let re = /<span(.*)<\/span>/i
      expected = {tag: 'div', text: re}
      produitSuccess(act_pass_sel_attrs)
    })
    , it("produit un échec si la balise n'existe pas", ()=>{
      produitFailure(act_fail_sel_attrs)
    })
  ])

])








//---------------------------------------------------------------------

const act_pass_c = `
<button class="but">bouton 1</button>
<button class="but in">bouton 2</button>
<button class="but out">bouton 3</button>
<span class="maxspan in">span 1</span>
<span class="maxspan in">span 2</span>
<span class="maxspan out">span 3</span>
<span class="maxspan out">span 4</span>
<span class="out">span 5</span>
`
const act_fail_c = `
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

CONTAINER_TESTS.innerHTML = ''


context("Vérification du nombre de balises trouvées avec un STRING",[
  , describe("recherche d'un nombre précis d'éléments",[
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'button', class:'but', count: 3}
      produitSuccess(act_pass_c)
    })
    , it("produit un échec si le nombre est inférieur", ()=>{
      // Pas assez de button .but
      produitFailure(act_fail_c)
    })
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'span', class:'maxspan', count: 4}
      produitSuccess(act_pass_c)
    })
    , it("produit un échec si le nombre est supérieurs", ()=>{
      // trop de span maxspan
      produitFailure(act_fail_c)
    })
  ])
])

let act_pass_nb_html = DOM.create('div', {inner: act_pass_c})
let act_fail_nb_html = DOM.create('div', {inner: act_fail_c})

context("Vérification du nombre de balises trouvées avec un HTMLElement",[
  , describe("recherche d'un nombre précis d'éléments",[
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'button', class:'but', count: 3}
      produitSuccess(act_pass_nb_html)
    })
    , it("produit un échec si le nombre est inférieur", ()=>{
      // Pas assez de button .but
      produitFailure(act_fail_nb_html)
    })
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'span', class:'maxspan', count: 4}
      produitSuccess(act_pass_nb_html)
    })
    , it("produit un échec si le nombre est supérieurs", ()=>{
      // trop de span maxspan
      produitFailure(act_fail_nb_html)
    })
  ])
])


context("Vérification du nombre de balises trouvées avec un SELECTOR CSS",[
  , describe("recherche d'un nombre précis d'éléments",[
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      CONTAINER_TESTS.innerHTML = ''
      let d
      d = DOM.create('div', {id: "act_pass", inner: act_pass_c})
      CONTAINER_TESTS.insertAdjacentHTML('beforeend',d.outerHTML)
      d = DOM.create('div', {id: "act_fail", inner: act_fail_c})
      CONTAINER_TESTS.insertAdjacentHTML('beforeend',d.outerHTML)

      expected = {tag:'button', class:'but', count: 3}
      produitSuccess('div#act_pass')
    })
    , it("produit un échec si le nombre est inférieur", ()=>{
      // Pas assez de button .but
      produitFailure('div#act_fail')
    })
    , it("produit un succès s'il y a bien ce nombre d'éléments", ()=>{
      expected = {tag:'span', class:'maxspan', count: 4}
      produitSuccess('div#act_pass')
    })
    , it("produit un échec si le nombre est supérieurs", ()=>{
      // trop de span maxspan
      produitFailure('div#act_fail')
    })
  ])
])
