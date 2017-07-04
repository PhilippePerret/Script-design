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
          // , x:                (baseXY.baseW - 900) / 2
          , y:                baseXY.baseY //+ 100
          , resizable:        true
          , movable:          true
          , maximizable:      true
          , devTools:         false
        }
      , 'aide': {
            name:             'aide'
          , width:            900
          , height:           700
          , x:                baseXY.baseX + baseXY.baseW - 800
          , y:                baseXY.baseY
          , resizable:        false
          , movable:          true
          , minimizable:      true
          , maximizable:      false
          , devTools:         false
        }
        // Fenêtre pour un projet
      , 'projet':{
            name:             'projet'
          , width:            1500
          , height:           baseXY.baseH - 100
          , x:                baseXY.baseX
          , y:                baseXY.baseY
          , resizable:        false
          , movable:          true
          , minimizable:      true
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

  get id () {
    if ( undefined === this._id && this.instance ) { this._id = this.instance.id }
    return this._id
  }
  get name () { return this.data_window.name }
  // Index de la fenêtre
  // Défini seulement si la fenêtre est déjà créée (elle peut être
  // hidée)
  get index ()  { return this._index  }
  set index (v) { this._index = v     }
  // @return l'instance BrowserWindow de la fenêtre
  get instance () {
    if ( undefined === this._instance )
    {
      console.log(`-> Instanciation de la fenêtre ${this.name}…`)
      this._instance = new BrowserWindow(this.data_window)
      this._id = this._instance.id

      // On ouvrir les outils de développement si nécessaire
      // Il suffit de mettre devTools à true dans les données
      if ( this.devTools )
      {
        this._instance.webContents.openDevTools()
      }

      this._instance
      .on('close', (evt) => {
        // À la fermeture, on doit retirer cette fenêtre
        Window.remove(this)
      })
      .on('hide', (evt) => {
        Window.on_hide(this)
      })
      .on('show', (evt) => {
        Window.on_show(this)
      })
      .on('focus', (evt) => {
        Window.on_focus(this)
      })
      // console.log(`… OK (fenêtre ${this.name} instanciée)`)
    }
    return this._instance
  }
  get data_window () { return DATA_WINDOWS[this.relpath] }
  get devTools    () { return true === this.data_window.devTools }

  open () {
    this.instance.loadURL(`file://${this.path}`)
    this.opened = true
    Window.add(this) // pas d'event 'open' (seulement 'ready-to-show', mais pas appelé)
    return this
  }

  close (callb) {
    // console.log(`-> close de ${this.relpath}`)
    this.instance.close()
    this.opened = false
    if ( 'function' === typeof callb ) { callb.call() }
  }

  /**
  * Cacher la fenêtre. On peut donner dans @callb l'ouverture
  * d'une autre fenêtre pour que les deux fenêtres ne se chevauchent pas,
  * si nécessaire.
  **/
  hide (callb) {
    this.instance.hide()
    if ( 'function' === typeof callb ) { callb.call() }
    return this
  }

  show ( callb ) {
    if ( ! this.opened ) { this.open() }
    try
    {
      this.instance.show()
    }
    catch(err)
    {
      if(this.opened){
        this.opened = false
        delete this._instance
        return this.show(callb)
      }
    }
    if ( 'function' === typeof callb ) { callb.call() }
    return this
  }

  // @return true si la fenêtre est la fenêtre courante, false dans le
  // cas contraire.
  // @usage     if ( window.isCurrent() ) { ... }
  isCurrent ()
  {
    Window.current && this.id === Window.current.id
  }

  // Quelques raccourcis pratiques
  isVisible () { return this.instance.isVisible() }
  isFocused () { return this.instance.isFocused() }


  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  // Dictionnaire de toutes les fenêtres construites (opened), avec en
  // clé l'identifiant BrowserWindow de la fenêtre et en value l'instance
  // Window (cette classe)
  static get windows ()
  {
    if ( undefined === this._windows ) { this._windows = {} }
    return this._windows
  }
  // La liste des instances Window (cette classe), dans l'ordre de leur
  // création.
  static get list ()
  {
    if ( undefined === this._list ) { this._list = [] }
    return this._list
  }
  /**
  *   Méthode principale qui ouvre une fenêtre. +pathname+ doit correspondre
  *   à un fichier à la racine de ./__windows__/ par exemple 'aide' ou 'projets'
  **/
  static show (pathname, callb)
  {
    let window_id
    let window
    if ( undefined === this._pathname2id )
    {
      // => Toute première fenêtre à être montrée
      this._pathname2id = {}
    }
    if ( undefined === this._pathname2id[pathname] )
    {
      // => C'est une nouvelle fenêtre
      window = new Window(pathname)
      window_id = window.id
      this._pathname2id[pathname] = window_id
    }
    else
    {
      window_id = this.idOfpathname(pathname)
      window = this._windows[window_id]
    }
    window.show(callb)

  }
  static idOfpathname(pathname)
  {
    return this._pathname2id[pathname]
  }
  static hide ( pathname, callb )
  {
    let window_id = this.idOfpathname(pathname)
    if ( undefined === window_id || undefined === this._windows[window_id] )
    {
      throw `Malheureusement, la fenêtre ${pathname} est inconnue. Impossible de la cacher.`
    }
    else
    {
      this._windows[window_id].hide(callb)
    }
  }

  static focusNext ()
  {
    console.log('-> Window::focusNext')
    // let all = BrowserWindow.getAllWindows()
    //
    // all.map( (win) => {
    //   console.log(`= Fenêtre ${win.id} =`)
    //   console.log(`  Visible ? ${win.isVisible()}`)
    //   console.log(`  Focus ? ${win.isFocused()}`)
    //   console.log(`  Minimized ? ${win.isMinimized()}`)
    //   console.log(`  getTitle ? ${win.getTitle()}`)
    // })
    console.log(`Nombre de fenêtres courantes : ${this.list.length}`)
    let windows_count = this.list.length
    if ( windows_count == 0 ) { return }
    let
        icurrent  = this.current.index
      , found     = false
      , i         = icurrent + 1

    for(; i < windows_count ; ++i)
    {
      console.log(`i = ${i} (fenêtre ${this.list[i].name} - visible ? ${this.list[i].isVisible()})`)
      if ( this.list[i].isVisible() )
      {
        found = this.list[i]
        break
      }
    }
    if ( !found )
    {
      for(i=0; i<icurrent; ++i)
      {
        console.log(`i = ${i} (fenêtre ${this.list[i].name} - visible ? ${this.list[i].isVisible()})`)
        if ( this.list[i].isVisible() )
        {
          found = this.list[i]
          break
        }
      }
    }
    if ( found )
    {
      found.instance.focus()
    }
    else
    {
      console.error("ERREUR : Impossible de trouver une fenêtre à activer…")
    }
    console.log('<- Window::focusNext')
  }

  /** ---------------------------------------------------------------------
    *
    *   Gestion de l'ensemble des fenêtres
    *
    * Permet de tenir à jour leur ordre et leur état.
    * La liste _list contient toutes les fenêtres ouvertes, en indiquant
    * si la fenêtre est show(ed) ou hide(d).
    *
  *** --------------------------------------------------------------------- */

  // @return l'instance Window de la fenêtre courante
  // Renvoie toujours un élément car s'il n'y a pas de fenêtre, on affiche
  // le screensplash
  static get current () {
    if ( ! this._current ) { this.show('screensplash') }
    return this._current
  }
  // Met la fenêtre +window+ en fenêtre courante
  static set current (window)
  {
    this._current = window
    console.log(`Fenêtre courante mise à #${window.id}-${window.name}.`)
  }

  static updateCurrent(window)
  {
    let courante = BrowserWindow.getFocusedWindow()
    if ( courante )
    {
      this.current = this.windows[courante.id]
    }
    else
    {
      this.current = null
    }
  }

  // Ajoute une fenêtre qui vient d'être construite
  // Noter que c'est la méthode open qui appelle cette méthode, mais que la fenêtre
  // n'est mise en fenêtre courante que lorsqu'elle est "showed". Donc ici, on la rentre
  // dans la liste, mais elle n'a pas encore d'index de visibilité
  static add ( window )
  {
    if ( undefined === this._list ) {
      this._list    = []
      this._windows = {}
    }
    window.index = this._list.length
    this._list.push(window)
    this._windows[window.id] = window

    console.log(`[Window::add] Fenêtre ${window.id}-${window.name} ajoutée à list et windows.`)
    console.log(`Window.list contient ${Window.list.length} fenêtre(s)`)
  }

  // Quand une fenêtre est montrée (show) elle devient la fenêtre courante
  // QUESTION Est-ce qu'il ne faudrait pas modifier son index pour la mettre
  // devant ?
  static on_show(window)
  {
    this.current = window
  }
  static on_focus(window)
  {
    this.current = window
  }
  // Quand une fenêtre est hidée, si elle était la fenêtre courante, il faut
  // redéfinir la fenêtre courante
  static on_hide(window)
  {
    if ( window.isCurrent() ) { this.updateCurrent() }
  }

  // Supprime une fenêtre, mais pas forcément la dernière
  static remove(window, callb)
  {
    console.log(`-> Window::remove(${window.id} (${window.name}))`)
    let window_was_current = !!window.isCurrent()

    // On supprime la fenêtre de la liste
    this._list.splice( window.index, 1 )
    window.index = null
    console.log(`Window.list contient ${this.list.length} fenêtre(s)`)

    // Si la fenêtre était la fenêtre courante, on doit actualiser la
    // fenêtre courante en prenant la première des dernières fenêtre affichée
    if ( window_was_current )
    {
      this.updateCurrent()
    }
    if ( 'function' === typeof callb ) { callb.call() }
  }
}



define(
  [],
  function(){
    return Window
  }
)
