/** ---------------------------------------------------------------------
  *
  *   DÉMARRAGE DE L'APPLICATION
  *
*** --------------------------------------------------------------------- */

class App {

  static start () {
    // Au lancement de l'application, on affiche la fenêtre de démarrage
    // Note : la méthode `show` appelle la méthode `open` quand la fenêtre
    // n'est pas encore construite.
    return new Promise(function(resolve, reject)
    {
      requirejs(
        ['./lib/main/window'],
        function(Window)
        {
          // Pour pouvoir l'envoyer l'envoyer aux modules
          App.Window = Window

          // Au lancement de l'application, on affiche la fenêtre de démarrage
          // Note : la méthode `show` appelle la méthode `open` quand la fenêtre
          // n'est pas encore construite.
          Window.show('screensplash', () => {
            // Pour le moment, on patiente une seconde avant de fermer
            // le screensplash
            let timer = setTimeout(() => {
              clearTimeout(timer)
              Window.hide('screensplash')


              /*
                  Pour choisir la fenêtre à ouvrir tout de suite après le
                  screensplash, décommenter une ligne ci-dessous et commenter
                  la fenêtre à supprimer.
               */
              Window.show('projets')
              // Window.show('aide')

              resolve()
            }, 400 /*Temps entre l'écran de démarrage et la fenêtre projets*/)
          })
        } // fonction requirejs
      ) // requirejs
    }) // return new Promise
  } // start()



  static showAide ()
  {
    requirejs(
      ['./lib/main/window'], // => Window
      function(Window){
        Window.show('aide')
      }
    )
  }


  static focusNext ()
  {
    requirejs(
      ['./lib/main/window'], // => Window
      function(Window){
        Window.focusNext()
      }
    )
  }

  static OpenProjectWindow (data)
  {
    requirejs(
      [
        './lib/main/window'// => Window
      ],
      function(Window){
        console.log('J’ouvre une fenêtre du projet choisi',data.projet_id)
        Window.show('projet')
      }
    )
  }

}// class App


define(
  [],
  function(){
    return App
  }
)
