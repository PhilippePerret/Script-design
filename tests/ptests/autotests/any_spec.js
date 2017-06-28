/** ---------------------------------------------------------------------
  *
  *   Grand test de la class Any qui permet de procéder à toutes les
  *   comparaison dans PTests
  *
*** --------------------------------------------------------------------- */

// Le module testé
let Any = require_module('./lib/utils/PTests_Any')

let res, opts, eva, exp1, exp2
    , resO = {not_a_test: true}
    , tbl, tbl_str, tbl2, tbl2_str

function templates(act, exp, strict, val)
{
  if ( undefined === val ) val = 'true'
  return {template:{success:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}produit ${val}`, failure:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}aurait dû produire ${val}…`}}
}
//                    v----v-------- Noter l'inversion
function tempContain(exp, act, strict, val)
{
  if ( undefined === val ) val = 'true'
  return {template:{success:`Any::isContainedBy(${exp}, ${act}) ${strict?'en mode strict ':''}produit ${val}`, failure:`Any::isContainedBy(${exp}, ${act}) ${strict?'en mode strict ':''}aurait dû produire ${val}…`}}
}


describe("Class Any",[
  , describe("::areEqual", [
    , describe(" pour les NOMBRES",[
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux nombres égaux (mode strict ou non)', () => {
          res = expect(Any.areEqual(4,4)).equals(true, resO).isOK
          expect(res,templates(4,4)).to.be.true
          res = expect(Any.areEqual(4,4)).strictly.equals(true, resO).isOK
          expect(res,templates(4,4,true)).to.be.true
        })
        , it('en cas d’égalité pour un nombre et un nombre-string', () => {
          res = expect(Any.areEqual(4,'4')).equals(true, resO).isOK
          expect(res,templates(4,'"4"')).be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en mode strict, avec l’égalité d’un nombre et d’un nombre-string', () => {
          res = expect(Any.areEqual(4,'4',{strict:true})).equals(true, resO).isOK
          expect(res,templates(4,'"4"',true,'false')).be.false
        })
      ])
    ])
    , describe(" pour les STRINGS", [
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux strings strictement égaux', () => {
          res = expect(Any.areEqual('bonjour', 'bonjour')).equals(true, resO).isOK
          expect(res,templates('"bonjour"','"bonjour"')).to.be.true
          res = expect(Any.areEqual('bonjour', 'bonjour',{strict:true})).equals(true, resO).isOK
          expect(res,templates('"bonjour"','"bonjour"')).to.be.true
        })
        , it('en cas d’approximation de la casse en mode normal', () => {
          res = expect(Any.areEqual('bonjour','BONJOUR')).equals(true, resO).isOK
          expect(res, templates('"bonjour"','"BONJOUR"')).to.be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en cas de string différents', () => {
          res = expect(Any.areEqual('bonjour', 'au revoir')).equals(true, resO).isOK
          expect(res, templates('"bonjour"', '"au revoir"',false,'false')).to.be.false
        })
        , it('en cas de string dont le second est contenu dans le premier', () => {
          res = expect(Any.areEqual('bonjour', 'bonjou')).equals(true, resO).isOK
          expect(res, templates('"bonjour"', '"bonjou"',false,'false')).to.be.false
        })
        , it('en cas de string dont le premier est contenu dans le second', () => {
          res = expect(Any.areEqual('bonjou', 'bonjour')).equals(true, resO).isOK
          expect(res, templates('"bonjou"', '"bonjour"',false,'false')).to.be.false
        })
        , it('en cas de string aussi longs mais avec une lettre de différence', () => {
          res = expect(Any.areEqual('bonjoux', 'bonjour')).equals(true, resO).isOK
          expect(res, templates('"bonjoux"', '"bonjour"',false,'false')).to.be.false
        })
        , it('en cas d’approximation de la casse en mode strict', () => {
          res = expect(Any.areEqual('bonjour','BONJOUR',{strict:true})).equals(true, resO).isOK
          expect(res, templates('"bonjour"','"BONJOUR"',true,'false')).to.be.false
        })
      ])
    ])
    , describe(" pour les ARRAYS", [
      , describe(' produit un SUCCÈS…', [
        , it('en cas d’égalité de deux listes simples', () => {
          res = expect(Any.areEqual([1,2,3],[1,2,3])).equals(true,resO).isOK
          expect(res, templates('[1,2,3]','[1,2,3]')).to.be.true
        })
      ])
      , describe(' produit un ÉCHEC…', [
        , it('en cas de listes contenant les mêmes éléments dans le désordre', () => {
          res = expect(Any.areEqual([1,2,3],[3,2,1])).equals(true,resO).isOK
          expect(res, templates('[1,2,3]','[3,2,1]',false,'false')).to.be.false
        })
        , it('en cas de liste à nombre d’éléments différents', () => {
          res = expect(Any.areEqual([1,2,3,4],[1,2,3])).equals(true,resO).isOK
          expect(res, templates('[1,2,3,4]','[1,2,3]',false,'false')).to.be.false
        })
        // AUTRES ÉCHECS
        // Deux nombres d'éléments différents
      ])
    ])
    , describe(' pour les objects (tables)', [
      , describe(' produit un succès quand…', [
        , it('deux tables simples sont strictement identiques', () => {
          res = expect(Any.areEqual({un:"une",il:"elle"}, {un:"une",il:"elle"})).equals(true, resO).isOK
          expect(res, templates('{un:"une",il:"elle"}','{un:"une",il:"elle"}',true)).to.be.true
        })
        , it("deux tables avec les clés dans un autre ordre", ()=>{
          eva = Any.areEqual({un:"une",il:"elle"}, {il:"elle", un:"une"}, {strict: true})
          res = expect(eva).equals(true, resO).isOK
          expect(res, templates('{un:"une",il:"elle"}','{il:"elle", un:"une"}',true)).be.true
        })
        , it("deux tables complexes identiques", ()=>{
          var table = {il:"elle",lui:"elle"}
          eva = Any.areEqual({un:[1,2,3], deux:table, trois: true}, {un:[1,2,3], deux:table, trois: true}, {strict: true})
          res = expect(eva).equals(true, resO).isOK
          exp1 = '{un:[1,2,3], deux:{il:"elle",lui:"elle"}, trois: true}'
          expect(res,templates(exp1,exp1,true)).to.be.true
        })
      ])
      , describe(' produit un échec quand…',[
        , it('une table définit une clé que l’autre ne contient pas', ()=>{
          eva = Any.areEqual({un:"une",il:"elle"},{un:"une",il:"elle",le:"la"})
          res = expect(eva).equals(true,resO).isOK
          expect(res,templates('{un:"une",il:"elle"}','{un:"une",il:"elle",le:"la"}',false,'false')).to.be.false
        })
        , it("deux tables complexes sont presque identiques ", ()=>{
          var tbl1 = {il:"elle",lui:"elle"}
          var tbl2 = {il:"elle",lui:"elle",le:"la"}
          eva = Any.areEqual({un:[1,2,3], deux:tbl2, trois: true}, {un:[1,2,3], deux:tbl1, trois: true}, {strict: true})
          res = expect(eva).equals(true, resO).isOK
          exp1 = '{un:[1,2,3], deux:{il:"elle",lui:"elle"}, trois: true}'
          exp2 = '{un:[1,2,3], deux:{il:"elle",lui:"elle",le:"la"}, trois: true}'
          expect(res,templates(exp1,exp2,true,'false')).to.be.false
        })
      ])
    ])
  ])
  , describe("::isContainedBy",[
    /*  Le cas des nombres est vite réglé  */
    , describe("pour les NUMBERS",[
      , it("un nombre ne peut pas contenir quelque chose", ()=>{
        res = expect(Any.isContainedBy(2, 12)).equals(true,resO).isOK
        expect(res,tempContain('2','12',false,'false')).to.be.false
      })
    ])
    , describe("pour les ARRAYS",[
      , context("en mode non strict",[
        , it("produit un succès avec un nombre dans une liste", ()=>{
          res = expect(Any.isContainedBy(12, [1,12,3])).equals(true,resO).isOK
          expect(res, tempContain('12','[1,12,3]')).to.be.true
        })
        , it("produit un succès avec un string dans une liste", ()=>{
          res = expect(Any.isContainedBy('douze',['un','douze','trois'])).equals(true,resO).isOK
          expect(res, tempContain('"douze"','["un","douze","trois"]')).to.be.true
        })
        , it("produit un succès avec un boolean dans une liste", ()=>{
          res = expect(Any.isContainedBy(true,['un',true,'trois'])).equals(true,resO).isOK
          expect(res, tempContain('true','["un",true,"trois"]')).to.be.true
        })
        , it("la recherche d'un tableau dans une liste provoque une PTestsError", ()=>{
          tbl = {un:'une'}
          tbl_str = JSON.stringify(tbl)
          res = expect(Any.isContainedBy(tbl,[1,2,3])).equals(true,resO).isOK
          expect(res,tempContain(tbl_str,'[1,2,3]',false,'false')).to.be.false
          expect(Any.containityError,'Any.containityError',{no_values:true}).equals('On ne peut pas encore vérifier l’appartenance d’un tableau dans une liste')
        })
      ])
      , context("en mode strict", [
        // Rien à faire encore, pour le moment, avec le mode non strict car
        // a priori on va utiliser la méthode `indexOf`. Le mode strict sera
        // utilisable lorsqu'on passera chaque valeur de liste
      ])
    ])
    , describe("pour les TABLES",[
      , context("en mode non strict",[
        , it("une table ne peut pas contenir un nombre (=> failure)", ()=>{
          res = expect(Any.isContainedBy(12,{un:'une'})).equals(true,resO).isOK
          expect(res,tempContain('12','{un:"une"}',false,'false')).to.be.false
          expect(Any.containityError, 'Any.containityError', {no_values:true}).equals('Un object ne peut contenir un number')
        })
        , it("une table ne peut pas contenir un string (=> failure)", ()=>{
          res = expect(Any.isContainedBy('str',{un:"str"})).equals(true,resO).isOK
          expect(res,tempContain('"str"','{un:"str"}',false,'false')).to.be.false
          expect(Any.containityError, 'Any.containityError', {no_values:true}).equals('Un object ne peut contenir un string')
        })
        , it("une table contient une autre table quand les clés et les valeurs concordent", ()=>{
          tbl = {un:"une",il:"elle",le:"la"}
          tbl_str = JSON.stringify(tbl)
          res = expect(Any.isContainedBy({le:"la"}, tbl)).equals(true,resO).isOK
          expect(res, tempContain('{le:"la"}', tbl_str)).to.be.true
        })
        , it("une table ne contient pas une autre table quand au moins une clé ne concordent pas", ()=>{
          tbl = {un:"une",il:"elle",le:"la"}
          tbl_str = JSON.stringify(tbl)
          tbl2 = {il:"elle",au:"à la"}
          tbl2_str = JSON.stringify(tbl2)
          res = expect(Any.isContainedBy(tbl2,tbl)).equals(true,resO).isOK
          expect(res, tempContain(tbl2_str,tbl_str,false,'false')).to.be.false
          expect(Any.containityError,'Any.containityError',{no_values:true}).equals('La table ne contient pas la clé "au"')
        })
        , it("une table ne contient pas une autre table si les valeurs ne concordent pas", ()=>{
          tbl = {un:"une",il:"elle",le:"la", au:"à la"}
          tbl_str = JSON.stringify(tbl)
          tbl2 = {il:"elle",au:"à le"}
          tbl2_str = JSON.stringify(tbl2)
          res = expect(Any.isContainedBy(tbl2,tbl)).equals(true,resO).isOK
          expect(res, tempContain(tbl2_str,tbl_str,false,'false')).to.be.false
          expect(Any.containityError,'Any.containityError',{no_values:true}).equals('La valeur de la clé "au" dans la table est « à la », pas « à le »')
        })
      ])
      , context("en mode strict",[
        // Les valeurs fournies peuvent être min/maj
      ])
    ])
    , describe("pour les STRINGS",[
      , context("en mode non strict",[
        , it("retourne true pour un string entièrement contenu dans un autre", ()=>{
          res = expect(Any.isContainedBy('perce','apercevoir')).equals(true, resO).isOK
          expect(res,tempContain('"perce"','"apercevoir"')).to.be.true
        })
        , it("retourne true pour un string contenu par la fin", ()=>{
          res = expect(Any.isContainedBy('voir','apercevoir')).equals(true, resO).isOK
          expect(res,tempContain('"voir"', '"apercevoir"')).to.be.true
        })
        , it("retourne true pour un string contenu par le début", ()=>{
          res = expect(Any.isContainedBy('aper','apercevoir')).equals(true, resO).isOK
          expect(res,tempContain('"aper"', '"apercevoir"')).to.be.true
        })
        , it("retourne true pour un string entièrement contenu dans un autre, quelle que soit la casse", ()=>{
          res = expect(Any.isContainedBy('PERCE','apercevoir')).equals(true, resO).isOK
          expect(res,tempContain('"PERCE"','"apercevoir"')).to.be.true
        })
      ])
      , context("en mode strict",[
        , it("retourne true pour un string entièrement contenu dans un autre et identique", ()=>{
          res = expect(Any.isContainedBy('perce','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"perce"','"apercevoir"',true)).to.be.true
        })
        , it("retourne false pour un string entièrement contenu dans un autre, mais d'une autre casse", ()=>{
          res = expect(Any.isContainedBy('PERCE','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"PERCE"','"apercevoir"',true,'false')).to.be.false
        })
        , it("retourne true pour un string contenu par la fin dans un autre et identique", ()=>{
          res = expect(Any.isContainedBy('voir','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"voir"','"apercevoir"',true)).to.be.true
        })
        , it("produit un échec pour un string contenu par la fin dans un autre mais autre casse", ()=>{
          res = expect(Any.isContainedBy('VOIR','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"VOIR"','"apercevoir"',true,'false')).to.be.false
        })
        , it("retourne true pour un string contenu par le début dans un autre et identique", ()=>{
          res = expect(Any.isContainedBy('aper','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"aper"','"apercevoir"',true)).to.be.true
        })
        , it("produit un échec pour un string contenu par le début mais d'une autre casse", ()=>{
          res = expect(Any.isContainedBy('Aper','apercevoir',{strict:true})).equals(true, resO).isOK
          expect(res,tempContain('"Aper"','"apercevoir"',true,'false')).to.be.false
        })
      ])
    ])
  ])
])








// describe('Instance Any', [
//   describe("#class",[
//     , it("retourne 'number' avec un entier", ()=>{
//       expect(new Any(12).class, 'new Any(12).class').equals('number')
//     })
//     , it("ne retourne pas 'nombre' avec un entier", ()=>{
//       expect(new Any(12).class, 'new Any(12).class').not.equals('nombre')
//     })
//     , it("retourne 'number' avec un flottant", ()=>{
//       expect(new Any(12.3).class, 'new Any(12.3).class').equals('number')
//     })
//     , it("ne retourne pas 'nombre' avec un flottant", ()=>{
//       expect(new Any(12.3).class, 'new Any(12.3).class').not.equals('nombre')
//     })
//     , it("retourne 'string' avec une chaine", ()=>{
//       expect(new Any('chaine').class, 'new Any("chaine").class').equals('string')
//     })
//     , it("ne retourne pas 'chaine' avec une chaine", ()=>{
//       expect(new Any('chaine').class, 'new Any("chaine").class').not.equals('chaine')
//     })
//     , it("retourne 'boolean' avec true", ()=>{
//       expect(new Any(true).class, 'new Any(true).class').equals('boolean')
//     })
//     , it("ne retourne pas 'trueClass' avec true", ()=>{
//       expect(new Any(true).class, 'new Any(true).class').not.equals('trueClass')
//     })
//     , it("retourne 'boolean' avec false", ()=>{
//       expect(new Any(false).class, 'new Any(false).class').equals('boolean')
//     })
//     , it("ne retourne pas 'falseClass' avec false", ()=>{
//       expect(new Any(false).class, 'new Any(false).class').not.equals('falseClass')
//     })
//     , it("retourne 'function' avec une fonction", ()=>{
//       expect(new Any(function(){}).class, 'new Any(function(){}).class').equals('function')
//     })
//     , it("ne retourne pas 'fiction' avec une fonction", ()=>{
//       expect(new Any(function(){}).class, 'new Any(function(){}).class').not.equals('fiction')
//     })
//   ])
// ])
