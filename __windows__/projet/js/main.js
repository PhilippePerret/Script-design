global.path               = require('path')
global.PROJET_JS_FOLDER   = path.resolve('./__windows__/projet/js')

const
    remote          = require('electron').remote
  , app             = remote.require('electron').app
  , APP_PATH        = app.getAppPath()
  , ipc             = require('electron').ipcRenderer
  , requirejs       = require('requirejs')
  , C               = require(path.join(APP_PATH,'lib','constants.js'))


requirejs(
  [
      C.LOG_MODULE_PATH
  ]
, function(
    log
){

  require(path.join(PROJET_JS_FOLDER,'_includes.js'))

  global.log = log

  // On donne l'app à Store, pour qu'il sache où chercher les fichiers.
  Store._app = app

  let timer = setInterval(
    function()
    {
      if ( 'complete' === document.readyState)
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
        // On peut alors initier l'édition du projet
        ipc.on('show-projet-id', (evt, data) => {

          // ---- I N S T A N C I A T I O N   D U   P R O J E T ----

          const projet = new Projet(data.projet_id)
          Projet.current = projet

          // ---- C H A R G E M E N T   D U   P R O JE T ------

          projet.PRload()

          .then( () => {

            // --------- T A B U L A T O R S -------------

            // On prépare les tabulators
            let currentpan = projet.current_panneau
            // DÉFINITION DE LA MAP DES TABULATORS
            Tabulator.Map = {
              "boutons-panneaux":{
                  maxSelected: 2
                , enter_method: Projet.activatePanneauByTabulator.bind(Projet)
              }
              , "operations":{
                  'synchronize' : currentpan.synchronize.bind(currentpan)
                , 'export'      : currentpan.export.bind(currentpan)
                , 'print'       : currentpan.print.bind(currentpan)
                , 'stats'       : projet.afficherStatistiques.bind(projet)
                , 'cutreturn'   : currentpan.cutParagByReturn.bind(currentpan)
                , default       : currentpan.defaultCommandMethod.bind(currentpan)
              }
              , 'options-projet':{
                enter_method: projet.define_options.bind(projet)
              }
            }
            // Prépation des tabulateurs
            Tabulator.setup()

            return Promise.resolve()
          })
          .catch( err => { throw err } )

        })

        log('=== Fenêtre PROJET prête ===')


        return true // module principal => rien à retourner

        // ======= FIN DE LA PAGE EST PRÊTE ========
      }
    }// callback setInterval
  )// /setInterval

})
