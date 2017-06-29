* Ajouter à la méthode contains le traitement des listes.
* Reprendre le tests file_spec.js quand la méthode contains aura été actualisée
* Développer les méthodes de tests sur fichier
  * Ajouter le test de `contain` au fichier tests qui s'en occupe, avec un fichier et avec un dossier
  expect(path).asFile.to.exists
  expect(path).asFolder.to.contain(path)
  expect(file(path))
* Si isFile ou isFolder, tester `actual` qui doit impérativement est un string
* Développer le concept de "test prototypal" (noter que le "P" et P-Tests fait aussi référence à Python, pour l'imbrication)
  Qu'est-ce que signifie ce test ? Il signifie que si on charge une classe `Store`, par exemple, on peut lui coller des propriétés de test qui vont permettre d'être utilisées ensuite par PTests.
  Par exemple la méthode Store._respond_to(méthode) qui se comportera comme PTests en produisant un succès quand la méthode existera et un échec dans le cas contraire.
