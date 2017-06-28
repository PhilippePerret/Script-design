## Toutes les méthodes de test {#all_test_methodes}


### `between` {#test_between}

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

### `classMethod` et `instanceMethod` {#tests_instance_methode_class_method}

Les méthodes `instanceMethod` et `classMethod` permettent de savoir si un object quelconque possède une certaine méthode d'instance ou de classe.


Syntaxe :

```js

  expect(<Object>).to.have.instanceMethod(<{String} methode d’instance>)
  expect(<Object>).to.have.classMethod(<{String} methode de classe>)

```

Par exemple :

```js

  expect(Array).to.have.instanceMethod('length')
  // => SUCCÈS

  expect(Object).to.have.classMethod('length')
  // => FAILURE, la class Object ne connait pas cette méthode

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
f unction     Fonction
array         Une vraie liste
object        Un vrai dictionnaire

  <class minuscule>   Une classe propre à l’application.
                    Par exemple 'anyobject' pour la classe 'AnyObject'

```


### `contain` {#test_contain}

Renvoie true si `expected` appartient à `actual`. Le terme « appartenir » peut avoir plusieurs significations en fonction du type (class) des éléments fournis en argument.

#### `contain` dans un string {#contain_in_string}

Pour un string, la chaine doit contenir l'autre chaine (qui peut être une expression régulière), pour un array, il doit contenir la valeur fournie. Pour un tableau, le tableau envoyé doit lui appartenir (contenir les clés et les valeurs de clés). La méthode sera étendue plus tard pour couvrir d'autres cas.

Pour obtenir la raison de l'erreur, on peut récupérer `Any.containityError` juste après l'expectation.

Cette méthode est sensible au paramètre `strict`.

```js

  expect("Mon texte est là").to.contain("Texte")
  // => succès car test non strict

  expect("Mon texte est là").to.strictly.contain("Texte")
  // => échec car test strict

```

Avec une expression régulière :

```js

  expect("Mon texte").to.contain(/ex.e/)
  // => succès

```

#### `contain` avec Array {#contain_in_array}


```js

  expect([1,2,3]).to.contain(2)
  expect(['un','deux','trois']).to.contain('deux')

```

Noter que pour le moment, on ne checke pas un tableau dans une liste array. Pour le faire, faire une boucle sur les éléments de la liste et les vérifier contre le tableau.

#### `contain` avec un tableau (un `Object`) {#contain_in_object}

C'est un tableau qu'on doit envoyer au tableau, ce tableau (`expected`) contenant les clés et les valeurs à tester. Un tableau est dans un autre tableau lorsque toutes ses clés existent et que les valeurs de ces clés sont identiques (strictement ou non).

```js

  expect({un:'une',le:'la',il:'elle'}).to.contain({le:'la'})  // => succès
  expect({un:'une',le:'la',il:'elle'}).to.contain({h:'f'})    // => échec
  expect({un:'une',le:'la',il:'elle'}).to.contain({le:'les'}) // => échec

  expect({un:'une',le:'la',il:'elle'}).to.strictly.contain({le:'la'})  // => succès
  expect({un:'une',le:'LA',il:'elle'}).to.strictly.contain({le:'la'})  // => false

```


### equal/equals/equal_to {#equal}

Vérifie l'égalité entre deux expressions. Cf. aussi la note sur le mode strict.


### greater_than {#greater_than}

Vérifie la supériorité entre deux expressions (nombre ou string). Cf. aussi la note sur le mode strict.



### Méthode `instanceMethod` {#test_instance_method}

cf. [Méthodes `classMethod` et `instanceMethod`](#tests_instance_methode_class_method).


### `less_than` {#less_than}

Vérifie l'infériorité entre deux expressions (nombre ou string). Cf. aussi la note sur le mode strict.

### Méthode `throwError` {#tests_throw_error}

Méthode qui permet de tester un message d'erreur fonctionnelle levé par les tests.

Noter qu'il ne s'agit pas d'un message d'erreur général (`try`...`catch`) et encore moins l'erreur provoquée par une erreur personnalisée de l'application. Il s'agit ici de la méthode `throwError` qui permet d'écrire un message en rouge dans le rapport, lorsque c'est une erreur d'écriture du test connue.

Par exemple, si un test utilise pour s'interrompre :

```js

  isAWord(){
    return throwError('Vous devez fournir un string !')
    ...
  }

```

… alors on peut tester l'envoi de ce message par un test du genre :

```js

expect( () => { expect(12).to.be.a.word })
  .to.throwError('Vous devez fournir un string')

```

> Note : la formule `to.be.a.word` n'existe pas, en vrai.

Noter que le contenu de l'expectation (la première) est une fonction :

```js

expect( () => {...} )

```

C'est obligatoire si l'on ne veut pas que le code soit exécuté au moment du chargement de la feuille de tests, ce qui génèrerait vraiment l'erreur.