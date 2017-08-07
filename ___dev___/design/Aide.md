# Aide/Manuel de Script-design

## Créer un lien vers une portion de l'aide (ancre) {#create_lien_to_anchor_in_help}

```js

return ipc.send('want-help', { current_window: '<nom dossier courant>' })

```

C'est la méthode appelée automatiquement quand on clique sur la touche `@` sur une fenêtre quelconque, sauf contre définition.

On peut fournir une ancre à atteindre à l'aide de :

```js

return ipc.send('want-help', { current_window: 'projet', anchor: '#ancre' })

```

## Fichier d'aide

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
