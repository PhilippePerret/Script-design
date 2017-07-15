* On ajoute le paragraphe après la sélection courante.
  QUESTION : faut-il le demander ?

* Destruction du paragraphe courant

* Quand on active un panneau, il faut relever tous ses paragraphes.
  En fait, le mieux, ce serait d'avoir une propriété `parags` du panneau, qui
  soit une instance de Parags et permette de gérer les paragraphes du panneau

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
