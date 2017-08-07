# Les champs éditables {#editable_fields}

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

Note : c'est la méthode d'instance `onChangeData` de `Projet` qui traite cette sortie du champ, en duo avec les méthodes `ProjetUI.activateEditableField` et `ProjetUI.desactivateEditableField`.


## Autoriser les retours chariot {#autoriser_retours_chariot}

Par défaut, les retours-chariot permettent de sortir du champ, donc d'entrer la nouvelle valeur. Deux moyens permettent d'autoriser les retours-chariot :

* l'attribut `enable-return="true"` dans le champ concerné (meilleure méthode),
* l'envoi de l'option `options.enableReturn` à la méthode `ProjetUI.activateEditableField`, mais dans ce cas, tous les champs pourront utiliser les retours-chariot.


## Utilisation avec un autre objet {#use_other_object}

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


## Utilisation d'un autre `id` pour le champ {#use_other_id_field}

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


## Mettre en exergue les champs éditables {#mettre_exergue_editable}

On peut mettre en exergue les champs éditables en ajoutant la classe `dashed` :

```html

<span class="editable dashed">Valeur à éditer, en exergue</span>

```

## Faire fonctionner une section de texte éditable avec le Tabulator {#editable_fields_and_tabulator}

Cela permettra de faire fonctionner l'édition comme pour les menus : chaque chaque éditable sera lié à une touche de Q à M puis de A à P (20 touches) pour être mis en édition.

Cette fonctionnalité désactive le comportement normal des tabulators, jusqu'à la fin de l'édition, qu'on doit peut-être pouvoir quitter avec une touche.

Implémentation :

À l'activation de la section (par exemple lorsque l'on demande son affichage), il faut envoyer à Tabulator la commande qui va définir la section à surveiller et comment la surveiller :

```js

Tabulator.setupAsTabulator(
  '<ID ou DOM Element>',
  {params}
)

```

Cf. le document Tabulator.md pour le détail.
