* Profiter du test Store#data pour régler actual_str et expect_str pour qu'ils renvoient des JSON.stringify s'ils sont des objets.

* Implémenter les méthodes beforeAll, beforeEach, afterAll, afterEach
* Implémenter les méthodes beforeSuite et afterSuite (dans spec_helper.js) qui doivent être appelées avant de jouer toute suite de test.
* Développer le concept de "test prototypal" (noter que le "P" et P-Tests fait aussi référence à Python, pour l'imbrication)
  Qu'est-ce que signifie ce test ? Il signifie que si on charge une classe `Store`, par exemple, on peut lui coller des propriétés de test qui vont permettre d'être utilisées ensuite par PTests.
  Par exemple la méthode Store._respond_to(méthode) qui se comportera comme PTests en produisant un succès quand la méthode existera et un échec dans le cas contraire.
