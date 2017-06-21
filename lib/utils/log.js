const
    ipc = require('electron').ipcRenderer

define(
  [],
  function(){

    let log = function (message, objet) {
      ipc.send('message', {message: message, objet: objet})
    }

    return log
  }
)
