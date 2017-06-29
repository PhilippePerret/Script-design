/*

  Premier grand test visant à tester le module et la classe Store

*/
let Store = require_module('lib/utils/store_class.js')

let store = new Store('test/fichier_store_test')

function storeExp(){ return expect(store).asInstanceOf(Store) }

describe("Class Store",[
  , describe("méthodes ",[
    , describe("#get",[
      , it("répond aux instances", ()=>{
        storeExp().to.respond_to('get')
      })
    ])
    , describe("#set",[
      , it("répond aux instances", ()=>{
        storeExp().to.respond_to('set')
      })
      // , it("permet d'enregistrer une nouvelle valeur", ()=>{
      //
      // })
      // , it("permet de modifier une valeur dans le fichier", ()=>{
      //
      // })
    ])
    , describe("#save",[
      , it("répond aux instances", ()=>{
        storeExp().respond_to('save')
      })
    ])
    , describe("@data",[
      , it("retourne les données du fichier", ()=>{
        expect(store.data).to.equal({})
      })
    ])
    , describe("@fpath",[
      , it("retourne le path du fichier de storage", ()=>{
        expect(store.fpath).to.contain('-TEST/test/fichier_store_test.json')
      })
    ])
  ])
])
