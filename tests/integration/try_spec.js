const
    {Application} = require('spectron')
  , assert        = require('assert')
  , {expect}      = require('chai')


describe('Le démarrage de l’application', function(){
  this.timeout(10000)
  beforeEach(function(){
    this.app = new Application({
          path: '/usr/local/bin/electron'
        , env: {SPECTRON: true}
        , args: ['.']
      })
    return this.app.start()
  })
  afterEach(function(){
    if ( this.app && this.app.isRunning() )
    {
      return this.app.stop()
    }
  })

  it('affiche la fenêtre de démarrage', function(){
    return this.app.client.getWindowCount().then(function(count){
      expect(count).to.equal(1)
    })
  })

})
