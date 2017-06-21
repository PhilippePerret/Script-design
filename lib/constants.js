/*

  Définition des constantes pour simplifier le code

*/
class Constantes {



  static get APP_PATH       ()
  {
    if ( undefined === this._app_path ) {
      this._app_path = path.resolve(path.join('.'))
    }
    return this._app_path
  }

  // Les modules à charger partout
  static get DOM_MODULE_PATH ()
  {
    if (undefined === this._dom_module_path ) { this._dom_module_path = path.join(this.LIB_UTILS_FOLDER,'dom.js')}
    return this._dom_module_path
  }

  static get EVENTS_MODULE_PATH ()
  {
    if (undefined === this._events_module_path ) { this._events_module_path = path.join(this.LIB_UTILS_FOLDER,'events.js')}
    return this._events_module_path
  }

  static get COMMON_UI_MODULE_PATH ()
  {
    if ( undefined === this._common_ui_module ) { this._common_ui_module = path.join(this.COMMON_JS_FOLDER,'ui.js') }
    return this._common_ui_module
  }
  static get LOG_MODULE_PATH ()
  {
    if ( undefined === this._log_module_path ) { this._log_module_path = path.join(this.LIB_UTILS_FOLDER,'log.js')}
    return this._log_module_path
  }
  static get SELECT_MODULE_PATH ()
  {
    if ( undefined === this._select_module_path ) { this._select_module_path = path.join(this.LIB_UTILS_FOLDER,'phil-select-menu.js')}
    return this._select_module_path
  }

  static get WINDOW_MODULE_PATH ()
  {
    if ( undefined === this._window_module_path ) { this._window_module_path = path.join(this.LIB_FOLDER,'main','window.js')}
    return this._window_module_path
  }

  // Autres dossiers
  static get LIB_FOLDER     ()
  {
    if (undefined === this._lib_folder) { this._lib_folder = path.join(this.APP_PATH,'lib')}
    return this._lib_folder
  }
  static get LIB_UTILS_FOLDER ()
  {
    if ( undefined === this._lib_js_folder ) { this._lib_js_folder = path.join(this.LIB_FOLDER,'utils') }
    return this._lib_js_folder
  }
  static get VIEWS_FOLDER   ()
  {
    if ( undefined === this._views_folder ) { this._views_folder = path.join(this.APP_PATH,'__windows__') }
    return this._views_folder
  }
  static get COMMON_FOLDER  ()
  {
    if ( undefined === this._common_folder ) { this._common_folder = path.join(this.VIEWS_FOLDER,'_common_') }
    return this._common_folder
  }
  static get COMMON_JS_FOLDER ()
  {
    if ( undefined === this._common_js_folder ) { this._common_js_folder = path.join(this.COMMON_FOLDER,'js') }
    return this._common_js_folder
  }

  static get COMMON_IMG_FOLDER ()
  {
    if ( undefined === this._common_img_folder ) { this._common_img_folder = path.join(this.COMMON_FOLDER,'img') }
    return this._common_img_folder
  }

}

module.exports = Constantes
