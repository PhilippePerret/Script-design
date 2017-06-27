/** ---------------------------------------------------------------------
  *
  *   Grand test de la class Any qui permet de procéder à toutes les
  *   comparaison dans PTests
  *
*** --------------------------------------------------------------------- */

// Le module testé
let
  Any = require_module('./lib/utils/PTests_Any')


PTests.options.one_line_describe = true

let res, opts, eva, exp1, exp2
    , resO = {not_a_test: true}

function templates(act, exp, strict, val)
{
  if ( undefined === val ) val = 'true'
  return {template:{success:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}produit ${val}`, failure:`Any.areEqual(${act},${exp}) ${strict?'en mode strict ':''}aurait dû produire ${val}…`}}
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
])
