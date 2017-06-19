/** ---------------------------------------------------------------------
  *   Module principal lancé pour l'application.
  *
*** --------------------------------------------------------------------- */
const
      electron      = require('electron')
    , {app}         = require('electron')
    , requirejs     = require('requirejs')
    , ejs           = require('ejs-electron')


// let onAppReady = require('./lib/main/on_ready')
app.on('ready', require('./lib/main/on_ready'))
.on('all-windows-close', () => {
  console.log('Je quitte l’application suite à la fermeture de toutes les fenêtres.')
  app.quit()
})

console.log('<- script-design.js')
