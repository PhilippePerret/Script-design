* Il faut rendre les tests asynchrones pour pouvoir avoir vraiment du test
  Comment le faire ?
  J'ai déjà mis en place les méthodes waitForVisible et waitForNotVisible qui
  fonctionnent comme des promesses.
  La solution “hackée” pourrait être que dès qu'on utilise une méthode asynchrone,
  on passe aux tests une variable qui indique qu'il faut attendre la fin de
  l'exécution du code. Attention, il peut y en avoir plusieurs, donc on doit
  toutes les attendre.
  On utilise un id pour chaque waiter :

  PTests.addWaiter( <specs> ){
    waiters.push({...., running: true})
    return <identifiant unique pour le waiter (index dans la liste)>
  }

  La méthode qui appelle le fichier suivant attend jusqu'à ce que tous les
  waiters aient terminé de travailler puis run le fichier suivant

  dans la méthode qui run les fichiers :
  - si pas de waiters, on passe tout de suite à la suite
  - si un waiter, on attend (setInterval) que le fichier ait terminé puis on
    passe à la suite.


* Écrire en kramdown les textes
  Donc, aussi, pouvoir récupérer et construire les tables des matières
* Pouvoir supprimer une association (Relatives)
* Pouvoir supprimer un parag (il y a une issue sur github)

* Il faut calculer les tailles des éléments dans la fenêtre projet :
  - au resize de la fenêtre (si on permet son redimensionnement)
  - au chargement
  * section.projet (section blanche avec bords arronds sur fond body)
  * div.panneau-contents (le contenu scrollable des panneaux). Normalement, doit faire 100 de moins que section.projet

* Chaque fois qu'on ouvre une fenêtre, on enregistre dans le fichier des données de l'application la dernière fenêtre ouverte, pour l'ouvrir par défaut lors du prochain lancement de l'application.
