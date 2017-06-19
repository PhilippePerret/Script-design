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

  // --- Syntaxe 1 ---
  it('affiche une fenêtre de démarrage conforme', function(){
    return app.client.getWindowCount().then(function(count){
      expect(count).to.equal(1)
    })
  })

  it('affiche le titre de l’application', function(){
    return app.client.getText('#titre').then( (titre) => {
      expect(titre).to.equal('Script Design')
    })
  });

  // --- Syntaxe 2 ---
  it('affiche une page de démarrage conforme', function(){
    // NOTE Le chainage des tests, ici, n'est possible que grâce à la
    // constante `setupApp` ci-dessus envoyé après app.start()
    return app.client.getWindowCount().should.eventually.equal(1)
      .browserWindow.isVisible().should.eventually.be.true
      .isVisible('#logo-app').should.eventually.be.true
      .isVisible('#sous-titre').should.eventually.be.true
      .isVisible('#titre').should.eventually.be.true
      .getText('#titre').should.eventually.equal('Script Design')
  });


  it('permet de passer à l’application avec la touche RETURN', function(){
    return app.client.getWindowCount().should.eventually.equal(1)
      .click('#titre').pause(1000)
      .getWindowCount().should.eventually.equal(2)
  });

})
