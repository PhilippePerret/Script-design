const
      electron        = require('electron')
    , {BrowserWindow} = require('electron')
    , {app}           = require('electron')
    , path            = require('path')
    , APP_PATH        = app.getAppPath()
    , LIB_FOLDER      = path.join(APP_PATH,'lib')
    , WINDOWS_FOLDER  = path.join(APP_PATH,'__windows__')


/** ---------------------------------------------------------------------
  *
  *     DONNÉES DE TOUTES LES FENÊTRES
  *
*** --------------------------------------------------------------------- */
const
    baseXY = require(path.join(LIB_FOLDER,'utils','baseXY'))()
    // Sont définis ci-dessous toutes les données générales des différentes
    // fenêtres qui peuvent être ouvertes dans l'application.
  , DATA_WINDOWS = {
        'screensplash': {
            name:           'screensplash'
          , x:              baseXY.baseX + (baseXY.baseW / 4)
          , y:              baseXY.baseY + 200
          , width:          baseXY.baseW / 2
          , height:         baseXY.baseH / 2
          , resizable:      true // toujours, pour le moment
          , movable:        false
          , maximizable:    false
          , fullscreenable: false
          , frame:          false
          , titleBarStyle:  'hidden'
          , devTools:       false,  // si false, impossible d'utiliser les outils
          , show:           false
        }
}


class Window {

  constructor ( window_relpath )
  {
    this.relpath  = window_relpath
    this.path     = path.join(WINDOWS_FOLDER,`${window_relpath}.ejs`)
  }

  get name () { return this.data_window.name }
  get instance () {
    if ( undefined === this._instance )
    {
      this._instance = new BrowserWindow(this.data_window)
      this._instance.on('close', (evt) => {
        Window.remove(this)
      })
    }
    return this._instance
  }
  get data_window () { return DATA_WINDOWS[this.relpath] }

  open () {
    this.instance.loadURL(`file://${this.path}`)
    return this.show()
  }
  show() {
    this.instance.show()
    Window.add(this)
    return this
  }


  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */


  static current () {
    console.log('-> Window::current')
    if ( ! this._current )
    {
      // Quand aucune fenêtre n'est définie comme fenêtre courante, c'est le
      // panneau de démarrage qu'on ouvre
      this.screensplash.open()
    }
    console.log('<- Window::current')
    return this._current
  }

  // Quand on ouvre une fenêtre. Ça l'enregistre dans la liste des
  // fenêtre ouverte et ça la met toujours en fenêtre courante.
  static add (wind)
  {
    console.log('-> Window.add')
    if ( undefined === this._list ) { this._list = [] }
    this._list.push(wind)
    this._current = wind
    console.log('<- Window.add')
  }
  // Quand on ferme une fenêtre
  static removeLast(window)
  {
    this._list.pop()
  }
  // Supprime une fenêtre, mais pas forcément la dernière
  static remove(window)
  {
    console.log(`* Fermeture de la fenêtre ${window.name}…`)
    let new_list = []
    this._list.map( (w) => {
      if ( w.name === window.name ) {
        console.log('… OK')
        return false
      }
      new_list.push(w)
    })
    this._list = new_list
  }

  /**
  * ==== Les différentes fenêtres ====
  **/
  // @return l'écran (Window) de démarrage
  static get screensplash () {
    if ( undefined === this._screensplash )
    {
      this._screensplash = new Window('screensplash')
      console.log('this._screensplash:')
      console.log(this._screensplash)
    }
    return this._screensplash
  }

}






define(
  [],
  function(){
    return Window
  }
)
