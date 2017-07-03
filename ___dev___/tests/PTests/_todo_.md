* Comme on utilise souvent des fonctions pour produire l'erreur, il faut relever les lignes des erreurs qui précèdent l'erreur trouvée. Peut-être faut-il simplement relever toutes les lignes du fichier test trouvé !
* Les pendings doivent laisser un message dans le rapport de test.
* Pouvoir provoquer un échec ou un succès explicitement à l'intérieur d'un `it`

```js

  , it("un cas qui provoque volontairement une failure", ()=>{
    fail("Ma failure")
  })
  , it("un cas qui provoque volontairement un succès", ()=>{
    pass("Mon succès")
  })

```

* Documenter `to.be.null` (et avec true, false, undefined)
  * penser à préciser qu'il faut mettre strictly pour avoir une vérification exacte, sinon, null sera égal à undefined et à false.
