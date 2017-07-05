* Quand on CMD+Click sur un paragraphe pour le sélectionner, en mode double panneau, on indique ses relatifs
  -> exergueRelatifs (dans l'autre panneau)
    - pour ne pas avoir à chercher en fonction de l'autre panneau, on
      met tous les relatifs en exergue.
  -> unexergueRelatifs (dans l'autre panneau)
  -> showOnlyRelatifs
  -> unshowOnlyRelatifs
  * Penser à appeler la méthode lorsqu'on vient de définir une relation
  * Penser aux deux cas qui peuvent se produire :
    1. Le paragraphe sélectionné contient plus parags dans l'autre panneau
    2. Plusieurs paragraphes sélectionnés (ou non) sont relatifs d'un unique
        parag dans l'autre panneau => dès qu'on sélectionne un parag, on sélectionne
        aussi ses frères et on met en exergue le parag de l'autre panneau

* CMD+Click sur paragraphe le sort de current

* Pouvoir supprimer une association (Relatives)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Enregistrer les données dans le fichier du PanProjet

* Une seule sélection par défaut. On ne permet d'avoir plusieurs sélections que si la touche Majuscule est pressée.

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
