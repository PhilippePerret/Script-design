# Les méthodes d'attente

* [`waitFor`](#waitmethode_for)
* [`waitForVisible`](#waitmethode_forvisible)
* [`waitForNotVisible`](#waitmethode_fornotvisible)
* [`waitForTrue`](#waitmethode_fortrue)
* [`waitForFalse`](#waitmethode_forfalse)


## `waitFor` {#waitmethode_for}

Permet d'attendre un certain nombre de secondes (flottant possible.)

```js

  waitFor(12.5 /* attend 12 secondes et demi */)
    .then( () => {
      ...
    })
```

## `waitForVisible` {#waitmethode_forvisible}

Cf. le document Methodes_DOM.md

## `waitForNotVisible` {#waitmethode_fornotvisible}

Cf. le document Methodes_DOM.md

## `waitForTrue` {#waitmethode_fortrue}

Permet d'attendre qu'une valeur soit vrai pour poursuivre.

```js

  waitForTrue(()=>{return maValeur})
    .then( () => {
      ... à faire lorsque maValeur est vraie ...
    })
    .else( () => {
      ... à faire après le timeout ...
    })

```

On peut utiliser en second argument de `waitForTrue` les mêmes arguments que tous les `PTestsWaiters`.


## `waitForFalse` {#waitmethode_forfalse}

Permet d'attendre qu'une valeur soit false pour poursuivre.

```js

  waitForFalse(()=>{return maValeur})
    .then( () => {
      ... à faire lorsque maValeur devient false ...
    })
    .else( () => {
      ... à faire après le timeout ...
    })

```

On peut utiliser en second argument de `waitForFalse` les mêmes arguments que tous les `PTestsWaiters`.


## Options des méthodes d'attentes

```

  waitFor...(<arg>[, <options>])

  options
  -------

      timeout       Le laps maximum d'attente. Si rien n'a changé après ce
                    temps, on considère qu'on ne peut pas continer et on
                    passe à `else`.
                    Défaut : 30 secondes


      checklaps     L'intervale entre deux checks du DOM, 1 10e de seconde
                    par défaut. Si l'on sait que l'élément peut mettre du
                    temps à apparaitre, on peut augmenter cette valeur pour
                    ne pas multiplier les vérifications.
                    Défaut : 100ms

```
