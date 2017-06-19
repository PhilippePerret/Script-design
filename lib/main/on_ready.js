const
    {app}           = require('electron')
  , requirejs       = require('requirejs')
  , ipc             = require('electron').ipcMain

function onAppReady () {
  requirejs(['./lib/main/window'],
  function(Window){

    // Au lancement de l'application, on affiche la fenêtre de démarrage
    // Note : la méthode `show` appelle la méthode `open` quand la fenêtre
    // n'est pas encore construite.
    Window.screensplash.show()


    ipc.on('close-screensplash', (evt) => {
      // Appelé lorsque le screensplash se referme (volontairement ou non)
      // Quand on referme le screensplash, on affiche la fenêtre des projets
      console.log('Demande de fermeture du screensplash')
      Window.screensplash.hide(Window.projets.show.bind(Window.projets))
    })


  })
  console.log('Je suis prête')
}

module.exports = onAppReady
