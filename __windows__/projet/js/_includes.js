global.fs     = require('fs')
global.moment = require('moment')


// const
//
//     APP_PATH        = path.resolve('.')
//   , CONSTANTS_PATH  = path.join(APP_PATH,'lib','constants.js')
//
// const C = require(CONSTANTS_PATH)

// let requirejs = require('requirejs')
//
// requirejs(
//   [
//     C.LOG_MODULE_PATH
//   ],
//   function(
//     log
//   ){
//
//     global.log = log
//
//
//     inclusionsReady = true
//   }
// )
// /*
//   Noter qu'on passe ici avant que le requirejs ci-dessus ait terminé
// */


global.LIB_UTILS_JS      = path.resolve('./lib/utils')
global.FOLDER_COMMON_JS  = path.resolve('./__windows__/_common_/js')
global.CONSTANTS_PATH    = path.resolve('./lib/constants.js')

global.C              = require(CONSTANTS_PATH)

global.DOM            = require(path.join(LIB_UTILS_JS,       'dom_class.js'))
global.Store          = require(path.join(LIB_UTILS_JS,       'store_class.js'))
global.Projet         = require(path.join(PROJET_JS_FOLDER,   'projet.js'))
global.ProjetUI       = require(path.join(PROJET_JS_FOLDER,   'projet_ui.js'))
global.PanProjet      = require(path.join(PROJET_JS_FOLDER,   'panprojet.js'))
global.Parags         = require(path.join(FOLDER_COMMON_JS,   'parags.js'))
global.Parag          = require(path.join(FOLDER_COMMON_JS,   'parag.js'))
global.Relatives      = require(path.join(PROJET_JS_FOLDER,   'relatives.js'))
global.ProjetOptions  = require(path.join(PROJET_JS_FOLDER,   'options.js'))
global.Tabulator      = require(path.join(C.COMMON_JS_FOLDER, 'tabulators.js'))
global.KBShortcuts    = require(path.join(PROJET_JS_FOLDER,   'kbshortcuts.js'))

global.UILog          = ProjetUI.log.bind(ProjetUI)

require(path.join(PROJET_JS_FOLDER,'_handy_functions.js'))
