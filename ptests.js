const
      electron      = require('electron')
    , {app}         = require('electron')
    , ipc           = require('electron').ipcMain

app.on('ready', (evt) => {
  let PTests = require('./lib/utils/ptests')
  PTests.prepare()
  ipc.on('ptests-ready', (evt) => {
    if ( true /* TODO Définir comment lancer l'autotest */)
    {
      evt.sender.send('run-tests')
    }
    else
    {
      evt.sender.send('run-autotest')
    }
  })
  .on('message',(e,m,o) => {if(o){console.log(m,o)}else{console.log(m)}})
})
