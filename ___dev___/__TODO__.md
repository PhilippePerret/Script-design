* Implémenter les messages dans le footer (méthode `log` de projet.ui)

* Poursuivre le test Projet/save_spec.js

* Poursuivre l'implémentation des options
  - mettre en place la sauvegarde automatique
    Principe : dès que le projet est modifié, l'enregistrement est lancé, mais
    s'interrompt dès qu'on exécute une action comme une touche pressée. L'enregistrement
    se fait par petits segments, de panneau en panneau.
    OU Quand la sauvegarde automatique est activée, on lance un setInterval (par exemple
    toutes les 30 secondes) qui vérifie s'il faut sauvegarder.
  - mettre en place la synchronisation automatique
    Principe : dès qu'un paragraphe est créé, il est automatiquement créé pour les
    autres panneaux.
  - mettre en place la sélection à l'édition / fin de paragraphe
  - mettre en place l'indication de la durée en page ou en secondes
    (peut-être qu'il faut déjà implémenter la définition de la propriété durée)

* Travailler le pied de page
  - Rendre l'aide plus apparente dans le panneau projet (ligne du bas)
  - Document la ligne du bas avec le nombre de paragraphes, etc. et des aides/suggestions de raccourcis.

* Faut-il faire l'ajout dans les paragraphes visibles plutôt qu'à la fin lorsqu'il n'y a pas de sélections mais qu'il y a beaucoup de paragraphes ?

* Poursuivre l'essai sur les tests d'inégration et notamment le fonctionnement des tabulators.

* Pouvoir supprimer une association (Relatives)

* Pouvoir supprimer un parag (il y a une issue sur github)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
