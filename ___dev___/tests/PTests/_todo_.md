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
