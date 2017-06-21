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
          , width:          550 //baseXY.baseW / 2
          , height:         420 // baseXY.baseH / 2
          , x:              baseXY.baseX + ((baseXY.baseW - 550) / 2) + 200
          , y:              baseXY.baseY
          , resizable:      true // toujours, pour le moment
          , movable:        false
          , maximizable:    false
          , minimizable:    false
          , fullscreenable: false
          , frame:          false
          , titleBarStyle:  'hidden'
          , devTools:       false // si false, impossible d'utiliser les outils
          , show:           false
        }
      , 'projets': {
            name:             'projets'
          , width:            900 // baseXY.baseW - 100
          , height:           600 // baseXY.baseH - 200
          , x:                (baseXY.baseW - 900) / 2
          , y:                baseXY.baseY //+ 100
          , resizable:        true
          , movable:          true
          , maximizable:      true
          , devTools:         true
        }
      , 'aide': {
            name:             'aide'
          , width:            800
          , height:           600
          , x:                baseXY.baseX
          , y:                baseXY.baseY
          , resizable:        false
          , movable:          true
          , minimizable:      true
          , maximizable:      false
          , devTools:         true
        }
}

/**
* /Fin de la définition de toutes les fenêtres
* ---------------------------------------------------------------------
**/


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
      console.log(`-> Instanciation de la fenêtre ${this.name}…`)
      this._instance = new BrowserWindow(this.data_window)

      // On ouvrir les outils de développement si nécessaire
      // Il suffit de mettre devTools à true dans les données
      if ( this.devTools )
      {
        this._instance.webContents.openDevTools()
      }

      this._instance.on('close', (evt) => {
        Window.remove(this)
        delete Window[`_${this.name}`]
      })
      console.log(`… OK (fenêtre ${this.name} instanciée)`)
    }
    return this._instance
  }
  get data_window () { return DATA_WINDOWS[this.relpath] }
  get devTools    () { return true === this.data_window.devTools }

  open () {
    this.instance.loadURL(`file://${this.path}`)
    this.opened = true
    return this
  }

  close () {
    this.hide()
    this.instance.close()
    this.opened = false
    delete Window[`_${this.name}`]
  }
  /**
  * Cacher la fenêtre. On peut donner dans @callb l'ouverture
  * d'une autre fenêtre pour que les deux fenêtres ne se chevauchent pas,
  * si nécessaire.
  **/
  hide (callb) {
    console.log(`* hide de fenêtre ${this.name}…`)
    this.instance.hide()
    Window.remove(this, callb)
    console.log(`  … OK (fenêtre ${this.name} hidée)`)
    return this
  }

  show ( callb ) {
    console.log(`* show de fenêtre ${this.name}…`)
    if ( ! this.opened ) { this.open() }
    this.instance.show()
    Window.add(this)
    console.log(`  … OK (fenêtre ${this.name} showée)`)
    if ( 'function' === typeof callb ) { callb.call() }
    return this
  }


  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */


  /**
  *   Méthode principale qui ouvre une fenêtre. +pathname+ doit correspondre
  *   à un fichier à la racine de ./__windows__/ par exemple 'aide' ou 'projets'
  **/
  static show (pathname, callb)
  {
    if ( undefined === this._windows )
    {
      this._windows = {}
    }
    if ( undefined === this._windows[pathname] )
    {
        this._windows[pathname] = new Window(pathname)
    }
    this._windows[pathname].show(callb)
  }
  static hide ( pathname, callb )
  {
    if ( undefined === this._windows[pathname] )
    {
      throw `Malheureusement, la fenêtre ${pathname} est inconnue. Impossible de la cacher.`
    }
    else
    {
      this._windows[pathname].hide(callb)
    }
  }

  static current () {
    console.log('-> Window::current')
    if ( ! this._current )
    {
      // Quand aucune fenêtre n'est définie comme fenêtre courante, c'est le
      // panneau de démarrage qu'on ouvre
      this.open('screensplash')
    }
    console.log('<- Window::current')
    return this._current
  }

  // Quand on ouvre une fenêtre. Ça l'enregistre dans la liste des
  // fenêtre ouverte et ça la met toujours en fenêtre courante.
  static add (wind)
  {
    console.log(`-> Window.add(fenêtre ${wind.name})`)
    if ( undefined === this._list ) { this._list = [] }
    this._list.push(wind)
    this._current = wind
    console.log(`<- Window.add (fenêtre ${wind.name})`)
  }
  // Quand on ferme une fenêtre
  static removeLast(window)
  {
    this._list.pop()
    this.init_current()
  }
  // Supprime une fenêtre, mais pas forcément la dernière
  static remove(window, callb)
  {
    if ( ! this._list )
    {
      this._list = []
    }
    else
    {
      let window_index = this._list.indexOf(window.name)
      this._list.splice( window_index, 1 )
    }
    this.init_current()
    if ( 'function' === typeof callb ) callb.call()
  }
  // Initialiser la dernière fenêtre en la mettant en fenêtre courante
  static init_current () {
    if ( this._list.length )
    {
      this._current = this._list[this._list.length - 1]
    }
    else
    {
      this._current = null
    }
  }
}



define(
  [],
  function(){
    return Window
  }
)
