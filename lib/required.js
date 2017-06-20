/*

  Cette classe est à charger par tout module

  @usage

    const
        path        = require('path')
      , {remote}    = require('electron')
      , {app}       = remote.require('electron')
      , APP_PATH    = app.getAppPath()
      , requirejs   = require('requirejs')

      requirejs(
        [path.join(APP_PATH,'lib','required.js')],
        (Rq) {

          ... code ici ...
          Rq.log('Un message dans le console principale')
        }
      )
*/
// const
//       {remote}  = require('electron')
//     , {app}     = require('electron')

const
    ipc = require('electron').ipcRenderer

class Required {

  static get module_name () { return 'Module Required' }

  /**
  * Pour toujours écrire le message dans la console principale
  **/
  static log (message, objet) {
    ipc.send('message', {message: message, objet: objet})
  }

  /**
  * Définit les raccourcis claviers courant
  **/
  static defineKBShortcuts ( KBShortcuts )
  {
    this.log('Je définis la méthode onkeyup')
    window.onkeyup = KBShortcuts.onkeyup
  }

}

define([],function(){return Required})
