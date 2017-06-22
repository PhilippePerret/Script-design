const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , CONSTANTS_PATH  = path.join(app.getAppPath(),'lib','constants.js')
  , C               = require(CONSTANTS_PATH)

const ipc   = require('electron').ipcRenderer

const
    AIDE_FOLDER         = path.join(C.VIEWS_FOLDER,'aide')
  , AIDE_JS_FOLDER      = path.join(AIDE_FOLDER,'js')
  , AIDE_API_PATH       = path.join(AIDE_JS_FOLDER,'api.js')
  , AIDE_SHORTCUTS_PATH = path.join(AIDE_JS_FOLDER,'shortcuts.js')

requirejs(
  [
      C.LOG_MODULE_PATH
    , C.DOM_MODULE_PATH
    , C.COMMON_UI_MODULE_PATH
    // ---- Cette fenêtre ---
    , AIDE_API_PATH
    , AIDE_SHORTCUTS_PATH
  ]
, function(
    log
  , DOM
  , UI
  // --- Cette fenêtre ---
  , AideAPI
  , AideShortcuts
){

  // Pour exposer l'API
  window.AideAPI = AideAPI

  let timer = setInterval(
    function()
    {
      if ( 'complete' === document.readyState )
      {
        clearInterval(timer)
        // ======= LA PAGE EST PRÊTE ========

        UI.setup({window: 'aide', api: AideAPI, KeyboardObject: AideShortcuts})
        log('=== Fenêtre aide prête ===')

        ipc.send('aide-ready')

        return true // module principal => rien à retourner

        // ======= FIN DE LA PAGE EST PRÊTE ========
      }
    }// callback setInterval
  )// /setInterval


  /** ---------------------------------------------------------------------
    *
    *   CAPTEURS D'ÉVÈNEMENTS DE LA FENÊTRE D'AIDE
    *
  *** --------------------------------------------------------------------- */


  ipc.once('affiche-aide-for', (evt, data) => {
    log('Données envoyées à affiche-aide-for', data)
    AideAPI.afficheAideFor(data.current_window)
  })

}// fin fonction requirejs
)
