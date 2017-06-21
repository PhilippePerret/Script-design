const
    {app}           = require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , ipc             = require('electron').ipcMain
  , LIB_FOLDER      = path.join(app.getAppPath(),'lib')


function onAppReady () {
  requirejs(
    [
        [LIB_FOLDER,'main','app.js'].join(path.sep)
    ],
    function(
        App
    ){
      App.start().then(
        (succes) => {

          /** ---------------------------------------------------------------------
            *
            *   LES RÉCEPTEURS/ÉMETTEURS D'ÉVÈNEMENTS
            *
          *** --------------------------------------------------------------------- */

          // Appelé par la méthode `log` des renderers
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
          .on('want-help', (evt, data) => {
            App.data_help = data
            App.showAide()
          })
          .on('aide-ready', (evt, data) => {
            evt.sender.send('affiche-aide-for', App.data_help)
          })


          /** ---------------------------------------------------------------------
            *
            *   /FIN DES RÉCEPTEURS/ÉMETTEURS D'ÉVÈNEMENTS
            *
          *** --------------------------------------------------------------------- */

          console.log("L'application est prête (avec then)")
        },
        (failure) => {
          console.log(`L'ouverture a rencontré l'erreur : ${failure}`)
        }
      )

    }// /fin main fonction de requirejs
  )// /fin requirejs
}// /function onAppReady

module.exports = onAppReady
