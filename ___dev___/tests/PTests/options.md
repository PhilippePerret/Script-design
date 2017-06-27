# Options des PTests {#options_ptests}



## Option `one_line_describe`, aspect des descriptions {#aspect_describe}

Par défaut, la hiérarchie des `describe` et des `context` s'affichent de cette manière :

```js

  Class Any
    ::areEqual
      Pour les nombres
        produit un succès…
          pour deux nombres égaux // le it
          OK, ...

```

En utilisant `PTests.options.one_line_describe =  true` en début de feuille de test ou dans le spec-helper, on obtient cet affichage :

```js

  Class Any::areEqual pour les nombres produit un succès…
        pour deux nombres égaux
        OK, ...

```

Noter que toutes les descriptions (`describe` et `context`) sont concaténées sans espace (notamment pour obtenir des formules comme `class Any::areEqual`) et qu'il faut donc les ajouter dans les descriptions (ce qui ne posera aucun problème en cas d'affichage normal).
