# Sauvegarde à longueur fixe

J'ai choisi d'enregistrer les données des paragraphes avec des longueurs de données fixe, car c'est la seule méthode qui permet d'avoir un accès rapide aux données. La seule contrepartie étant la taille du fichier final contenant les paragraphes.

## Principes généraux

* tous les textes sont transformés en UNICODE afin d'avoir des longueurs identiques, même avec des caractères spéciaux. Au moment où ce texte est écrit, la longueur de 512 caractères est choisie.


## Méthodes principales

### `writeParags`

```js

  parags.writeParags([<liste parags>|null], <méthode callback>)

```

Si `liste parags` (liste des instances `Parags`) n'est pas fourni, la méthode relève tous les paragraphes modifiés depuis la dernière sauvegarde, puis appelle la méthode de callback.

La méthode peut recevoir aussi une liste d'identifiant, mais le parag correspondant doit alors obligatoirement exister et pouvoir être retourné par `Parags.get(<id>)`.


### `readParags`

```js

  // parags est projet.parags
  parags.readParags(<liste ids>, <méthode callback>)

```

Méthode qui lit les paragraphes dont les `ids` ont été fournis en premier argument puis exécute la méthode fournie en second argument.

On peut aussi fournir un seul nombre :

```js

  parags.readParags(<id parag>, <méthode callback>)


```
