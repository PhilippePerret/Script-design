const
    ipc = require('electron').ipcRenderer

/**
* Méthode appelée lorsque l'on clique sur la page, pour passer à la suite
**/
function suite (){
  console.log('suite() cliqué')
  ipc.send('close-screensplash')
}
