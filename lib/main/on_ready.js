const
    {app}           = require('electron')
  , requirejs       = require('requirejs')

function onAppReady () {
  requirejs(['./lib/main/window'],
  function(Window){
    console.log('Window.current:')
    console.log(Window.current)
    if ( Window.screensplash && 'function' == typeof Window.screensplash.open )
    {
      Window.screensplash.open()
    }
    else
    {
      app.quit()
      console.warn('Impossible d’ouvrir la fenêtre de démarrage…')
    }

  })
  console.log('Je suis prête')
}

module.exports = onAppReady
