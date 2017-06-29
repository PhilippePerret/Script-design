* Implémenter la méthode 'puts' qui doit permettre d'écrire des choses dans le rapport (pour un retour rapide)

* => tester les deux utilisations des "MAIS" (OK… MAIS et ERREUR… MAIS)
* Poursuivre le test de l'égalité (avec Any)
* => documenter l'utilisation des options dans l'expect (`expect(4, null, {...options...})`)
* => Tester l'utilisation des options dans l'expect (`expect(4, null, {...options...})`)
* Documenter `NaT` pour dire `not_a_test` dans les options
* Faire une pause pour afficher les tests les uns après les autres, progressivement, dans la page (note : c'est peut-être ce qui se passe mais je voudrais le voir en action)
* => documenter les "and" des it
* => tester les "and" des it
* Développer le concept de "test prototypal" (noter que le "P" et P-Tests fait aussi référence à Python, pour l'imbrication)
  Qu'est-ce que signifie ce test ? Il signifie que si on charge une classe `Store`, par exemple, on peut lui coller des propriétés de test qui vont permettre d'être utilisées ensuite par PTests.
  Par exemple la méthode Store._respond_to(méthode) qui se comportera comme PTests en produisant un succès quand la méthode existera et un échec dans le cas contraire.
* Tester la méthode contain (avec expression régulière aussi, dans les deux modes strict/non strict)
  => L'implémenter dans la class Any
* On peut ne mettre que deux arguments (expected, options) à la méthode d'expectation
  * => tester
  * => documenter
* Options `not_a_test`
  * => tester
  * => documenter (dans le refbook du programmeur seulement ?)
* Options `no_values`
  * => documenter
  * => tester
