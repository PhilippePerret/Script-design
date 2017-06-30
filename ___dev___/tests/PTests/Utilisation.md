# Utilisation des Prototypals-tests {#utilisation_des_prototypial_tests}

[valeur-pseudo]: #valeur_pseudo
[Mode strict]: #lemodestrict


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
      expect(...)....
        .and....
        .and...
      expect(...)...
    })
    , it("Un second cas", ()=>{
      // <l’expectation >
    })
    , it("Un troisième case", ()=>{
      // <l’expectation >
    })
  ])
  , context("<un autre contexte>", [
    , it("")    
  ])

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

Cela a pour effet de faire connaitre le module à la feuille de test aussi bien qu'à PTests lui-même.


## Définition de l'expectation {#define_expectation}

### Les valeurs-pseudo {#valeur_pseudo}

On appelle « valeurs-pseudo » des valeurs qui vont remplacer la valeur réelle de l'actual ou de l'expected dans les messages du rapport, pour plus de clarté. Par exemple, si on veut connaitre le nombre d'œuf dans une boite, le message :

```js

  "12 est égal à 12"

```

… n'est pas du tout clair tandis que…

```js

  "le nombre d'œufs est égal à 12"

```

… est tout à fait explicite. Ici, « le nombre d'œufs » est la valeur-pseudo de `12.`

Ces `valeurs-pseudo` peuvent se définir aussi bien pour l'actual que pour l'expected. Elles se placent juste après la définition de l'un et de l'autre dans les expectations :

```js

  // Expectation simple
  expect(nombre_oeufs).to.equal(12)

  // Expectation avec valeur-pseudo
  expect(nombre_oeufs,'le nombre d’œufs').to.equal(12,'une douzaine')
  // => produit en cas de succès :"le nombre d’œufs est égal à une douzaine"

```


### Définir la valeur “actuelle” dans l'expectation {#define_actual_value}

C'est la valeur qui va être comparée à la valeur attendue. Elle est définie par :

```js

  expect(<valeur actuelle>[[<valeur pseudo>][,<options>]])

```

Cf. la description de la [valeur pseudo].

### Options de la valeur `actual` {#options_in_actual}

On peut placer en troisième argument de la méthode `expect` (ou en second lorsqu'il n'y a pas de [valeur-pseudo] — les options de l'expectation, lorsqu'elles ne peuvent pas être mise dans la méthode de comparaison. Par exemple :

```js

expect(true, 'C’est vrai', {no_values: true}).to.be.true

expect(true, {no_values: true}).to.be.false

```

Cf. pour le détail : [Options de la méthode de comparaison](#options_methode_comparaison)

### Options de la méthode de comparaison {#options_methode_comparaison}

Les options de la méthode de comparaison (dernier mot de l'expectation) permettent de définir le comportement de l'expectation.

Ils se mettent en troisième argument de la méthode de comparaison ou en second lorsqu'il n'y a pas de [valeur-pseudo] :

```js

  expect(elle).to.equal(lui, 'lui', {...options ...})

  expect(elle).to.equal(lui, {...options ...})

```

On peut trouver les options suivantes :

* `strict` (défaut : `false`). Si true, l'expectation se fait en mode strict. Le comportement dépend de la méthode de comparaison (cf. le [Mode strict]).
* `template` (défaut : `undefined`). Permet d'utiliser des messages tout à fait personnalisés, en cas de succès comme en cas d'échec. Pour voir le détail : [Utiliser un template de message de retour](#template_message_retour).
* `no_values` (défaut : `false`). Lorsqu'une [valeur-pseudo] est fournie, la valeur réelle est précisée ensuite entre parenthèses. Par exemple : `le nombre d’œufs (12) est égal à une douzaine`. On peut ne pas préciser cette valeur en mettant `no_values` à true, ce qui produira le message `le nombre d’œufs est égal à une douzaine`.
* `not_a_test` (ou `NaT`) (défaut : `false`). Utilisée surtout pour tester PTests lui-même, cette option permet de ne pas produire de succès ou de failure dans la feuille de test, mais de récupérer simplement le résultat. Noter qu'on peut aussi utiliser `NaT`.


```js

  let res = expect(1).equals(2, {not_a_test: true})
  // res est alors un PTestsExpectClass et on peut récupérer ses valeurs,
  // notamment res.isOK pour son résultat ou res.returnedMessage pour connaitre
  // le message qui aurait été inscrit dans le rapport.
```

#### Mode strict {#lemodestrict}

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

#### Utiliser un template de message de retour {#template_message_retour}

On peut fournir un template de retour dans les options (second argument) de la dernière méthode de l'expression (appelée « méthode de comparaison »). Ce message doit utliser `__ACTUAL__` et `__EXPECTED__` pour définir les placeholders qui seront remplacés par les valeurs originales et attendues.

Pour couvrir tous les cas, plusieurs messages doivent être fournis, contenus dans la propriété `template` (ou `templates`) :

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

## Pendings (tests en attente) {#pendings_tests_en_attente}

Pour noter que des tests sont attendus mais pas encore implémentés, on utilise `pending([<message>])` (avec un message ou non).

```js

describe('Une suite de cases', [
  , it('Un test à implémenter', () => {
    pending() // marquera simplement 'à implémenter' en résumé des tests
  })
  , it("un autre test décrit, à implémenter", ()=>{
    pending('Il faut tester ceci et tester cela')
  })
])

```

Noter que contrairement à `RSpec` par exemple, ce pending n'interrompt pas le case courant. On peut donc utiliser des choses comme :

```js

describe("Un test inachevé", [
  , it("Ce case est à poursuivre et compléter", () => {
    expect(...).to...
    expect(...).to...
    pending("Il faudra ajouter ici une expectation.")
    // Le test se poursuit normalement.
    expect(...).to...
    ...
  })
])

```


## Envoyer des messages de débuggage à la console principale {#methode_log}

Utiliser la méthode globale `log` pour envoyer des méthodes à la console principale, soit depuis les tests soit depuis les modules de `PTests`

```js

log('Ce message s’affichera dans la console Atom, avec l’objet : ', {mon: "Objet"})

```

## Inscrire des messages dans le rapport de test {#methode_puts}

On peut aussi envoyer des messages qui seront affichés dans le rapport de test en utilisant la méthode `puts` (comme en ruby ;-)). On peut utiliser le seconde argument pour préciser le style d'affichage :

```js

puts('Un message notice en bleu', 'notice')

puts('Un message d’alerte','warning')

puts('Un message normal')

```
