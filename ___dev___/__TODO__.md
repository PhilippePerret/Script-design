* La touche 'a' doit activer le premier Tabulator, la touche 's' le second, la touche 'd' le troisième etc.
  Indiquer qu'il sont activés dans l'ordre de leur définition dans le DOM et que cela peut ne rien avoir à voir avec leur position dans le DOM s'ils sont "fixed".
  Comment pourrait-on faire pour que dans la préparation des tabulators, on puisse définir les raccourcis clavier pour les atteindre.
  Ce serait par exemple un "patch" qui serait ajouté à la méthode onkeyevent.
  =>
    let method_keys = window.onkeyup
    window.onkeyup = (evt) => {
      ... on fait ce qu'on a à faire ici ...
      window.onkeyup(evt) // on appelle la méthode normale
    }
* Quand on édite un champ, placer le curseur à la fin plutôt qu'au début

* Poursuivre l'essai sur les tests d'inégration et notamment le fonctionnement des tabulators.

* Pouvoir supprimer une association (Relatives)

* Pouvoir supprimer un parag (il y a une issue sur github)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
