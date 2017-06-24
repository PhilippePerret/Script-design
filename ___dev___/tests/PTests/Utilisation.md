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

## Les case `it` {#cases_it}

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

En mode non strict, le chiffre 1 est égal au chiffre string `"1"`. Ils sont comparés avec `==`.

En mode strict en revanche, ils sont comparés avec `===` et ne sont pas égaux.

Pour passer en mode strict un cas, il suffit d'ajouter dans la chaine le terme `strictly` (strictement). Par exemple :

```js

describe("La comparaison de deux valeurs")
  .context("En mode strict")
    .it("rend 1 différent de '1'", () => {
      expect(1).not.to.strictly.equal('1')
    })
    .and("rend 1 toujours égal à 1", () => {
      expect(1).to.strictly.equals(1)
    })
```

## Envoyer des messages de débuggage à la console principale {#methode_log}

Utiliser la méthode globale `log` pour envoyer des méthodes à la console principale, soit depuis les tests soit depuis les modules de `PTests`

```js

log('Ce message s’affichera dans la console Atom, avec l’objet : ', {mon: "Objet"})

```
