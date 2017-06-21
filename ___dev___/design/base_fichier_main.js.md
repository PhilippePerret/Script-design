# Base d'un fichier main.js de fenêtre


~~~javascript

console.log('-> projets/js/main.js')
const
    {remote}        = require('electron')
  , {app}           = remote.require('electron')
  , path            = require('path')
  , requirejs       = require('requirejs')
  , CONSTANTS_PATH  = path.join(app.getAppPath(),'lib','constants.js')
  , C               = require(CONSTANTS_PATH)

// Mettre ici les constantes propres à la fenêtre
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
              // Mettre ici le champ par défaut à focusser
              default_field:        'projet_titre'
              // Mettre ici l'API gérant la fenêtre
            , api:                  Projet
              // Mettre ici l'objet gérant les méthodes de KeyUp
            , KeyboardObject:       KBShortcuts
          })

          // Initialiser l'API si nécessaire
          Projet.UISetUp()

          log('=== Fenêtre PROJETS prête ===')

          return true // module principal => rien à retourner

          // ======= FIN DE LA PAGE EST PRÊTE ========
        }
      }// callback setInterval
    )// /setInterval

  }
)

console.log('<- projets/js/main.js')


~~~
