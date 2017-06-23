log('-> store_spec.js')



requirejs(
  [
      path.join(C.LIB_UTILS_FOLDER,'utests_methodes.js')
    , path.join(C.LIB_UTILS_FOLDER,'store.js')
  ],function(
      UTests
    , Store
  ){
    Store.setup({app: app})
    let store = new Store('test/test')

    // describe('L’instance Store', store)
    //   .respondTo('#data')

    describe('L’instance Store')
      .it('répond à la méthode #get', function(){
        return isFunction(store.get)
      })
      .it('répond à la méthode #set', function(){
        return isFunction(store.set)
      })
      .it('répond à la méthode #data', function(){
        return isObject(store.data)
      })
      .it('produit une erreur avec la méthode #not_a_fonction', function(){
        return isFunction(store.not_a_fonction)
      })


    try{

      if (false) { throw new Error("Ça n'est pas juste")}
    }
    catch(erreur)
    {
      DOM.create('div',{class:'error', in:'retours-tests', inner: erreur})
    }

  }
)


log('<- store_spec.js')
