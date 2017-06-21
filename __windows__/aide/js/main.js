console.log('-> aide/js/main.js')
const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , CONSTANTS_PATH  = path.join(app.getAppPath(),'lib','constants.js')
  , C               = require(CONSTANTS_PATH)

const
    AIDE_FOLDER     = path.join(C.VIEWS_FOLDER,'aide')
  , AIDE_JS_FOLDER  = path.join(AIDE_FOLDER,'js')
  , AIDE_API_PATH   = path.join(AIDE_JS_FOLDER,'api.js')

requirejs(
  [
      C.LOG_MODULE_PATH
    , C.DOM_MODULE_PATH
    , C.COMMON_UI_MODULE_PATH
    // ---- Cette fenêtre ---
    , AIDE_API_PATH
  ]
, function(
    log
  , DOM
  , UI
  // --- Cette fenêtre ---
  , Aide
){

  let timer = setInterval(
    function()
    {
      if ( 'complete' === document.readyState )
      {
        clearInterval(timer)
        // ======= LA PAGE EST PRÊTE ========

        UI.setup({api: Aide})
        log('=== Fenêtre aide prête ===')
        return true // module principal => rien à retourner

        // ======= FIN DE LA PAGE EST PRÊTE ========
      }
    }// callback setInterval
  )// /setInterval

}
)
