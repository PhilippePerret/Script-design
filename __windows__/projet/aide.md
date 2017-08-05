## Aide pour la fenêtre Projet {#projet_aide_fenetre_projet}

### Aide rapide {#projet_quick_aide}

| Résultat voulu                | Raccourci | Notes |
| :---------------------------- | :------------- | :----- |
| Activer le menu panneau       | q               | |
| Choisir un panneau            | q puis q à k    | (tabulator) |
| Choisir un autre panneau      | q puis fl. haut/bas | (tabulator)|
| --- | --- | --- |
| Créer un nouveau paragraphe   | n | |
| --- | --- | --- |
| Sélectionner un paragraphe    | Flèche bas | |
|                               | k          | |
| Sélectionner paragraphe après | Flèche bas | |
|                               | k           | |
| Sélectionner paragraphe avant | Flèche haut | |
|                               | i           | |
| Sélection 5e paragraph après  | MAJ + Fl. bas | |
|                               | MAJ + k     | |
| Sélection 5e paragraph avant  | MAJ + Fl. haut | |
|                               | MAJ + i     | |
| Déselectionnner paragraphes   | ESC         | |
| --- | --- | --- |
| Modifier paragraphe           | Enter         | (sélectionné)|
|                               | e             | (sélectionné) |
| --- | --- | --- |
| Déplacer paragraphe vers bas  | CMD + Fl.bas  | (sélectionné) |
|                               | CMD + k       | (sélectionné) |
| Déplacer paragraphe vers haut | CMD + Fl.haut | (sélectionné) |
|                               | CMD + i       | (sélectionné) |
| --- | --- | --- |
| Afficher le verso du parag    | Tab ou ->     | (courant) |
| Passer d'un champ à un autre  | ->/<- ou l/j  | verso |
| (verso) Changer la durée      | q / horloge   | verso |
| (verso) Changer la position   | s / horloge   | verso |
|                               | ou "auto"     |       |
| (verso) Choisir type1         | d - Fl / j/l  | verso |
| (verso) Choisir type2         | f - Fl / j/l  | verso |
| (verso) Choisir type3         | g - Fl / j/l  | verso |
| (verso) Choisir type4         | h - Fl / j/l  | verso |
| --- | --- | --- |

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

Noter que le retour chariot ne permet pas de le faire puisqu'on peut mettre des retours chariots dans les parags (qui sont en fait de faux paragraphes, d'où le nom raccourci de « parag »).

#### Déplacer un paragraphe {#projet_deplacer_paragraphe}

On déplace un paragraphe avec la combinaison de touches `CMD` (`Meta`) + flèche haut ou flèche bas.

> Noter qu'on peut déplacer le paragraphe lorsqu'il est en édition.

#### Éditer un paragraphe {#projet_edition_paragraphe}

Pour éditer un paragraphe, [on le sélectionne](#projet_selection_paragraphe) et on clique la touche `Entrée`.

Voir cette explication pour [sortir de l'édition](#projet_sortir_edition_paragraphe).

#### Sélectionner un paragraphe {#projet_selection_paragraphe}

On utilise les flèches haut et bas pour sélectionner les paragraphes.

Avec la touche `MAJ` pressée, on se déplace de 5 parags en 5 parags.

#### Autres propriétés des parags {#properties_verso_parag}

On peut retourner le parag pour régler ses autres propriétés telles que sa durée, sa position temporelle dans le projet, ses types 1 à 4 (qui vont déterminer son aspect) ou encore ses brins.

On affiche le verso en sélectionnant le paragraphe (flèche haut/bas ou touches "i", "k") puis en cliquant la tabulation ou la flèche droite ou la touche "l".

> Note : on revient au paragraphe avec la touche `Erase arrière` (`backspace`) ou la flèche gauche ou la touche 'j'

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


## Gestion des brins {#gestion_des_brins}

La fênêtre des brins, nommée « Liste des brins », permet de gérer les « brins » de l'histoire tels que définis dans la boite à outils de l'auteur.

Cette fenêtre permet d'afficher la liste des brins courants et d'en créer de nouveaux.

Comme pour les autres fenêtres, tout se gère à l'aide du clavier principalement.

### Raccourcis de la fenêtres des brins {#liste_brins_shortcuts}

Les touches les plus importantes sont les flèches haut et bas (ou `k` et `i`) pour se déplacer, les flèches droite ou gauche (ou `j` ou `l`) pour choisir ou retirer, et la touche `Entrée` pour confirmer les choix.

| Résultat voulu                | Raccourci | Notes |
| : --------------------------- | :-------- | :---- |
| Aller au brin suivant         | Fl. bas ou k    | |
| … de 10 en 10                 | + MAJ           | |
| Aller au brin précédent       | Fl. haut ou i   | |
| … de 10 en 10                 | + MAJ           | |
| | | |
| Choisir ou retirer le brin    | Fl. -> ou l     | |
|                               | Fl. &lt;- ou j  | |
| Créer un nouveau brin         | b               | |
| Éditer le brin sélectionné    | e               | |
| | | |
| Confirmer le choix et finir   | Enter           | |
| Renoncer au changement        | Escape          | |
| Obtenir de l'aide             | @               | |
| ------- |


### Création d'un nouveau brin {#creation_nouveau_brin}

Que l'on se trouve dans la liste des brins ou sur le verso d'un parag, c'est la touche `b` qui permet de créer un nouveau brin. La fenêtre d'édition du brin s'ouvre et il suffit d'entrer les valeurs puis de confirmer par `Entrée`.

### Le formulaire de brin {#formulaire_brin}

Le formulaire de brin permet de créer un nouveau brin ou d'éditer un brin existant.

On peut l'ouvrir soit à partir du [verso du parag], soit à partir du [panneau des brins].

Ce formulaire est un [tabulator] donc il fonctionne avec les touches `q`, `s` etc. (ligne médiane du clavier, de gauche à droite). En l'occurrence :

```

  q       Met en édition le champ Titre
  s       Met en édition le champ Description
  d       Met en édition le champ Parent ID
  f       Met en édition le champ Type de brin

  Tab     Pour valider la modification d'un champ (ou Enter, sauf sur le
          champ Description, qui accepte les retours chariot).

  Enter   Pour valider le champ si on est en édition.
          Pour enregistrer le nouveau brin.

  Escape  Pour quitter l'édition sans rien faire.

```

Comme pour toutes les fenêtres, la touche `@` permet d'obtenir de l'aide. En l'occurrence, cette aide vous amène ici.
