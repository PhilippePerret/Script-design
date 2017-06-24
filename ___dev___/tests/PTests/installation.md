

* Créer un fichier `ptests.sh` à la racine contenant :

```bash

#!/bin/sh

# Lanceur des tests
electron ./ptests.js

```

* Rendre ce fichier `ptests.sh` exécutable :

```bash

$ chmod +x ./ptests.sh

```


* Créer le fichier `ptests.js` lancé par `electron` ci-dessus à la racine contenant :

```js

const
      electron      = require('electron')
    , {app}         = require('electron')
    , ipc           = require('electron').ipcMain
    // , requirejs     = require('requirejs')
    // , ejs           = require('ejs-electron')

app.on('ready', (evt) => {
  let PTests = require('./lib/utils/ptests')
  PTests.prepare()
  // Décommenter cette ligne pour tester ptest lui-même
  // PTests.test_ptest()
  ipc.on('ptests-ready', (evt) => {
    console.log("-> on 'ptests-ready', je run les tests")
    PTests.run()
  })
})

```


* Dans `package.json` définir :

```json

  "scripts":{
    ...
    "ptests":"./ptests.sh",
    ...
  }

```


Il suffit à présent de lancer les tests par :

```bash

$ npm run ptests

```
