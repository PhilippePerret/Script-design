/*

  Premier grand test visant à tester le module et la classe Store

*/
// Le module testé
let
    Store = require_module('lib/utils/store_class.js')
  , fs    = require('fs-extra')
  , path  = require('path')


let store = new Store('test/fichier_store_test')

function storeExp(){ return expect(store).asInstanceOf(Store) }

// Pour faire une nouvelle instance de store
function newStore(){ return new Store('test/fichier_store_test') }
// Récupérer le contenu actuel du fichier
function getDataInDataFile() { return require(store.fpath) }
// Enregistrer l'intégralité du fichier
function createDataFileWithData(obj){
  let code = JSON.stringify(obj)
  fs.writeFileSync(store.fpath,code)
}

// À faire avant de jouer tous les cas suivants
beforeAll( () => {
  fs.removeSync(store.fpath)
})


describe("Class Store",[
  , describe("méthodes ",[
    , describe("#get",[
      , it("répond aux instances", ()=>{
        storeExp().to.respond_to('get')
      })
      , it("permet d'obtenir une valeur", ()=>{
        // On commence par enregistrer le fichier avec une valeur
        let newValue = String(new Date())
        createDataFileWithData({'test-get': newValue})
        store = newStore()
        expect(store.get('test-get'), 'la valeur « gettée »').to.equal(newValue, 'la valeur dans le fichier')
      })
    ])
    , describe("#set",[
      , it("répond aux instances", ()=>{
        storeExp().to.respond_to('set')
      })
      , it("permet de définir une valeur qui sera enregistrée dans le fichier de données", ()=>{
        pending()
      })
    ])
    , describe("#save",[
      , it("répond aux instances", ()=>{
        storeExp().respond_to('save')
      })
      , it("permet d'enregistrer des données", ()=>{
        store = newStore()
        let newdate = String(new Date())
        store.set('nouvelle-date', newdate)
        store.save()
        // <=== /TSET
        let datainfile = getDataInDataFile()
        log("Données dans le fichier");log(datainfile)
        log("Données dans l'instance");log(store.data)
        expect(datainfile['nouvelle-date'],'la nouvelle donnée dans le fichier').to.equal(newdate, 'la nouvelle donnée définie')
      })
    ])
    , describe("@data",[
      , it("retourne les données du fichier", ()=>{
        store = newStore()
        let newValue = String(new Date())
        createDataFileWithData({'test-data': newValue})
        expect(store.data).to.equal({'test-data': newValue})
      })
    ])
    , describe("@fpath",[
      , it("retourne le path du fichier de storage", ()=>{
        expect(store.fpath).to.contain('-TEST/test/fichier_store_test.json')
      })
    ])
  ])
])

describe("Méthode fonctionnelle Store",[
  , describe(" #ensureFolder",[
    , it("s'assure que les dossiers existent sur le path et construit la hiérarchie au besoin", ()=>{
      // TODO Si le dossier existe déjà, on le détruit
      if ( fs.existsSync(store.folder) )
      {
        // Prudence : le path doit être valide
        if (store.folder.split(path.sep).length < 4)
        { throw new Error(`Désolé, mais par prudence, je ne peux pas détruire le dossier ${store.folder} (hiérarchie trop courte)`) }
        else { fs.removeSync(store.folder) }
      }
      expect(store.folder,{only_on_fail:true}).asFolder.to.not.exist
      // ===> TEST
      store.ensureFolder()
      // <=== TEST
      let tpls = {success:'le dossier des Data a bien été (re)construit', failure:'le dossier des data aurait dû être reconstruit.'}
      expect(store.folder,{template:tpls}).asFolder.to.exist
    })
  ])
])
