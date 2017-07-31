/*

  Test de la class Store
  ----------------------
  Gestion des fichiers

*/
class Owner {
  constructor (storeAffixe)
  {
    this.storeAffixe = storeAffixe
  }
  get data () { return this._data }
  set data (v){ this._data = v    }
  get store ()
  {
    this._store || ( this._store = new Store(this.storeAffixe, this) )
    return this._store
  }
}

let owner = new Owner('projet_exemple/pourtest')
let store = new Store('projet_exemple/pourtestsansowner')
let store_with_owner = new Store('projet_exemple/pourtest', owner)

function deleteFiles ()
{
  if (fs.existsSync(store.path)) {fs.unlinkSync(store.path)}
  if (fs.existsSync(store_with_owner.path)) {fs.unlinkSync(store_with_owner.path)}
}

// Pour exposition sur tout le test
let res, h

describe.only('Class Store', function () {


  describe('Classe', function () {
    it("existe", function(){
      expect('undefined'===typeof(Store)).to.be.false
    })
  }) // /fin comme Classe


  describe('Instance', function () {

    describe('@path', function () {
      it("est une propriété", function(){
        expect(store.path).to.not.be.undefined
      })
      it("retourne le path du store", function(){
        expect(typeof store.path).to.equal('string')
        expect(store.path.endsWith('projet_exemple/pourtestsansowner.json')).to.be.true
      })
    });
    describe('#saveSync', function () {
      it("répond", function(){
        expect(store).to.respondsTo('saveSync')
      })
      it("enregistre les données de façon synchrone", function(){
        deleteFiles()
        expect(fs.existsSync(store_with_owner.path)).to.be.false
        owner.data = {une:'donnée', pour:'voir'}
        // ======> TEST <==========
        store_with_owner.saveSync()

        // ======== VÉRIFICATIONS =========
        expect(fs.existsSync(store_with_owner.path)).to.be.true
        saved_data = JSON.parse(fs.readFileSync(store_with_owner.path,'utf8'))
        expect(saved_data).to.deep.equal(owner.data)
      })
      it("met la donnée modified du propriété à false", function(){
        owner.modified = true
        store_with_owner.saveSync()
        expect(owner.modified).to.be.false
      })
    })

    describe('#loadSync', function () {
      it("répond", function(){
        expect(store).to.respondsTo('loadSync')
      })
      describe('lecture de données', function () {
        before(function () {
          // ========= PRÉPARATION ==========
          h = {"un":"1", "deux":"2"}
          owner.data = h
          owner.store.saveSync()
          owner.data = undefined

          // ========> TEST <==========
          res = owner.store.loadSync()
        });
        it("met les données dans le data de l'owner", function(){
          expect(owner.data).to.deep.equal(h)
        })
        it("retourne les données", function(){
          expect(res).to.deep.equal(h)
        })
        it("met le loading du store à false à la fin", function(){
          expect(owner.store.loading).to.be.false
        })
        it("met le loading du owner à false à la fin", function(){
          expect(owner.loading).to.be.false
        })
      });
    })

    describe('#load', function () {
      it("répond", function(){
        expect(store).to.respondsTo('load')
        expect(owner.store).to.respondsTo('load')
      })
      it("retourne une Promise", function(){
        expect(store.load()).to.be.instanceOf(Promise)
      })
      it("charge de façon asynchrone", function(){
        // Il faut mettre un code important dans le fichier
        let h = '' ; i = 1
        while( h.length < 1000000 ) {
          h += h + String(i * ++i)
        }
        owner.data = h
        owner.store.saveSync()

        expect(owner.store.loading).to.be.false

        res = owner.store.load()
          .then( () => {
            expect(owner.store.loading).to.be.false
            expect(owner.loading, 'le loading du owner devrait être false').to.be.false
          })
        // Ne fonctionne pas si ça va trop vite
        expect(owner.store.loading).to.be.true
        expect(owner.loading, 'le loading du owner devrait être true').to.be.true
        return res
      })
      it("charge bien les données voulues", function(){

        // ======= PRÉPARATION ==========
        h = {"now": moment().format(), "pourvoir":"Les data voulues"}
        owner.data = h
        owner.store.saveSync()
        owner.data = undefined

        // ========= VÉRIFICATION ===========
        expect(owner.data).to.be.undefined

        // ========> TEST <===========
        return owner.store.load()
          .then( () => {
            expect(owner.data).to.deep.equal(h)
          })
      })
    })

    describe('#save', function () {
      it("répond", function(){
        expect(store).to.respondsTo('save')
      })
      it("retourne une promise", function(){
        expect(store.save()).to.be.instanceOf(Promise)
      })
      it("enregistre de façon asynchrone", function(){
        let h = '' ; i = 1
        while( h.length < 1000000 ) {
          h += h + String(i * ++i)
        }
        owner.data = h

        let res = owner.store.save()
          .then( () => {
            expect(owner.saving, 'le saving du owner devrait être false').to.be.false
            expect(owner.store.saving, 'le saving du store devrait être false').to.be.false
          })
        expect(owner.saving, 'le saving du owner devrait être true').to.be.true
        expect(owner.store.saving, 'le saving du store devrait être true').to.be.true
        return res
      })
      it("met la propriété modified du propriétaire à false à la fin", function(){
        owner.data = 12
        owner.modified = true
        expect(owner.modified).to.be.true
        // =========> TEST <=========
        return owner.store.save()
          .then( () => {
            expect(owner.modified, 'le modified du owner devrait être false').to.be.false
          })
      })
      it("crée le fichier", function(){
        deleteFiles()
        owner.data = 12
        expect(fs.existsSync(owner.store.path)).to.be.false
        return owner.store.save()
          .then( () => {
            expect(fs.existsSync(owner.store.path)).to.be.true
          })
      })
      it("écrit dans le fichier les bonnes données", function(){
        h = {'now':moment().format(), pour:'voir les bonnes données'}
        let hjson = JSON.stringify(h)
        owner.data = h

        return owner.store.save()
          .then( () => {

            let code = fs.readFileSync(owner.store.path, 'utf8')
            expect(code).to.equal(hjson)

          })

      })
    });

  }) // /fin comme Instance

})
