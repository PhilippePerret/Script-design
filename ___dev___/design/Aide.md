# Aide du programme

L'aide d'une fenêtre est automatiquement gérée si :

* il existe un fichier `<dossier fenêtre>/aide.md`,
* la fenêtre utilise `UI.setup(options)` en envoyant `window:<dossier fenêtre>` dans les options.

Exemple :

```

  Soit la fenêtre "projets"

  On trouve les fichiers :

      <app> / __windows__ / projets / aide.md
                          | projets.ejs

```

À l'initialisation :

```js

  // Dans __windows__/projets/js/mains.js

  const
        ...
      , C               = require(path.join(app.getAppPath(),'lib','constants.js'))

  // ... constantes ...
  define(
    [
        ...
      , C.COMMON_UI_MODULE_PATH
        ...
    ],
    function(
        ...
      , UI
        ...
    )
    {
      ...
      UI.setup({
        window: 'projets' // <= Pour que l'aide sache quelle aide ouvrir
        ...
      })
      ...
    }
  )
```
