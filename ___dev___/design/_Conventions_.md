

## Architecture de base

Exemple avec une fenêtre s'appelant `fenetre`

```

  <app> / __windows__ / fenetre / css \
                                      | fenetre.sass
                                      | fenetre.css (fabriqué automatiquement)
                                  js  \
                                      | main.js
                                      | api.js (define FenetreAPI)
                                      | kbshortcuts.js (define KBShortcut)

```

### Détail :

* Chaque fenêtre possède son fichier `ejs` et son dossier à la racine de `__windows__` ([voir ici](#fichier_ejs_et_dossier))
* Le premier fichier javascript appelé est `main.js`. Il se trouve dans `__windows__/<dossier>/js/main.js`. Il est chargé par le code HTML de la page.
* La fenêtre possède une api définie dans `__windows__/<dossier>/js/api.js`. Chargé par `main.js`.
* La fenêtre possède une gestion des raccourcis-clavier définie dans `__windows__/<dossier>/js/kbshortcuts.js`. Chargé par `main.js`.


## Fichier EJS et dossier

Par exemple, pour la fenêtre `projets`

```

  <app>/__windows__/projets.ejs
                    projets/

```


## Chargement du fichier main.js

Chargé par :

```html

  <body>
    ...
    <script type="text/javascript" src="<dossier>/js/main.js"></script>
  </body>

```

### Composition du fichier main.js



```js

// Constantes (les copier de __windows__/projets/js/main.js)

requirejs([
    ...           // <---|
  ],function(     //     |  Chargement librairie et exposition
    ...           // <---|
    , UI
    , KBShortcut
    , FenetreAPI
  ){
    ...
    window.FenetreAPI = FenetreAPI    // exposition de l'API si elle existe

    // Attente de la fin du chargement
    let timer = setInterval(function(){
        if ( 'complete' === document.readyState )
        {
          // On est prêt

          // On définit les données d'initialisation de l'interface
          UI.setup(data_setup)
        }
      },
      100
    )

  }
)
```
