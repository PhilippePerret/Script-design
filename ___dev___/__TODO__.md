* Voir les bugs sur le site

* Poursuivre le test des relatives
  * Pour définir les parags au clavier, il faudrait fonctionner un peu comme les brins : utiliser les flèches H/B pour se déplacer et les flèches D/G pour retirer ou ajouter. Avec un signe sur le côté qui déterminer le choix.
  Il faut également pouvoir passer d'un panneau à l'autre.

* les brins sont encore à tester, mais il y a beaucoup de choses à comprendre je pense au niveau de l'initialisation…
* tester qu'on ne puisse pas choisir plus de 8 brins pour le parag
* Ranger un peu les classes `Brins` et `Brin`


* Prévoir à la fin du paragraphe un espace pour indiquer plein de choses et notamment le
  fait que le paragraphe soit lié à d'autres paragraphes.

* Retenir le panneau actif quand on quitte l'application pour le remettre au chargement du projet.
  => Peut-être dans un fichier 'status.json' où on trouverait tout ça (ça éviterait d'avoir
      un fichier avec les données titre et autres et ça qui peut changer tout le temps)

* Poursuivre le test Projet/save_spec.js  

* Travailler le pied de page
  - Rendre l'aide plus apparente dans le panneau projet (ligne du bas)
  - Documenter la ligne du bas avec le nombre de paragraphes, etc. et des aides/suggestions de raccourcis.

* Pouvoir supprimer une association (Relatives)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet
