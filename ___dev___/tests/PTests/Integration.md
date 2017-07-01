# Tests d'intégration {#integration_tests}

Avec PTests, on peut à doublement parler de « Tests d'intégration ». Intégration à double sens :

* on teste le comportement de l'application en mode utilisation,
* les tests sont intégrés dans l'application (ça n'est plus un framework qui encapsule l'application).

## Mise en place des tests {#misenplaceintegrationtests}

Pour tester une page, il suffit d'ajouter ce code à l'intérieur :

```js

// En haut du fichier
require(path.join(C.LIB_UTILS_FOLDER,'ptests'))

// Au moment où l'application est prête
PTests.run_file('relative/path/from/ptests/folder/spec.js'))

```

Ces deux lignes vont lancer le test qui se trouve dans le fichier `spec.js`.

## Composition des fichiers de test d'intégration {#fichier_ptests_integration_composition}

Les tests s'écrivent exactement de la même façon que les tests unitaires. Par exemple :

```js

describe("Ma fenêtre", [
  context("Quand on l'ouvre sans rien faire",[
    it("présente un bon menu", {
      expect('menu').asNode.to.exist
    })
  ])
])

```

## Contrôle de l'interface {#controle_interface_integration}

On peut contrôler l'interface de la façon la plus simple en utilisant `document`.

Par exemple, pour mettre une valeur dans un champ input-text d'identifiant `mon-champ` :

```js

let maValeur = "Une valeur à mettre dans le champ"
document.getElementById('mon-champ').value = maValeur
expect('mon-champ').asNode.to.has.value(maValeur) // => true

```

## Simplification du code avec l'objet DOM {#simplifiercodeavecdomintegration}

Pour pouvoir utiliser les méthodes DOM (comme par exemple `DOM.get(....)`) il suffit, en début de page de test, d'écrire :

```js

PTests.expose_dom_methods()

```

Noter que cette ligne NE peut PAS être ajoutée dans `spec_helper.js`. Elle n'aurait aucun effet.

Noter cependant que cette option exposera aussi `DOM` pour l'application, et que l'on ne verra peut-être les fichiers qui oublient de requérir cet objet.

## Méthodes de test propres à l'intégration {#integrationtestsmethodes}

Les méthodes concernent principalement le DOM. On peut utiliser :

```js

  expect('element').asNodeId ...
  // => vise l'élément #element

  expect('element').asNode ...
  // => id

  expect('element').asNodeClass ...
  // => vise le (premier) élément de class 'element' (.element)

  expect('element').asNodeTag ...
  // => vise le (premier) élément portant le tag 'element'
  // Par exemple :
  expect('body').asNodeTag.to.have.attribute({'onload':'onLoad()'})

```

### `attribute` ou `attributes` pour la valeur des attributs {#tests_attribute_on_dom}

```js

  expect('element').asNode.to.have.attributes({id:'element','data-value':'diagramme'})

```

S'emploie indifféremment au pluriel (`attributes`) ou au singulier (`attribute`).


### `exist` pour vérifier l'existence {#tests_exist_on_dom}

```js

  expect('element').asNode.to.exist
  // => True s'il existe dans le document un élément #element

```

Noter que cette méthode est synchrone pour le moment, donc il faut gérer l'asynchronicité dans l'application.
