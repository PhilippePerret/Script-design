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


### classOf {#classof}

Permet de tester ma classe d'un élément.

Usage :

```js

  expect(12).to.be.classOf('number')          // => true
  expect({un:"un"}).to.be.classOf('object')   // => true
  expect([1,2,3]).to.be.classOf('object')     // => FALSE
  expect([1,2,3]).to.be.classOf('array')      // => true

  class MaClasse { }
  let maclasse = new MaClasse()

  expect(maclasse).to.be.classOf('object')    // => FALSE
  expect(maclasse).to.be.classOf('maclasse')  // => true

```

Les classes sont :

```js

  number        Nombre (entier ou flottant)
  string        String
  symbol        Symbol
  function      Fonction
  array         Une vraie liste
  object        Un vrai dictionnaire

  <class minuscule>   Une classe propre à l'application.
                      Par exemple 'anyobject' pour la classe 'AnyObject'

```
