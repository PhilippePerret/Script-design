
[Définition des données de la fenêtre]: #definition_donnees
[Fichier HTML/EJS complet]: #fichier_html_ejs_complet
[Fichier javascript principal]: #fichier_main_js

# Les fenêtres {#les_fenetres}


## Conception d'une nouvelle fenêtre {#new_window}

### Aperçu rapide {#newwindow_quickoverview}

* [Définition des données de la fenêtre]() dans `DATA_WINDOWS` de `./lib/main/window.js`.
* [Fichier HTML/EJS complet] à la racine `./__windows__` (p.e. `./__windows__/board.ejs`).
* Dossier portant comme nom l'affixe du fichier, dans `./__windows__` (p.e. `./__windows__/board/`). Ce dossier est appelé le **dossier de la vue**.
* Dans ce dossier, on peut faire les dossier `js`, `css`, `img` (pour les images propres à la page), `html` (pour les partiels), `modules` et autres dossiers utiles.
* Un premier fichier javascript doit permettre de définir les raccourcis clavier généraux.

### Exemple pour une fenêtre aide

### Explication détaillée

Une fenêtre se définit très simplement dans le module `./lib/main/window.js`, dans la donnée `DATA_WINDOWS`.

* Renseigner d'abord la donnée DATA_WINDOWS pour savoir où la fenêtre doit être placée et la dimension qu'elle doit faire, etc. tout ce qui concerne `BrowserWindow`.
* Faire le fichier HTML pour la fenêtre dans le dossier `./__windows__`. C'est un code complet de page HTML, même pour un petit menu.
* Ensuite, il suffit d'utiliser le code `Window.open('relpath/in/__windows__'/* sans .ejs */)` (1) pour ouvrir cette fenêtre.


(1) En fait, il s'agit normalement de l'affixe du fichier qui contient la fenêtre. Par exemple, c'est `screensplash` pour la fenêtre d'ouverture, qui correspond au fichier `./__windows__/screensplash.ejs`.

Ensuite, pour simplifier encore le code, on peut définir une propriété dans `Window` qui renverra cette fenêtre. Par exemple `Window.screensplash` retourne la fenêtre de démarrage, et il suffit de faire `Window.screensplash.show()` pour l'afficher.

Par exemple, dans `lib/main/on_ready.js`, on peut trouver :

```javascript

app.on('show-screensplash', () => {
  Window.screensplash.show()
})

```

Et donc, de n'importe quelle fenêtre, on peut faire `ipc.send('show-screensplash')` pour ouvrir la fenêtre de démarrage.

Ce *raccourci* se définit dans `lib/main/window.js`. S'inspirer que `static get screensplash`.


## Détail des éléments {#detail_elements}

### Définition des données {#definition_donnees}

Ce sont les données qui seront fournies à `BrowserWindow` pour la création d'une nouvelle instance.

### Fichier HTML/EJS complet {#fichier_html_ejs_complet}

C'est un fichier HTML conforme et complet, avec `head` et `body`.

Les `CSS`, les `JS` et les images sont insérés avec des paths partant du dossier de la vue. S'il s'agit de la vue `./__windows__/board.ejs`, elle doit contenir un dossier `./__windows__/board`. Les adresses seront :

```html

  src="board/js/mon_javascript.js"
  src="board/img/monimage.png"
  href="board/css/monfichier_styles.css"

```

Les inclusions EJS sont dans le même fichier :

```ejs

  <!-- Dans le fichier ./__windows__/board.ejs -->
  ...
  <% include board/html/mon_partiel.ejs %>

```

### Fichier javascript principal (main.js) {#fichier_main_js}

Ce fichier se trouve dans le dossier de la vue, par exemple, si la vue est `board`, à l'adresse

        ./__windows__/board/js/main.js

Il est chargé à la fin du [Fichier HTML/EJS complet] par :

        <script type="text/javascript" src="board/js/main.js"></script>

Il est au format `RequireJS` et peut contenir :

~~~javascript



~~~

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


## Fenêtre du projet {#fenetre_du_projet}

On appelle « fenêtre du projet » la fenêtre qui s'ouvre après que l'utilisateur a soit créé un nouveau projet soit choisi un projet existant. La fenêtre du projet s'ouvre, affichant le projet en particulier.

* C'est une fenêtre qui occupe toute la page
* Elle affiche un espace d'édition principal (textarea) qui va permettre d'afficher et d'éditer toutes les données
* Elle pourrait aussi présenter le texte du projet
* Elle pourrait afficher des données en fonction de l'état d'avancement du projet (quand le projet en est au scénario, elle affiche le scénario, quand le projet en est au début, elle affiche le résumé, etc. en d'autres termes, l'application doit détecter où en est le projet et proposer le meilleur affichage)

Les affichage principaux sont :

* Les données générales de tout le projet avec des données statistiques (nombre de pages, de personnages, de jours de travail, d'auteurs, de scènes, etc.)
* Le manuscrit final en lecture (scénario ou manuscrit)
* Le manuscrit final en édition
* Le scénier complet en lecture/édition
* Le synopsis détaillé complet en lecture
* Le synopsis détaillé complet en édition
* les fiches personnages doivent être des fenêtres à part (-> fenêtres "personnages" et "personnage")

Question : comment gérer ces différentes pages ? Faut-il en créer de nouvelles, ne modifiant simplement l'URL et tout ce qui va avec ou faut-il créer vraiment de nouvelles pages ?
Dans un premier temps, je vais me contenter de changer l'URL d'une page
