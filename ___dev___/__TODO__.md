* Synchronisation du paragraphe
  La seule difficulté (?) me semble être de savoir où placer le paragraphe.
  Il est créé entre deux paragraphes ou non
  S'il est crée entre deux paragraphes, il faut étudier les relatifs de chaque paragraphe avant et après pour savoir
  Les relatifs peuvent concerner certains tableaux et pas d'autres.
  Il faut donc faire une boucle pour trouver un paragraphe avant qui corresponde au paragraphe avant.

  Différents cas qui peuvent se poser
    - Le nouveau parag est le premier du panneau.
      => On l'ajoute à la fin des autres panneaux
    - Il n'y a pas de parags dans le panneau de destination (pan.parags.count == 0)
      => Il suffit de créer le parag dans le panneau.
    - Le nouveau parag se trouve entre deux parags qui n'ont aucun relatif dans les
      autre panneaux.
      => On l'ajoute à la fin des autres panneaux.
    - Le nouveau parag se trouve après un parag qui a un relatif seulement dans deux
      autres panneaux
      => On l'ajoute après ce relatif dans les deux panneaux et à la fin des autres
    - Le nouveau parag se trouve juste entre deux parags qui ont un relatif dans les
      autres panneaux, mais ces relatifs ne se trouvent pas conjoint
      => On l'ajoute avant le second paragraphe, puisque ça semble être la position
         la plus logique.

                    /---- P3  
          P1 ------/      P4
          NP              P5
          P2 ------\      P6
                    \     NP <----
                     \--- P7


                     /---- P3  
           P1 ------/ ---- P4   
           NP              NP <---- ?
           P2              P5
                           P6
                           NP <---- ? (1)
                           P7
                           NP <---- ?


                     /---- P3  
           P1 ------/      NP <---- ?
           P8              P10
           P9              P11
           NP              P4
           P2              P5
           P12             NP <---- ? (1)
                           P6
                           P7

              (1) Avant P6 en supposant que les deux paragraphes suivants
                  sont liés aux deux paragraphes P2 et P12.
                  OU faut-il simplifier et mettre systématiquement au bout ?…
                  Il me semble que c'est le meilleur choix.


                         - P3                 NP <----
           P1              P4
           NP              P5
           P2              P6
                           NP <---- (1)
                           P7
                           NP <----



                           P3  
           P1              P4
           NP              P5
           P2 ------\      P6
                     \     NP <----
                      \--- P7

                    /---- P3  
          P1 ------/      P4
          NP              P5
          P8              P10
          P9              P11
          P2 ------\      P6
                    \     NP <----
                     \--- P7


  Les conclusions des réflexions précédentes semblent les suivantes :

    Si aucun relatif n'existe, on compte le nombre de paragraphe après et
    on essaie de placer le nouveau parag dans les autres panneaux avant le
    même nombre de paragraphes (mais seulement si on les trouve).
    Si un relatif existe dans les paragraphes suivants, on met le nouveau
    paragraphe avant ce relatif.



* Retenir le panneau actif quand on quitte l'application pour le remettre au chargement du projet.

* Poursuivre le test Projet/save_spec.js

* Poursuivre l'implémentation des options
  - mettre en place la synchronisation automatique
    Principe : dès qu'un paragraphe est créé, il est automatiquement créé pour les
    autres panneaux.
    La méthode est en place, il faut voir comment l'implémenter

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
