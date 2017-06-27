# Utilisation des Prototypals-tests {#utilisation_des_prototypial_tests}

## Schéma de base {#schemas_base}

### Schéma simple {#schema_simple}

```js

describe('<description', [
  ... liste de contextes ou de cases
  , it('un cas', () => { // (1)
    <tests>
  })

])

```

(1) La virgule avant le `it` est normale. Elle permet de ne pas se soucier des listes. Si, par exemple, on doit ajouter un case `it` avec ce `it`, on pourra le faire sans avoir à (penser) ajouter une virgule. Le premier élément des listes est automatiquement supprimé s'il est vide.

Avec contexte :

```js

describe('<description>', [
  , context('<premier contexte>', [
    , it('un cas', () => {
      <tests>
    })
  ])
  , context('<deuxième contexte>')
])
  .

```

En enchaînant plusieurs cas :

```js

describe('Une description', [
  , context('un contexte', [
    , it('un cas', () => {
      // tests
    })
    , it(/* (1) */'un autre cas', () => {
      // tests
    })
    , it ('un troisième cas', () => {
      // tests
    })
  ])
])

```

## Les cases `it` {#cases_it}

Les tests à l'intérieur des `it` sont composés de chaines :


Ces chaines peuvent s'enchaîner :

```js

  it('fonction en chaine', () => {
    expect(12).to.be.greater_than(8)
      .and.less_than(24)
      .and.be.instanceof('number')
  })
```

### Schéma complet {#schema_complet}

```js

describe("<description du tests>", [

])
  , context("<description du contexte>", [
    , it("Un premier cas", ()=>{
      <le test>
    })
    , it("Un second cas", ()=>{

    })
    , it("Un troisième case", ()=>{

    })
  ])
  , context("<un autre contexte>", [
    , it("")    
  ])

```
Par exemple :

```js

describe("La comparaison entre deux éléments")
  .context("En mode non strict")
    .it("rend 1 égal à '1'", () => {
      expect(1).to.be.equal_to('1')
    })
    .and("rend 1 égal à 1", () => {
      expect(1).to.equal(1)
    })
  .context("En mode strict")
    .it('rend 1 différent de "1"', () => {
      expect(1).not.to.strictly.equal('1')
    })
    .and('rend 1 égale à 1', () => {
      expect(1).to.strictly.equal(1)
    })

```

## helper de test (spec_helper.js) {#helper_de_tests}

À l'instar de `RSpec`, on peut créer un fichier `spec_helper.js` à la racine du dossier de tests où sera exécuté du code avant le lancement des tests.

C'est par exemple dans ce fichier qu'on peut définir le dossier de tests à jouer ou le seul fichier de test :

```js

  // dans ./tests/ptests/spec_helper.js

  PTests.options.test_file = 'path/relative/to/test_spec.js'
  // Note : prioritaire sur test_folder ci-dessous

  PTests.options.test_folder = 'mon/dossier'
  // Note : ne sera pas considéré si l'option test_file est
  // définie ci-dessus.

```

## Requérir le module à tester {#requerir_module_a_tester}

On requiert un module, dans la feuille de test, à l'aide de :

```js

  let <nom> = require_module('./path/to/the/module_sans_js')

```

## Définir la valeur “actuelle” {#define_actual_value}

C'est la valeur qui va être comparée à la valeur attendue. Elle est définie par :

```js

  expect(<valeur actuelle>)

```

Pour les messages, on peut décider d'utiliser un « pseudo » pour cette valeur, par exemple :

```js

  expect(12, 'l’âge du capitaine')

```

Les messages de résultat tiendront compte de ce pseudo pour afficher des messages du genre :

```js

  // => "L’âge du capitaine (12) devrait être strictement supérieur à 12."

```

## Mode strict {#lemodestrict}

Le mode strict se comporte différement en fonction des cas :

* Avec deux nombres et le test de supériorité ou d'infériorité, il utilise `>` et `<` au lieu de `>=` et `<=` en mode non strict.
* Avec deux strings, la comparaison est insensible à la casse, c'est-à-dire que "bonjour" sera égal à "BonjouR".
* Avec deux autres types, c'est une comparaison par '===' qui est faite (noter qu'elle est fait aussi, de fait, avant les deux autres cas.


Pour passer en mode strict un cas, il suffit d'ajouter dans la chaine le terme `strictly` (strictement). Par exemple :

```js

describe("La comparaison de deux valeurs", [
  , context("En mode strict", [
    , it("rend 1 différent de '1'", () => {
      expect(1).is.not.strictly.equal_to('1')
    })
    , it("'bonjour' n'est pas strictement égal à 'BONJOUR'", () => {
      let
          bonjour = 'bonjour'
        , BONJOUR = 'BONJOUR'
      expect(bonjour).equals(BONJOUR) //=> success
      expect(bonjour).not.strictly.equals(BONJOUR) //=> success
    })
  ])  
])

```


## Utiliser un template de message de retour {#template_message_retour}

On peut fournir un template de retour dans les options (second argument) de la dernière méthode de l'expression (appelée « méthode de comparaison »). Ce message doit utliser `__ACTUAL__` et `__EXPECTED__` pour définir les placeholders qui seront remplacés par les valeurs originales et attendues.

Pour couvrir tous les cas, plusieurs messages doivent être fournis, contenus dans la propriété `template` :

```js

  template: {
    success: "<message en cas de succès>",
    failure: "<message en cas d'échec>"
  }
```

Si un des deux messages est omis, c'est le message par défaut qui est utilisé.

Exemple d'utilisation.

```js

  describe('Un template')
    .it('peut être fourni', () => {
      expect(4).equals(5, {template: {failure: "il est impératif que __ACTUAL__ soit égal à __EXPECTED__ !"}})
    })

```

Le test ci-dessus produira « OK, 4 est égal à 5 » en cas de succès et le message « Erreur line 23, il est impératif que 4 soit égal à 5 ! ».

Bien sûr, tout code HTML peut être utilisé dans le message et l'on peut avoir dans le message un lien conduit à une aide plus précise :

```js

  template:{failure:"__ACTUAL__ devrait ressembler à __EXPECTED__ (cf. <a href="http://mon.aide.com">L'aide</a> pour le détail)"}

```

## Envoyer des messages de débuggage à la console principale {#methode_log}

Utiliser la méthode globale `log` pour envoyer des méthodes à la console principale, soit depuis les tests soit depuis les modules de `PTests`

```js

log('Ce message s’affichera dans la console Atom, avec l’objet : ', {mon: "Objet"})

```
