* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Enregistrer les données dans le fichier du PanProjet

* Une seule sélection par défaut. On ne permet d'avoir plusieurs sélections que si la touche Majuscule est pressée.

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
