console.log('-> projet/js/main.js')
const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , CONSTANTS_PATH  = path.join(app.getAppPath(),'lib','constants.js')
  , C               = require(CONSTANTS_PATH)
  , ipc             = require('electron').ipcRenderer

const
    PROJET_FOLDER     = path.join(C.VIEWS_FOLDER,'projet')
  , PROJET_JS_FOLDER  = path.join(PROJET_FOLDER,'js')
  , PROJET_API_PATH   = path.join(PROJET_JS_FOLDER,'api.js')
  , PROJET_KBS_PATH   = path.join(PROJET_JS_FOLDER,'kbshortcuts.js')

const PTEST_IT = false

requirejs(
  [
      C.LOG_MODULE_PATH
    , C.DOM_MODULE_PATH
    , C.COMMON_UI_MODULE_PATH
    // ---- Cette fenêtre ---
    , PROJET_API_PATH
    , PROJET_KBS_PATH
    , path.join(C.COMMON_JS_FOLDER,'parags_define.js')
    , path.join(C.COMMON_JS_FOLDER,'parag_define.js')
  ]
, function(
    log
  , DOM
  , UI
  // --- Cette fenêtre ---
  , Projet
  , KBShortcuts
  , Parags
  , Parag
){

  global.Projet = Projet
  global.Parags = Parags
  global.Parag  = Parag
  global.DOM    = DOM

  let timer = setInterval(
    function()
    {
      if ( 'complete' === document.readyState )
      {
        clearInterval(timer)
        // ======= LA PAGE EST PRÊTE ========

        UI.setup({
            window:               'projet'
          , default_field:        null
          , api:                  Projet
          , KeyboardObject:       KBShortcuts
        })

        // Dire que la fenêtre est prête, pour pouvoir charger le projet
        // courant
        ipc.send('projet-window-opened')

        // Après avoir envoyé 'projet-window-opened' (cf. ci-dessus),
        // le processus main retourne l'identifiant du projet à voir.
        ipc.on('show-projet-id', (evt, data) => {

          Projet.UIprepare()
          Projet.load(data)

        })

        log('=== Fenêtre PROJETS prête ===')


        // ---------- TESTS D'INTÉGRATIONS ----------
        if ( PTEST_IT )
        {
          require(path.join(C.LIB_UTILS_FOLDER,'ptests'))
          PTests.run_file(path.join('integration','Projet','affichage_projet_spec'))
        }

        return true // module principal => rien à retourner

        // ======= FIN DE LA PAGE EST PRÊTE ========
      }
    }// callback setInterval
  )// /setInterval

})

console.log('<- projet/js/main.js')
