## Options des PTests {#options_ptests}

### Option `test_folder`, dossier des tests {#option_test_folder}

L'option `test_folder` permet de définir le dossier de tests qu'il faut jouer. L'option definit le path relatif depuis le dossier des tests (par défaut, depuis le dossier `./tests/ptests`)

```js

PTests.options.test_folder = 'autotests'

```

Noter que si l'[option `test_file`](#option_test_file) est définie, elle est prioritaire sur cette option.

### Option `test_file`, fichier de test {#option_test_file}

L'option `test_file` permet de définir un fichier de test particulier à jouer. L'option définit le chemin relatif depuis le dossier des tests (par défaut, le dossier `./tests/ptests/`).

Cette valeur est prioritaire sur l'[option `test_folder`](#option_test_folder)

```js

PTests.options.test_file = 'unit/mon_test_spec.js'

```


### Option `one_line_describe`, aspect des descriptions {#aspect_describe}

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
