console.log('-> projets/js/main.js')
const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , C               = require(path.join(app.getAppPath(),'lib','constants.js'))

// Pour lancer les tests d'intégration
const PTEST_IT = false

const
    PROJET_FOLDER     = path.join(C.VIEWS_FOLDER,'projets')
  , PROJET_JS_FOLDER  = path.join(PROJET_FOLDER,'js')
  , PROJET_API_PATH   = path.join(PROJET_JS_FOLDER,'api.js')
  , PROJET_KBS_PATH   = path.join(PROJET_JS_FOLDER,'kb_shortcuts.js')

  requirejs(
    [
        C.LOG_MODULE_PATH
      , C.DOM_MODULE_PATH
      // ---- Cette fenêtre ---
      , PROJET_API_PATH
      , PROJET_KBS_PATH
    ]
  , function(
      log
    , DOM
    // --- Cette fenêtre ---
    , Projet
    , KBShortcuts
  ){

    global.log = log
    global.DOM = DOM
    global.UI = require(path.join(C.COMMON_JS_FOLDER,'ui.js'))

    let timer = setInterval(
      function()
      {
        if ( 'complete' === document.readyState )
        {
          clearInterval(timer)
          // ======= LA PAGE EST PRÊTE ========

          UI.setup({
              window:               'projets'
            , default_field:        null // 'projet_titre'
            , api:                  Projet
            , KeyboardObject:       KBShortcuts
          })
          Projet.UISetUp()

          log('=== Fenêtre PROJETS prête ===')


          // ---------- TESTS D'INTÉGRATIONS ----------
          if ( PTEST_IT )
          {
            require(path.join(C.LIB_UTILS_FOLDER,'ptests'))
            PTests.run_file(path.join('integration','Projets','create_projet_spec'))
          }


          return true // module principal => rien à retourner

          // ======= FIN DE LA PAGE EST PRÊTE ========
        }
      }// callback setInterval
    )// /setInterval

  }
)


console.log('<- projets/js/main.js')
