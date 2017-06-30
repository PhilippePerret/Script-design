/*

  Premier grand test visant à tester le module et la classe Store

*/
// Le module testé
let
    Store = require_module('lib/utils/store_class.js')
  , fs    = require('fs-extra')
  , path  = require('path')
  , val

let store = new Store('test/fichier_store_test')


// ---------------------------------------------------------------------
//  Méthodes fonctionnelles

function storeExp(){ return expect(store).asInstanceOf(Store) }

// Pour faire une nouvelle instance de store
function newStore(){
  let ns = new Store('test/fichier_store_test')
  log("ID du nouveau Store", ns.id)
  log("Data du nouveau store", ns.data)
  return ns
}
// Récupérer le contenu actuel du fichier
function getDataInDataFile() {
  return JSON.parse(fs.readFileSync(store.fpath,{encoding:'utf8'}))
  // return require(store.fpath) // NE LIS PAS À CHAQUE FOIS
}
// Enregistrer l'intégralité du fichier
function createDataFileWithData(obj){
  removeFileDataIfExists()
  let code = JSON.stringify(obj)
  fs.writeFileSync(store.fpath, code)
}

function removeFileDataIfExists()
{
  if(fs.existsSync(store.fpath)){ fs.removeSync(store.fpath) }
}
// À faire avant de jouer tous les cas suivants
beforeAll( () => {
  removeFileDataIfExists()
})

//  / fin méthodes fonctionnelles
// ---------------------------------------------------------------------


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
        expect(store.get('key-test-set'), {only_on_fail:true}).to.be.undefined
        val = String(new Date())
        store.set('key-test-set', val)
        expect(store.get('key-test-set'),"store.get('key-test-set')").to.return(val)
        expect(store.data, 'store.data',{no_values:true}).to.contain({'key-test-set': val})
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
        removeFileDataIfExists()
        let newValue = String(new Date())
        createDataFileWithData({'test-data': newValue})
        store = newStore()
        expect(store.data, 'store.data',{no_values:true}).to.contain({'test-data': newValue})
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
      // Si le dossier existe déjà, on le détruit
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

describe("La class Store",[
  , describe("méthode de classe ::newId",[
    , it("retourne chaque fois un nouvel identifiant", ()=>{
      delete Store._lastId
      expect(Store.newId(),'Store.newID()').to.return(1)
      expect(Store.newId(),'Store.newID()').to.return(2)
      expect(Store.newId(),'Store.newID()').to.return(3)
    })
  ])
])
