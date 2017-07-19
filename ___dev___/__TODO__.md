* Retenir le panneau actif quand on quitte l'application pour le remettre au chargement du projet.

* Poursuivre le test Projet/save_spec.js

* Poursuivre l'implémentation des options
  - mettre en place la synchronisation automatique
    Principe : dès qu'un paragraphe est créé, il est automatiquement créé pour les
    autres panneaux.
    La méthode est en place, il faut voir comment l'implémenter
    Il serait peut-être intéressant d'utiliser une propriété `busy` pendant
    un processus comme celui-là pour empêcher les sauvegardes automatiques,
    qui peuvent venir perturber le travail.

* Travailler le pied de page
  - Rendre l'aide plus apparente dans le panneau projet (ligne du bas)
  - Documenter la ligne du bas avec le nombre de paragraphes, etc. et des aides/suggestions de raccourcis.

* Pouvoir supprimer une association (Relatives)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
