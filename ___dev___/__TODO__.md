* Voir les bugs sur le site…

* Les relatives restent à remettre complètement (il y a notamment une méthode importante qui est entièrement commentée)

* Tester le titre dans le panneau des brins ("Liste des brins" ou "Brins du parag #x" quand un parag est sélectionné — ouverture à partir du verso)

* les brins sont encore à tester, mais il y a beaucoup de choses à comprendre je pense au niveau de l'initialisation…
* tester qu'on ne puisse pas choisir plus de 8 brins pour le parag
  Note : il faut créer 9 brins
* Ranger un peu les classes `Brins` et `Brin`

* Implémenter le même traitement que editablecontent on blur, mais à l'édition : quand une certaine méthode existe, par exemple 'onedit_<propriété>', on pourrait utiliser une autre action que la simple édition du champ. Si cette méthode n'existe pas, on utilise la méthode normale
  Essayer ça avec les types, dont on doit proposer une liste


* RÉFLÉCHIR ENCORE AU PROBLÈME SUIVANT :
  Soit le parag 19
  Il est demandé sa synchronisation
  On crée le #20 dans le panneau Notes
  On crée le #21 dans le panneau Manuscrit

  La question est la suivante : quand un parag est associé à un autre, faut-il
  les synchroniser avec tous les parags associés ?

    Associés                      Associés
   v-------v            v---------v-------------v
  #20     #21          #27       #23           #24
          #22          #28       #29           #25
                                 #30           #26

  Lorsque #20 et #26 sont associés, faut-il associer tous ces associés ?

  Faut-il plutôt n'associer que les parags directs ?
  Donc :
    #26 va être associé à #21 et #22 par #20
    #20 va être associé à #23, #29 et #30 par #26


* Reprendre le load des panneaux, faire une liste de toutes les instanciations, puis l'envoyer
  à parags.add avec l'option display = false

* next et previous des parags doivent pouvoir fonctionner aussi quand les parags ne sont pas chargés (loaded = false). Il suffit de tester dans _ids des parags du panneau

* Synchronisation
  Maintenant, la synchronisation, quand le panneau n'est pas chargée, doit juste
  consister en :
    - créer un nouveau paragraphe dans le fichier
    - ajouter l'id dans la propriété `pids` du panneau (sans avoir à le construire
      entièrement).

* Remplacer les balises PARAG#<id> par un lien qui affiche au survol le texte du paragraphe.

* Prévoir à la fin du paragraphe un espace pour indiquer plein de choses et notamment le
  fait que le paragraphe soit lié à d'autres paragraphes.

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
