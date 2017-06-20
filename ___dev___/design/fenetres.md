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


## Fenêtre des projets {#fenetre_projets}

La `fenêtre des projets` est la première fenêtre qui s'ouvre après l'écran de démarrage.

C'est la fenêtre `./__windows__/projets.ejs`.

Elle permet de :

* créer un nouveau projet,
* lister les projets actuels,
* définir les préférences générales de l'application (ouvrir la fenêtre des préférences)

Elle est donc composée, à gauche, d'un listing des projets courants et à droite d'un formulaire de création d'un nouveau projet :

```
      --------------------------------------------------
      |                                                 |
      | [L]iste                 [N]ouveau projet        |
      | -------------------                             |
      | | Projet 1        |                             |
      | | Mon film        |     Titre   ______________  |
      | | Un roman        |     Type    <menu>          |
      | |                 |     Résumé  ______________  |
      | |                 |             ______________  |
      | |                 |             ______________  |
      | |                 |                             |
      | -------------------                             |
      |           [Ouvrir]                      [Créer] |
      |-------------------------------------------------|
      | <divers boutons> [[P]références]                |
      |-------------------------------------------------|

```

Rappel : comme l'application est pensée pour être entièrement pilotable avec le clavier, on prévoit déjà ici les raccourcis :

* "L" : pour placer le focus dans la liste. Les flèches permettent de se déplacer d'un projet à l'autre, la touche ENTER permet de sélectionner le projet.
* "N" : pour placer le focus sur le titre d'un nouveau projet. Les tabulations permettent de passer d'un champ à l'autre, la touche ENTER permet de créer le nouveau projet.
* "@" : permet, comme partout, d'obtenir de l'aide sur la fenêtre courante.
* "P" : permet d'ouvrir le panneau des préférences.


## Section active {#section_active}

Parfois, une fenêtre peut avoir plusieurs sections activable. C'est par exemple le cas avec la fenêtre des projets qui présente :

* une section pour choisir un projet dans la liste des projets,
* une section pour créer un nouveau projet.

Pour chacune de ces sections, il faut définir le bouton de class `default` qui sera mis en bleu dans la section active.

```
<section id="ma-section" class="active">
  <!-- C'est la class 'active' ----^----- qui détermine que le bouton
      'default' ci-dessus sera bleu et le bouton de la touche Enter.
    -->


  <div class="buttons">
    <!--
        Le bouton qui sera mis en bleu et qui sera simulé lorsque la
        touche Enter sera cliquée
        -->
    <button class="default" onclick="mafonction()">Enregistrer</button>
  </div>

</section>

```
