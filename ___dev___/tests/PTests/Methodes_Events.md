# Méthode events


* Simuler une touche avec [`KB.press(...)`](#event_presskeyboard)
* [`EV.focusIn(...)`](#event_focusin)

## Simuler une touche clavier avec `KB.press(...)` {#event_presskeyboard}

Simule une touche au clavier en passant par le cycle `keyDown`, `keyPress` et enfin `keyUp`.

```js

KB.press('a', {altKey: true})
KB.press('Q', {ctrlKey: true})
```


## `EV.focusIn(...)` {#event_focusin}

Focusse dans l'élément DOM donné en argument. L'argument peut être fourni soit comme `HTMLElement`, soit comme `Selector CSS`. Par exemple :

```js

let o = document.getElementById('monElement')
EV.focusIn(o)

// ou

EV.focusIn('div#monElement')

```
