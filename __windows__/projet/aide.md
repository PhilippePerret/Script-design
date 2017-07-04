## Aide pour la fenêtre Projet {#projet_aide_fenetre_projet}

### Aide rapide {#projet_quick_aide}

| Résultat voulu                | Raccourci | Notes |
| :---------------------------- | :------------- | :----- |
| Activer le panneau Scénier    | MAJ + s | |
| Activer le panneau Synopsis   | MAJ + y | |
| Activer le panneau Traitement | MAJ + t | |
| ------
| Créer un nouveau paragraphe   | n | |


### Introduction {#projet_introduction}

La fenêtre `Projet` est la fenêtre principale de travail sur le projet. C'est dans cette fenêtre qu'on peut traiter tous les aspects du projet.

### Les panneaux de la fenêtre projet {#projet_panneaux_fenetre}

Cette fenêtre fonctionne sur la base de `panneaux` qui correspondent aux échelles de développement du projet : le synopsis, le traitement, le scénier, etc. On active ces panneaux en cliquant sur leur bouton ou en jouant la touche appropriée

### Mode double panneau {#mode_double_panneaux}

On peut passer en mode double panneaux, i.e. pour voir un panneau à gauche et l'autre à droite, en cliquant sur le second panneau tout en maintenant la touche `MAJ` appuyée.

Procédure détaillée :

* choisir un panneau,
* appuyer sur la touche `MAJ` et la maintenir,
* cliquer sur le bouton du second panneau à afficher.

Le mode double panneau, en plus de voir la correspondance entre les paragraphes, permet de définir à quel paragraphe d'un panneau correspond aux paragraphes de l'autre panneau (par exemple quels paragraphes du traitement correspondent à tel paragraphe du synopsis).


### Paragraphes {#projet_les_paragraphes}

#### Création des paragraphes

> On parle de « paragraphe » mais en fait il s'agit de `parag`, c'est-à-dire d'entité textuelle qui peuvent contenir en réalité plusieurs paragraphes (plusieurs retours chariot).

On crée un nouveau paragraphe en tapant `n` dans le panneau où on veut l'ajouter. Le paragraphe se met aussitôt en édition et on peut l'écrire.

#### Sortir de l'édition du paragraphe {#projet_sortir_edition_paragraphe}

Pour sortir du champ d'édition, il suffit de jouer la `tabulation`. On peut aussi cliquer en dehors du champ.

#### Déplacer un paragraphe {#projet_deplacer_paragraphe}

On déplace un paragraphe avec la combinaison de touches `CMD` (`Meta`) + flèche haut ou flèche bas.

> Noter qu'on peut déplacer le paragraphe lorsqu'il est en édition.

#### Éditer un paragraphe {#projet_edition_paragraphe}

Pour éditer un paragraphe, [on le sélectionne](#projet_selection_paragraphe) et on clique la touche `Entrée`.

Voir cette explication pour [sortir de l'édition](#projet_sortir_edition_paragraphe).

#### Sélectionner un paragraphe {#projet_selection_paragraphe}

On utilise les flèches haut et bas pour sélectionner les paragraphes.

Avec la touche `MAJ` pressée, on se déplace de 5 parags en 5 parags.

#### Découper selon les retours-chariot {#projet_cut_selon_retour_chariot}

[TODO]

### Synchroniser deux panneaux {#projet_synchroniser_panneaux}

La synchronisation de deux panneaux consiste à mettre les paragraphes qui existe dans l'un dans l'autre aussi. Typiquement, on vient d'écrire le synopsis et au lieu de repartir d'un document scénier vierge, on sélectionne les deux panneaux et on demande à les synchroniser. Cela crée automatiquement les paragraphes du synopsis dans le scénier, en les associant.

Procédure détaillée :

* choisir le panneau qui contient les paragraphes à synchroniser,
* choisir le panneau à synchroniser en gardant la touche `MAJ` appuyée pour avoir les deux panneaux en même temps,
* activer les outils,
* choisir « Synchroniser les deux panneaux »

> Noter que la synchronisation est en vérité plus complexe, et qu'elle se fait dans les deux sens, pour peu que ce soit possible. L'application se sert des [données des relatives](#projet_les_relatives) pour connaitre les associations existantes entre les deux documents et tente de « combler les trous ».


### Données des `relatives` {#projet_les_relatives}

La notion de `relatives` est une notion très importante dans l'application. C'est elle qui gère les relations entre les paragraphes. C'est ce qui détermine, par exemple, que tels paragraphes du manuscrit final correspondent à tel paragraphe du synopsis et tels paragraphes du scénier.

#### Associer des *paragraphes relatifs* {#projet_associer_paragraphes_relatifs}

* afficher les deux panneaux (en tenant `MAJ` en cliquant sur le bouton du second),
* choisir les paragraphes en `CMD`+cliquant dessus.
* presser la touche `Entrée`,
* confirmer l'association des paragraphes ou la refuser.