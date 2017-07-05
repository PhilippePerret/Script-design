* Penser à un fonctionnement comme ça :
  - Une lettre permet de focusser sur une partie de l'interface
  - La touche tabulation permet alors de se déplacer à l'intérieur de cette partie
  - la touche entrée permet de sélectionner la chose
  NOTE : c'est un peu mis en place avec la "section active" dans la fenêtre Projets (pluriel).
  Par exemple :
    - O     permet de focusser sur les onglets
    - TAB   permet alors de se déplacer d'onglet en onglet (en revenant au premier)
    - ENTER permet de choisir l'onglet et donc de l'afficher
  Autre exemple :
    - T     permet d'afficher et de focusser sur la liste des outils généraux
    - TAB   permet de passer d'outil en outil
    - ENTER permet de jouer l'outil choisi.

    - P     permet de focusser sur le panneau courant
      TAB   permet de se déplacer de parag en parag
      ENTER permet d'éditer le parag courant

* Pouvoir supprimer une association (Relatives)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Enregistrer les données dans le fichier du PanProjet

* Une seule sélection par défaut. On ne permet d'avoir plusieurs sélections que si la touche Majuscule est pressée.

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
