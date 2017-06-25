* Pouvoir mettre un describe dans un describe (imbrications)
* Poursuivre les autres méthodes
* Développer le concept de "test prototypal"
* Tester la méthode contain (avec expression régulière aussi, dans les deux modes strict/non strict)
* Pouvoir ne mettre que deux arguments à la méthode de comparaison (donc sans expect_str). Faire un test sur le typeof du deuxième argument. Si String => c'est expect_str, sinon, c'est options.
  * => tester
  * => documenter
* Options de méthode de comparaison (2e argument). Pouvoir mettre `not_test: true` pour dire que l'évaluation ne doit pas produire d'expectative. C'est utiliser lorsqu'on fait le test de l'application, pour étudier le retour. Voir ci-dessous
  * => tester (comment ?)
  * => documenter (dans le refbook du programmeur seulement ?)
