# Les champs éditables

Ce sont des champs (`div` ou `span` principalement) dont la classe CSS contient `editable` et qui sont en conséquence rendus éditable lorsque l'on clique ou que l'on focusse dedans.

Cela permet une édition très souple de n'importe quel texte affiché à l'écran.

Par défaut, c'est l'ID du champ qui va déterminer la propriété à modifier et c'est une méthode `redefine_<propriété>` qui va être invoquée pour traiter la nouvelle donnée.

Par exemple si on a dans le document :

```html

<span class="editable" id="mon_nom">Mon nom</span>

```

Lorsqu'on clique sur "Mon nom", le champ se met en édition. Dès qu'on quitte le champ (avec `Tab` ou en cliquant en dehors du champ), c'est la méthode `Projet#redefine_mon_nom` qui est appelée avec la nouvelle valeur du champ.

```js

class Projet {

  ...

  redefine_mon_nom ( nouveauNom )
  {
    ... traitement ...
  }

}

```

Note : c'est la méthode d'instance `onChangeData` de `Projet` qui traite cette sortie du champ.

## Utilisation avec un autre objet

Si ce n'est pas le projet qui doit être modifié mais un autre objet, alors il suffit de le définir dans la propriété `owner` du champ.

```js

<span class="editable" id="<nom propriété>" owner="<propriété à évaluer>">Valeur courante</span>

```

Par exemple, si on doit modifier le `parag` courant :

```js

<span class="editable" id="type" owner="currentParag">Action</span>

```

Dans ce cas, c'est la méthode `Parag#redefine_type` qui sera utilisée.

> Note : `currentParag` est une méthode pratique (handy-méthod) qui permet d'obtenir le `parag` courant s'il est défini.


## Utilisation d'un autre `id` pour le champ

Bien entendu, on utilise le nom de la propriété pour renseigner l'`id` du champ, mais il est tout à fait possible d'utiliser une autre valeur puisqu'en définitive cet `id` permet simplement de définir la *méthode* de traitement, pas directement la *propriété*.

Donc, imaginons que la propriété à éditer son `nom`, et que l'on ne veuille pas un champ qui ait un `id` à `nom`, il suffira de faire :

Le champ pour éditer le nom :

```html

<span class="editable" id="valeur_de_nom" owner="Personne.current">Nom actuel</span>

```

Il suffira ensuite de créer la méthode :

```js

class Personne {

  ...

  redefine_valeur_de_nom ( newNom )
  {
    ... traitement de la propriété 'nom' ...
  }

}

```

L'important est de ne pas utiliser de caractères interdits pour définir l'`id`, il doit pouvoir servir à construire le nom d'une méthode javascript.
