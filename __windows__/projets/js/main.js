console.log('-> projets/js/main.js')
const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , CONSTANTS_PATH  = path.join(app.getAppPath(),'lib','constants.js')
  , C               = require(CONSTANTS_PATH)

// Pour lancer les tests d'intégration
global.PTEST_IT = true

const
    PROJET_FOLDER     = path.join(C.VIEWS_FOLDER,'projets')
  , PROJET_JS_FOLDER  = path.join(PROJET_FOLDER,'js')
  , PROJET_API_PATH   = path.join(PROJET_JS_FOLDER,'api.js')
  , PROJET_KBS_PATH   = path.join(PROJET_JS_FOLDER,'kb_shortcuts.js')

  requirejs(
    [
        C.LOG_MODULE_PATH
      , C.DOM_MODULE_PATH
      , C.COMMON_UI_MODULE_PATH
      // ---- Cette fenêtre ---
      , PROJET_API_PATH
      , PROJET_KBS_PATH
    ]
  , function(
      log
    , DOM
    , UI
    // --- Cette fenêtre ---
    , Projet
    , KBShortcuts
  ){

    let timer = setInterval(
      function()
      {
        if ( 'complete' === document.readyState )
        {
          clearInterval(timer)
          // ======= LA PAGE EST PRÊTE ========

          UI.setup({
              window:               'projets'
            , default_field:        'projet_titre'
            , api:                  Projet
            , KeyboardObject:       KBShortcuts
          })
          Projet.UISetUp()

          log('=== Fenêtre PROJETS prête ===')

          return true // module principal => rien à retourner

          // ======= FIN DE LA PAGE EST PRÊTE ========
        }
      }// callback setInterval
    )// /setInterval


    if ( PTEST_IT )
    {
      log('---> Lancement des tests d’intégration')
      require(path.join(C.LIB_UTILS_FOLDER,'ptests'))
      PTests.on_start()
      PTestContainer.init()
      // Chargement de la feuille de test
      // TODO L'idéal sera d'avoir juste à faire :
      //  require('ptests')
      //  PTests.run_file('path/to/file')
      require(path.join(C.PTESTS_FOLDER,'integration','essai_integ_spec'))
      PTestContainer.define_tab_levels()
      if ('function' === typeof PTests.beforeAll){PTests.beforeAll.call()}
      PTestContainer.run_lists()
      if ('function' === typeof PTests.afterAll){PTests.afterAll.call()}

      log('<--- /Lancement des tests d’intégration')
    }

  }
)


console.log('<- projets/js/main.js')
