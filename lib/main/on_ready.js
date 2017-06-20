const
    {app}           = require('electron')
  , requirejs       = require('requirejs')
  , ipc             = require('electron').ipcMain



function onAppReady () {
  requirejs(
    ['./lib/main/startup'],
    function(Startup){
      Startup.start_application()
        .then(
          (succes) => {
            console.log("L'application est prête (avec then)")
          },
          (failure) => {
            console.log(`L'ouverture a rencontré l'erreur : ${failure}`)
          }
        )
    }
  )

  // Appelé par la méthode Rq.log des renderers
  ipc.on('message', (evt, data) => {
    if ( undefined === data.objet )
    {
      console.log(data.message)
    }
    else
    {
      console.log(data.message, data.objet)
    }
  })
}

module.exports = onAppReady
