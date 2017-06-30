/** ---------------------------------------------------------------------
  *   Module principal lancé pour l'application.
  *
*** --------------------------------------------------------------------- */
const
      electron      = require('electron')
    , {app}         = require('electron')
    , requirejs     = require('requirejs')
    , ejs           = require('ejs-electron')


/*
  Pour faire des essais rapide, on peut excommenter la
  ligne suivante et décommenter le on'ready' en dessous.
*/
app.on('ready', require('./lib/main/on_ready'))
.on('all-windows-close', () => {
  console.log('Je quitte l’application suite à la fermeture de toutes les fenêtres.')
  app.quit()
})

console.log('<- script-design.js')
