# Implémentation de Tabulator

Il faut bien comprendre qu'il y a deux moyens d'utiliser `Tabulator`.

## Deux moyens d'utiliser `Tabulator` {#deux_moyens_utiliser_tabulator}

### Premier moyen

Créer une balise `<tabulator>` dans la page avec des `<button>` possédant des attributs `data-tab`.

Ce moyen est le moins souple mais il nécessite peu d'implémentation pour le programmer, il suffit de définir le code `HTML` et la *Map* du Tabulator.

Ce premier moyen :

* est moins souple (conventions plus nombreuses, utilisation seulement des `button`(s)),
* permet la sélection multiple de commande/menu,
* nécessite peu d'implémentation,
* permet la double-pression rapide pour choisir l'élément (comportement comme un menu).

### Second moyen

Envoyer n'importe quel élément DOM possédant n'importe quel élément avec un attribut `data-tab` à la méthode `Tabulator.setupAsTabulator`.

Ce second moyen :

* est le plus souple, mais il nécessite plus d'implémentation,
* permet l'utilisation de menu `SELECT`,
* ne permet pas (encore) la sélection multiple,
* permet de définir d'autres lettres que celles prévues par défaut (TODO Ce comportement doit pouvoir être reproduit avec le premier moyen).
* n'utilise pas la double-pression pour choisir (ne se comporte pas comme un menu)


## Premier moyen {#premier_moyen}


## Second moyen {#second_moyen}

Pour fonctionner, la méthode `setupAsTabulator` construit la `sectionMap` de l'élément fourni en argument. Cette `sectionMap` comprend en clé la lettre utilisée pour élément (possédant un attribut `data-tab`) et en valeur la méthode à appeler en cas de frappe de la touche.

`sectionMap` contient également les propriétés suivante, utiles pour passer d'un élément à l'autre avec les touches `->` et `<-` ou les lettres `j` et `l` si elles sont disponibles.

* `Tabulator.iMaxLetter`. Le nombre maximum de lettre pour l'élément courant.
* `Tabulator.currentLetter`. La lettre courante, c'est-à-dire la dernière qui vient d'être pressée.

Cette `sectionMap` est enregistré dans l'objet `Tabulator.Sections` qui contient en clé l'`ID` de l'élément transmis et en valeur la Map de section. Cela permet de ne pas avoir à tout recalculer lorsque l'on appelle à nouveau `setupAsTabulator`.

Lors de la préparation de l'élément, une classe `tabulatorized` lui est ajouté pour signifier que l'élément est déjà préparé et qu'il suffit donc de lire ses données dans `Tabulator.Sections`.
