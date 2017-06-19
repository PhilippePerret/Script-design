# Tests

On essaie de développer l'application par les tests.

Pour commencer, on teste la création d'un nouveau projet.


Module général : on doit pouvoir créer un nouveau projet
Le module renvoie `true` si le nouveau projet a été créé, `false` dans le cas contraire.

* On ne peut pas créer un nouveau projet sans titre
* On ne peut pas créer

* Un projet a besoin d'un titre
* Un projet a besoin d'au moins un auteur
* Un projet peut avoir plusieurs auteurs

* Une instance projet est créée dans la table `projets`
* Elle définit la date de création du projet
* Elle définit les auteurs du projet
* Elle crée un premier évènement dans la table `events`, qui est le résumé du projet (testé plus tard)

## Test du résumé du projet

* La donnée `resume` du projet est l'identifiant de l'évènement qui le définit
* Cet event n'a pas de parent
* Cet event a une bonne date de création
* Cet event a la bonne échelle (`scale`)
* Cet event a le bon contenu (`content`)
