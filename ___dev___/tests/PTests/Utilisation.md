# Utilisation des Prototypals-tests {#utilisation_des_prototypial_tests}

## Schéma de base {#schemas_base}

### Schéma simple {#schema_simple}

```js

describe('<description')
  .it('un cas', () => {
    <tests>
  })

```

Avec contexte :

```js

describe('<description>')
  .context('<contexte>')
    .it('un cas', () => {
      <tests>
    })

```

En enchaînant plusieurs cas :

```js

describe('Une description')
  .context('un contexte')
    .it('un cas', () => {
      // tests
    })
    .and(/* (1) */'un autre cas', () => {
      // tests
    })
    .and('un troisième cas', () => {
      // tests
    })

```

(1) On pourrait bien entendu garder des "it" à la place des 'and'. Les deux termes produisent exactement le même effet.

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

### Schéma complet

```js

describe("<description du tests>")
  .context("<description du contexte>")
    .it("Un premier cas", ()=>{
      <le test>
    })
    .and("Un second cas", ()=>{

    })
    .and("Un troisième case", ()=>{

    })
  .context("<un autre contexte>")
    .it("")

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


## Définir la valeur “actuelle”

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

describe("La comparaison de deux valeurs")
  .context("En mode strict")
    .it("rend 1 différent de '1'", () => {
      expect(1).is.not.strictly.equal_to('1')
    })
    .and("'bonjour' n'est pas strictement égal à 'BONJOUR'", () => {
      let
          bonjour = 'bonjour'
        , BOUJOUR = 'BONJOUR'
      expect(bonjour).equals(BONJOUR) //=> success
      expect(bonjour).not.strictly.equals(BONJOUR) //=> success
    })
```


## Toutes les méthodes de test {#all_test_methodes}

### contain {#contain}

Vérifier que `expected` appartienne bien à `actual`. Pour un string, la chaine doit contenir l'autre chaine (qui peut être une expression régulière), pour un array, il doit contenir la valeur fournie.

Cette méthode est sensible au paramètre `strict`.

```js

  expect("Mon texte est là").to.contain("Texte")
  // => succès car test non strict

  expect("Mon texte est là").to.strictly.contain("Texte")
  // => échec car test strict

```

Avec un expression régulière :

```js

  expect("Mon texte").to.contain(/ex.e/)
  // => succès

```

### equal/equals/equal_to {#equal}

Vérifie l'égalité entre deux expressions. Cf. aussi la note sur le mode strict.

### greater_than {#greater_than}

Vérifie la supériorité entre deux expressions (nombre ou string). Cf. aussi la note sur le mode strict.

### less_than {#less_than}

Vérifie l'infériorité entre deux expressions (nombre ou string). Cf. aussi la note sur le mode strict.

### between {#between}

Vérifie qu'un nombre se trouve bien entre deux autres nombres ou qu'un mot se trouve bien entre deux autres mots.

```js

  it('2 est entre 1 et 3', () => {
    expect(2).between([1,3])
  })

```

```js

  it('Marion est située en âge entre Kevin et Séverin', () => {
    expect(24, 'Marion').between([20,28], 'Kevin et Séverin')
  })

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
