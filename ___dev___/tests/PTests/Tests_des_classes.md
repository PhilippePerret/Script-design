# Test des classes {#testdesclasses}

Lorsque le constructeur d'une classe n'attend pas d'argument, on peut utiliser simplement dans les tests :

```js

  expect(MaClasse).to.have.instanceMethod('ma_method')

```

Quand le constructeur attend des arguments, il faut utiliser la formule :

```js

  let monInstance = new MaClasse(..args)

  expect(monInstance).asInstanceOf(MaClasse).to.respond_to('ma_methode')

```

## Test de l'existence d'une méthode de classe {#tests_class_method_exists}

```js

expect(MaClasse).to.have.classMethod('ma_method')

// ou

expect(MaClasse).to.respond_to('ma_class_method')
// Car PTests décèle que MaClasse est une classe, pas une instance

```

## Test de l'existence d'une méthode d'instance {#test_instance_method_exists}


```js

expect(MaClasse).to.have.instanceMethod('mon_instance_method')

// ou

let maclasse = new MaClasse(..args)
expect(maclasse).asInstanceOf(MaClasse).to.respond_to('mon_instance_method')

```


## Classes dans module {#classe_defined_in_modules}

Pour l'instance, puisque j'utilise `requireJS` mais que je ne sais pas importer par `requirejs` dans les tests, il faut organiser les modules de cette manière :

On fait un module normal qui définit la classe et l'exporte par `module.exports`, puis on définit le module requireJS qui sera utilisé dans le programme.

Dans les tests, on utilise le module définissant la classe.

Par exemple :

* soit une class `MaClasse`.
* dans le fichier `maclasse_class.js`, on définit la classe :

```js

class MaClasse {
  ...
}
module.exports = MaClasse

```

* dans le fichier `maclasse.js`, on définit le module pour `requireJS` :

```js

define(
  ['./maclasse_class.js'],
  (MaClasse){ return MaClasse }
)

```

* dans l'application, il suffira de faire :

```js

requirejs(
  ['./maclasse.js'],
  (MaClasse) => {

  }
)
```

* et dans les tests, on pourra tester le module unitairement avec :

```js

let MaClasse = require_module('./maclasse_class.js')

let inst = new MaClasse()

expect(inst).asInstanceOf(MaClasse).respond_to('methode')

```
