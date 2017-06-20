/** ---------------------------------------------------------------------
  *
  *   DÉMARRAGE DE L'APPLICATION
  *
*** --------------------------------------------------------------------- */
class Startup {

  static start_application () {
    // Au lancement de l'application, on affiche la fenêtre de démarrage
    // Note : la méthode `show` appelle la méthode `open` quand la fenêtre
    // n'est pas encore construite.
    return new Promise(function(resolve, reject)
    {
      requirejs(
        ['./lib/main/window'],
        function(Window) {
          // Au lancement de l'application, on affiche la fenêtre de démarrage
          // Note : la méthode `show` appelle la méthode `open` quand la fenêtre
          // n'est pas encore construite.
          Window.screensplash.show( () => {
            // Pour le moment, on patiente une seconde avant de fermer
            // le screensplash
            let timer = setTimeout(() => {
              clearTimeout(timer)
              Window.screensplash.hide()
              Window.projets.show()
              resolve()
            }, 400 /*Temps entre l'écran de démarrage et la fenêtre projets*/)
          })
        } // fonction requirejs
      ) // requirejs
    }) // return new Promise
  } // start_application()
}// class Startup


define(
  [],
  function(){
    return Startup
  }
)
