const
    {remote}          = require('electron')
  , {app}             = remote.require('electron')
  , ipc               = require('electron').ipcRenderer
  , glob              = require('glob')
  , fs                = require('fs')
  , path              = require('path')
  , requirejs         = require('requirejs')
  , CONSTANTS_PATH    = path.join(app.getAppPath(),'lib','constants.js')
  , C                 = require(CONSTANTS_PATH)
  , TESTS_MODULE_PATH = path.join(C.LIB_UTILS_FOLDER,'utests.js')
  // Ce module
  , TESTS_FOLDER      = path.join(C.VIEWS_FOLDER,'tests')
  , SPECS_FOLDER      = path.join(TESTS_FOLDER,'specs')


function log(mess, obj){
  ipc.send('message',{message:mess, objet:obj})
}
// const PTest = require(path.join(C.LIB_UTILS_FOLDER,'PTests'))

// On ouvre une fenêtre pour y lancer nos tests
// --------------------------------------------
let {BrowserWindow} = remote.require('electron')
const fenPTests = new BrowserWindow({x: -1000, y: 0, width:1500, heigth:500, show: false, devTools:true})
// fenPTests.openDevTools()
fenPTests.loadURL('file:///'+path.join(C.LIB_UTILS_FOLDER,'PTests.html'))
fenPTests.on('ready-to-show', (evt) => {
  log('-> ready-to-show')
  fenPTests.show()
})
