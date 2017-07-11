/*

  Test de PTests/doms.js

  Note : on se sert tout simplement du document de test lui-même pour insérer et tester
  des éléments. Il suffit d'utiliser `document.insertAdjacentHTML`.

  On teste ici les recherches sur les children. Sinon, c'est dans le document
  dom_spec.js que sont testés les autres choses.

*/

// let PTestsDomFacilities = require_module('./lib/utils/PTests/dom')
let path = require('path')
let PTestsDOM = require(path.join(C.LIB_UTILS_FOLDER,'PTests','dom'))
let DOM = require(path.join(C.LIB_UTILS_FOLDER,'dom_class'))

let act, exp, res
let act_pass, act_fail, expected

function resfor(a, e, o){
  return PTestsDOM.actualTagContainsExpect(a, e, o)
}

PTests.options.one_line_describe = false



// On ajoute dans le body une balise div#container_de_tests pour y mettre les
// codes qui doivent être lus dans le document
document.body.insertAdjacentHTML('beforeend','<section id="container_de_tests"></section>')
const CONTAINER_TESTS = document.getElementById('container_de_tests')

function hCopy (h)
{
  let newH = {}
  for(p in h){if(h.hasOwnProperty(p)){newH[p]=h[p]}}
  return newH
}

function typeOfAct(act)
{
  if ('string' === typeof act)
  {
    if(act.startsWith('<')){ return 'code HTML'}
    else { return 'Selector CSS'}
  } else { return act.constructor.name }
}
function produitSuccess(act)
{
  console.log('expected = ',expected)
  // let exp = JSON.parse(JSON.stringify(expected)) // NON !!! TRANSFORME LES REGEXP EN OBJECT
  let exp = hCopy(expected)
  res = resfor(act, exp)
  console.log('res',res)
  expect(res.success, `res.success avec un ${typeOfAct(act)}`).to.be.true
}
function produitFailure(act)
{
  console.log('expected = ',expected)
  let exp = hCopy(expected)
  res = resfor(act, exp)
  console.log('res',res)
  expect(res.success, `res.success avec un ${typeOfAct(act)}`).to.be.false
}

// Pour recherche par STRING simple
act_pass = `
<div id="act_pass">
  <div>
    <span class='seek'>Un texte simple</span>
  </div>
  <div>
    <span id='sid' class='autre oseek'>Autre</span>
  </div>
</div>
`
act_fail = `
<div id="act_fail">
  <div>
    <i>Un texte simple</i>
  </div>
  <div>
    <b>Autre</b>
  </div>
</div>
`

// Pour recherche par HTMLElement
let act_pass_html = DOM.create('fieldset', {inner: act_pass})
console.log("ACT_PASS:",act_pass)
console.log("ACT_PASS_HTML:",act_pass_html.outerHTML)
let act_fail_html = DOM.create('fieldset', {inner: act_fail})

// Pour recherche par SELECTEUR
CONTAINER_TESTS.innerHTML = ''
CONTAINER_TESTS.insertAdjacentHTML('beforeend', act_pass)
CONTAINER_TESTS.insertAdjacentHTML('beforeend', act_fail)

function putsAct(where)
{
  puts(`act_pass_html ${where} = ${act_pass_html.outerHTML.replace(/</g,'&lt;')}`)
}
describe("Recherche avec parent simple (un seul contenu)",[

  // ÉLÉMENT SIMPLE DANS AUTRE ÉLÉMENT SIMPLE SANS ATTRIBUT NI TEXTE NI ID
  , describe("Simple élément dans simple élément sans attribut, texte ou id",[
    , it("produit un succès si l'élément s'y trouve", ()=>{
      expected = {tag: 'div', children:[['span']]}
      produitSuccess(act_pass)
      produitSuccess(act_pass_html)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément ne s'y trouve pas", ()=>{
      produitFailure(act_fail)
      produitFailure(act_fail_html)
      produitFailure(act_fail)
    })
  ])

  , describe("Élément avec une class recherché dans simple élément",[
    , it("produit un succès si l'élément est trouvé", ()=>{
      expected = {tag:'div', children:[['span',{class:'seek'}]]}
      produitSuccess(act_pass)
      console.log(DELIMITER_START)
      console.log('typeof act_pass_html', act_pass_html.constructor.name)
      console.log('act_pass_html', act_pass_html.outerHTML)
      produitSuccess(act_pass_html)
      console.log(DELIMITER_END)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément ne s'y trouve pas", ()=>{
      produitFailure(act_fail)
      produitFailure(act_fail_html)
      produitFailure(act_fail)
    })
  ])

  , describe("Élément avec une class recherché dans simple élément contenant deux classes",[
    , it("produit un succès si l'élément est trouvé", ()=>{
      expected = {tag:'div', children:[['span',{class:'oseek'}]]}
      produitSuccess(act_pass)
      produitSuccess(act_pass_html)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément ne s'y trouve pas", ()=>{
      produitFailure(act_fail)
    })
  ])


  , describe("Élément recherché par son ID dans simple élément",[
    , it("produit un succès si l'élément est trouvé", ()=>{
      expected = {tag:'div', children:[['span',{id:'sid'}]]}
      produitSuccess(act_pass)
      produitSuccess(act_pass_html)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément ne s'y trouve pas", ()=>{
      produitFailure(act_fail)
    })
  ])

  , describe("Élément avec enfant cherché par son texte",[
    , it("produit un succès si l'élément est trouvé", ()=>{
      expected = {tag: 'div', children:[
        ['span', {text: 'Un texte simple'}]
      ]}
      produitSuccess(act_pass)
      produitSuccess(act_pass_html)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément avec cet enfant n'est pas trouvé", ()=>{
      produitFailure(act_fail)
    })
  ])

  , describe("Élément avec enfant cherché par une partie de texte",[
    , it("produit un succès si l'élément est trouvé", ()=>{
      expected = {tag: 'div', children:[
        ['span', {text: 'texte'}]
      ]}
      produitSuccess(act_pass)
      produitSuccess(act_pass_html)
      produitSuccess('section#container_de_tests')
    })
    , it("produit un échec si l'élément avec cet enfant n'est pas trouvé", ()=>{
      produitFailure(act_fail)
    })
  ])

])
