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
        ipc.on('show-projet-id', (evt, data) => {

          Projet.UIprepare()
          Projet.load(data)

          let curproj = Projet.current

          curproj.options.build()

          // --------- T A B U L A T O R S -------------

          // On prépare les tabulators
          let currentpan = curproj.current_panneau
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
              , 'stats'       : curproj.afficherStatistiques.bind(curproj)
              , 'cutreturn'   : currentpan.cutParagByReturn.bind(currentpan)
              , default       : currentpan.defaultCommandMethod.bind(currentpan)
            }
            , 'options-projet':{
              enter_method: curproj.define_options.bind(curproj)
            }
          }
          // Prépation des tabulateurs
          Tabulator.setup()

        })

        log('=== Fenêtre PROJET prête ===')


        // ---------- TESTS D'INTÉGRATIONS ----------
        PTEST_IT = false
        // PTEST_IT = true

        if ( PTEST_IT )
        {
          require(path.join(C.LIB_UTILS_FOLDER,'ptests'))
          // PTests.run_folder(path.join('integration','Projet'))
          PTests.run_file(path.join('integration','Projet','affichage_panneaux_spec.js'))
        }

        return true // module principal => rien à retourner

        // ======= FIN DE LA PAGE EST PRÊTE ========
      }
    }// callback setInterval
  )// /setInterval

})
