* Faire une pause pour afficher les tests les uns après les autres, progressivement, dans la page (note : c'est peut-être ce qui se passe mais je voudrais le voir en action)
* => documenter les "and" des it
* => tester les "and" des it
* Poursuivre les autres méthodes
* Développer le concept de "test prototypal" (noter que le "P" et P-Tests fait aussi référence à Python, pour l'imbrication)
* Tester la méthode contain (avec expression régulière aussi, dans les deux modes strict/non strict)
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
