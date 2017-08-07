const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , C               = require(path.join(app.getAppPath(),'lib','constants.js'))

const ipc   = require('electron').ipcRenderer

const
    AIDE_FOLDER         = path.join(C.VIEWS_FOLDER,'aide')
  , AIDE_JS_FOLDER      = path.join(AIDE_FOLDER,'js')
  , AIDE_API_PATH       = path.join(AIDE_JS_FOLDER,'api.js')
  , AIDE_SHORTCUTS_PATH = path.join(AIDE_JS_FOLDER,'shortcuts.js')

requirejs(
  [
      C.LOG_MODULE_PATH
    // ---- Cette fenêtre ---
    , AIDE_API_PATH
    , AIDE_SHORTCUTS_PATH
  ]
, function(
    log
  // --- Cette fenêtre ---
  , AideAPI
  , AideShortcuts
){

  global.LIB_UTILS_JS     = path.resolve('./lib/utils')
  global.FOLDER_COMMON_JS = path.resolve('./__windows__/_common_/js')
  global.UI     = require(path.join(FOLDER_COMMON_JS,   'ui.js'))
  global.DOM    = require(path.join(LIB_UTILS_JS,       'dom_class.js'))
  global.log    = log

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
    AideAPI.afficheAideFor(data.current_window, data)
  })

}// fin fonction requirejs
)
