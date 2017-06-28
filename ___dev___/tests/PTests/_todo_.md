* Toujours ajouter une espace en début de description de describe ou de contexte si la description ne commence pas par "::", "#" ou "."
  * => Modifier la documentation en supprimant le truc qui dit qu'il faut ajouter une espace.
* Utiliser Any pour gérér le `contain`
  * => tester
  * utiliser Any dans `PTests` pour le contain
  * => tester
  * => documenter
* Remettre en forme le path du fichier test dans le rapport (gris)
  * Pouvoir cliquer dessus pour ouvrir le fichier
* Pouvoir faire un spec_helper.js (comme dans RSpec) qui permette de définir des choses générales

* Poursuivre le test et l'implémentation de la class Any
* Indiquer dans le read-me de l'application qu'elle sert aussi à mettre PTests au point
* Documenter (et tester) PTests.require_module (qui peut être utilisé par `require_module(...)`) dans les tests.
* => tester les deux utilisations des "MAIS" (OK… MAIS et ERREUR… MAIS)
* Implémenter la méthode 'respond_to'
  * => tester
  * => documenter
* Poursuivre le test de l'égalité (avec Any)
* => documenter les options dans l'expect (`expect(4, null, {...options...})`)
* => Tester les options dans l'expect (`expect(4, null, {...options...})`)
* Documenter `NaT` pour dire `not_a_test` dans les options
* Faire une pause pour afficher les tests les uns après les autres, progressivement, dans la page (note : c'est peut-être ce qui se passe mais je voudrais le voir en action)
* => documenter les "and" des it
* => tester les "and" des it
* Poursuivre les autres méthodes
* Développer le concept de "test prototypal" (noter que le "P" et P-Tests fait aussi référence à Python, pour l'imbrication)
* Tester la méthode contain (avec expression régulière aussi, dans les deux modes strict/non strict)
  => L'implémenter dans la class Any
* Pouvoir ne mettre que deux arguments à la méthode de comparaison (donc sans expect_str). Faire un test sur le typeof du deuxième argument. Si String => c'est expect_str, sinon, c'est options.
  * => tester
  * => documenter
* Options de méthode de comparaison (2e argument). Pouvoir mettre `not_a_test: true` pour dire que l'évaluation ne doit pas produire d'expectative. C'est utiliser lorsqu'on fait le test de l'application, pour étudier le retour. Voir ci-dessous
  * => tester (comment ?)
  * => documenter (dans le refbook du programmeur seulement ?)
* Documenter le test `instanceOf(...)` en précisant que l'argument peut être le nom de la classe en string (mais elle doit être connue du renderer process)
* Implémenter `with()` qui est utilisé après `call` pour injecter des arguments
  * => tester
  * => documenter
* Pouvoir envoyer un array `[Object, methode]` qui sera utilisé avec `call`. Donc on fera `Objet[methode].call()`
* Documenter et tester l'option `no_values: true` qui dit au test de ne pas écrire la vraie valeur quand un actual_str ou un expect_str est utilisé. Par exemple, si on a `expect(112, "l'âge du capitaine")`, le message commencera par "l'âge du capitaine (112)". Si `no_values: true` est utilisé (attention : dans le 3e argument de la méthode de comparaison, en fin de chaine), alors seulement "l'âge du capitaine" sera inscrit.
