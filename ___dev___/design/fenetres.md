# Les fenêtres {#les_fenetres}


## Conception d'une nouvelle fenêtre {#new_window}

Une fenêtre se crée très simplement dans le module `./lib/main/window.js`.

* Renseigner d'abord la donnée DATA_WINDOWS pour savoir où la fenêtre doit être placée et la dimension qu'elle doit faire, etc. tout ce qui concerne `BrowserWindow`.
* Faire le fichier HTML pour la fenêtre dans le dossier `./__windows__`. C'est un code complet de page HTML, même pour un petit menu.
* Ensuite, il suffit d'utiliser le code `Window.open('relpath/in/__windows__'/* sans .ejs */)` (1) pour ouvrir cette fenêtre.


(1) En fait, il s'agit normalement de l'affixe du fichier qui contient la fenêtre. Par exemple, c'est `screensplash` pour la fenêtre d'ouverture, qui correspond au fichier `./__windows__/screensplash.ejs`.

Ensuite, pour simplifier encore le code, on peut définir une propriété dans `Window` qui renverra cette fenêtre. Par exemple `Window.screensplash` retourne la fenêtre de démarrage, et il suffit de faire `Window.screensplash.show()` pour l'afficher.

Par exemple, dans `lib/main/on_ready.js`, on peut trouver :

```
app.on('show-screensplash', () => {
  Window.screensplash.show()
})
```

Et donc, de n'importe quelle fenêtre, on peut faire `ipc.send('show-screensplash')` pour ouvrir la fenêtre de démarrage.

Ce *raccourci* se définit dans `lib/main/window.js`. S'inspirer que `static get screensplash`.
