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

/*
  Pour faire des essais rapide, on peut excommenter la
  ligne suivant et décommenter le on'ready' en dessous.
*/
app.on('ready', require('./lib/main/on_ready'))
// app.on('ready', () => {
//   requirejs(
//     ['./lib/utils/kramdown'],
//     function(Kramdown){
//       console.log(Kramdown.parse(`
// # ceci est un titre {#mon_titre}
//
// Du texte
//
// ## Un autre titre {#pour_voir_lautre}
//
// Encore du texte.
//         `))
//     }
//   )
// })

.on('all-windows-close', () => {
  console.log('Je quitte l’application suite à la fermeture de toutes les fenêtres.')
  app.quit()
})

console.log('<- script-design.js')
