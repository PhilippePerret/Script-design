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

  it('permet de passer à l’écran des projets', function(){
    return app.client.getWindowCount().should.eventually.equal(1)
      .isVisible('#titre').should.eventually.be.true
      .click('#titre').pause(1000)
      .getWindowCount().should.eventually.equal(2)
  })

  it('une fenêtre des projets conforme s’affiche', function(){
    // return app.client.waitForVisible('#ul-projets')
    //   .isVisible('#ul-projets').should.eventually.be.true
    return app.browserWindow.isVisible('#ul-projets').should.eventually.be.true
    
  })

})
