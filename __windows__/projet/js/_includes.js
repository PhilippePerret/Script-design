global.fs     = require('fs-extra')
global.moment = require('moment')
moment.locale('fr')


/* - Paths principales - */

global.LIB_UTILS_JS     = path.resolve('./lib/utils')
global.FOLDER_COMMON_JS = path.resolve('./__windows__/_common_/js')
global.C                = require(path.resolve('./lib/constants.js'))

/* - Extensions - */

require(path.join(LIB_UTILS_JS,'Number.js'))
require(path.join(LIB_UTILS_JS,'String.js'))
require(path.join(LIB_UTILS_JS,'Object_extension.js'))

/* - Objets de l'application - */

global.UI             = require(path.join(FOLDER_COMMON_JS,   'ui.js'))
global.DOM            = require(path.join(LIB_UTILS_JS,       'dom_class.js'))
global.Events         = require(path.join(LIB_UTILS_JS,       'events.js'))
global.Keyboard       = Events.Keyboard
global.Store          = require(path.join(LIB_UTILS_JS,       'store_class.js'))
global.Projet         = require(path.join(PROJET_JS_FOLDER,   'projet.js'))
global.ProjetUI       = require(path.join(PROJET_JS_FOLDER,   'projet_ui.js'))
global.PanProjet      = require(path.join(PROJET_JS_FOLDER,   'pan_projet.js'))
global.PanData        = require(path.join(PROJET_JS_FOLDER,   'pan_data.js'))
global.Parags         = require(path.join(PROJET_JS_FOLDER,   'parags.js'))
global.Parag          = require(path.join(PROJET_JS_FOLDER,   'parag.js'))
global.ParagTypes     = require(path.join(PROJET_JS_FOLDER,   'parag_types.js'))
global.Relatives      = require(path.join(PROJET_JS_FOLDER,   'relatives.js'))
global.Brins          = require(path.join(PROJET_JS_FOLDER,   'brins.js'))
global.Brin           = require(path.join(PROJET_JS_FOLDER,   'brin.js'))
global.ProjetOptions  = require(path.join(PROJET_JS_FOLDER,   'options.js'))
global.Tabulator      = require(path.join(C.COMMON_JS_FOLDER, 'tabulators.js'))
global.KBShortcuts    = require(path.join(PROJET_JS_FOLDER,   'kbshortcuts.js'))

global.UILog          = ProjetUI.log.bind(ProjetUI)

require(path.join(PROJET_JS_FOLDER,'_handy_functions.js'))
