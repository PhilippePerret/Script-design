/*
*/

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

}

define([],function(){return Required})
