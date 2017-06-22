# Raccourcis-clavier {#keyboard_shortcuts}

## Préambule {#preambule}

L'application `Script-design` est conçue pour être entièrement pilotée par le clavier, sans aucun recours de la souris. Donc les raccourcis-clavier et leur définition jouent un grand rôle dans le design de l'application.

## Définir les raccourcis clavier d'une fenêtre {#define_window_shortcuts}


### Définir la méthode `onkeyup` {#methode_onkey_up}

```js

  class KBObject
  {
    static onkeyup (evt, modeText) // (2)
    {
      switch (evt.key)
      {
        case ...:
          return ... // (3)
      }
      return 'poursuivre' // (1)
    }
  }
```

(1) Il est indispensable de renvoyer 'poursuivre' lorsque la touche n'a pas été captée, pour dire de continuer le test des touches dans le module `UI`, afin de traiter les touches générales.

(2) `modeText` est `true` si on se trouve dans un champ de texte, `false` dans le cas contraire.

(3) Il est indispensable d'utiliser return pour ne pas passer par le `return 'poursuivre'` à la fin qui poursuivrait le test de la touche. Bien sûr, ne pas l'utiliser quand justement il faut un double traitement de la touche.

### Initialiser les raccourcis clavier

Pour que les raccourcis-clavier soient pris en compte, il faut invoquer la méthode `UI.setup` en lui passant l'objet KBObject défini ci-dessus :

```js

// Par exemple dans main.js, le fichier chargé en premier par la page

const
  ...

requirejs(
  [
    ...
    C.UI_MODULE_PATH
    ...
  ], function(
    ...
    UI
    ...
  ){

    if ( 'complete' === document.readyState )
    {

      // =======> DÉFINITION DES RACCOURCIS (ET AUTRES) <==========
      UI.setup({window: '<nom de fenêtre>', KeyboardObject: KBObject})

    }

  }// /fin de fonction de requirejs
)

```
