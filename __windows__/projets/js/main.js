const
    {remote}  = require('electron')
  , {app}     = remote.require('electron')
  , path      = require('path')
  , APP_PATH  = app.getAppPath()
  , requirejs = require('requirejs')



requirejs(
  [
      path.join(APP_PATH,'lib','required.js')
    , path.join(APP_PATH,'lib','renderers','ui.js')
    , path.join(__dirname,'projets','js','kb_shortcuts.js')
  ]
  // [path.join(APP_PATH,'lib','required.js')]
  , function(
      Rq
    , UI
    , KBShortcuts)
  {
    let timer = setInterval(
      function()
      {
        if ( 'complete' === document.readyState )
        {
          clearInterval(timer)
          Rq.log(`Le module Rq s'appelle ${Rq.module_name}`)
          Rq.log("La page des projets est prête.")
          Rq.defineKBShortcuts(KBShortcuts)
          // On prépare l'interface
          // On focusse dans le champ pour créer un nouveau projet
          // TODO Plus tard, ça pourra se régler dans les préférences
          // avec la console : 'prefs:focus:liste' quand on se trouve dans
          // cette fenêtre.
          UI.setup({default_field: 'projet_titre'})
        }
      },
      100
    )// /setInterval

  }
)
