const
    {Application}   = require('spectron')
  , assert          = require('assert')
  , chai            = require('chai')
  , {expect}        = require('chai')
  , chaiAsPromised  = require('chai-as-promised')

chai.should()
chai.use(chaiAsPromised)

describe('Le démarrage de l’application', function(){
  this.timeout(10000)
  let app

  // C'est cette méthode, appelée dans start(), qui permet de
  // chainer les tests dans la syntaxe 2 ci-dessous.
  const setupApp = function (app) {
    chaiAsPromised.transferPromiseness = app.transferPromiseness
    return app.client.waitUntilWindowLoaded()
  }

  // Si c'était beforeEach, ça se ferait avant chaque "it"
  before(function(){
    app = new Application({
          path: '/usr/local/bin/electron'
        , env: {SPECTRON: true}
        , args: ['.']
      })
    return app.start().then(setupApp)
  })
  // Si c'était afterEach, ça se ferait après chaque "it"
  after(function(){
    if ( app && app.isRunning() )
    {
      return app.stop()
    }
  })


  /*
    METTRE LES TESTS ICI
   */

})
