/** ---------------------------------------------------------------------
  *   Module principal lancé pour l'application.
  *
*** --------------------------------------------------------------------- */
const
      electron  = require('electron')
    , {app}     = require('electron')
    , requirejs = require('requirejs')


app.on('ready', () => {

  console.log('Je suis prête.')
})
.on('all-windows-close', () => {
  console.log('Je quitte l’application suite à la fermeture de toutes les fenêtres.')
  app.quit()
})
