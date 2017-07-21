## Méthodes de tests DOM {#les_dom_methodes}

### Pour attendre qu'un élément soit visible/invisible {#dom_methodes_waitvisible}

On utilise les méthodes `waitForVisible` ou `waitForNoVisible` pour lancer seulement un test après qu'un élément DOM soit visible ou non visible.

@syntaxe complète :

```js

describe("Un test seulement si un nœud existe",[
  , it("n'est lancé que s'il existe", ()=>{
    waitForVisible('div#mon-element')
      .then( () => {
        // Code à exécuter dès que le div#mon-element est
        // visible dans la page.
      })
      .else( () => {
        // Si le timeout a été atteint avant de voir l'élément
      })
  })
  , it("n'est lancé que lorsque l'élément a été supprimé", ()=>{
    waitForNotVisible('div#supp-element')
      .then( () => {
        // Code/test à faire dès que le div#supp-element n'est plus
        // visible.
      })
      .else( () => {
        // Si le timeout a été atteint avant de voir l'élément disparaitre
      })
  })
])

```

On peut envoyer des options à ces deux méthodes. Cf. `Methodes_attentes.md`.

```js

  waitForVisible(<element>[, <options>])

```

## Checker l'existence dans un élément

On utiliser la propriété `in` des options. Par exemple :

```js

waitForVisible(<element>, {in: <container>})

waitForVisible('div#p-1', {in: panneau.container})
  .then ( () => {
    ...
  })
  
```
