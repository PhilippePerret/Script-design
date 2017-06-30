/*

  Premier grand test visant à tester le module et la classe Store

*/
// Le module testé
let
    Store = require_module('lib/utils/store_class.js')
  , fs    = require('fs-extra')


const store = new Store('test/fichier_store_test')

function storeExp(){ return expect(store).asInstanceOf(Store) }

function getDataInDataFile() {
  return JSON.parse(fs.readFileSync(store.fpath,{encoding:'utf8'}))
}
//
// describe("Class Store",[
//   , describe("méthodes ",[
//     , describe("#get",[
//       , it("répond aux instances", ()=>{
//         storeExp().to.respond_to('get')
//       })
//     ])
//     , describe("#set",[
//       , it("répond aux instances", ()=>{
//         storeExp().to.respond_to('set')
//       })
//       // , it("permet d'enregistrer une nouvelle valeur", ()=>{
//       //
//       // })
//       // , it("permet de modifier une valeur dans le fichier", ()=>{
//       //
//       // })
//     ])
//     , describe("#save",[
//       , it("répond aux instances", ()=>{
//         storeExp().respond_to('save')
//       })
//       , it("permet d'enregistrer des données", ()=>{
//         let newdata = String(new Date())
//         log('newdata = ', newdata)
//         store.set('nouvelle-date', newdata)
//         store.save()
//         let path = store.fpath
//         let dinfile = getDataInDataFile()
//         expect(dinfile['nouvelle-data']).to.equal(newdata)
//       })
//     ])
//     , describe("@data",[
//       , it("retourne les données du fichier", ()=>{
//         expect(store.data).to.equal({})
//       })
//     ])
//     , describe("@fpath",[
//       , it("retourne le path du fichier de storage", ()=>{
//         expect(store.fpath).to.contain('-TEST/test/fichier_store_test.json')
//       })
//     ])
//   ])
// ])

describe("Différentes opérations",[
  , describe("la méthode #ensureFolder",[
    , it("s'assure que les dossiers existent sur le path", ()=>{
      pending()
    })
  ])
])
