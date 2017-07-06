# Les Tabulators {#les_tabulators}

[map]: #tabulator_map
[`Map`]: #tabulator_map

Les `tabulators` sont un système de gestion de l'interface inédit qui fonctionne à l'image d'un menu : quand on focus sur le tabulator, il s'ouvre (ou pas) pour montrer ses outils. Chaque outil, ou menu, est associé à une lettre, dans l'ordre de la rangée intermédiaire du clavier (q, s, f, g, h, j, etc.) puis dans l'ordre de la rangée supérieure (a, z, e, r, etc.).

On clique sur la lettre associée pour activer l'outil.

Un des grands avantage de ce système est qu'on peut facilement (touche `MAJ` ou `CAPS LOCK`) choisir plusieurs outils/commandes/menus et lancer l'opération en enchainant ces outils/commandes/menus.

## TODO LIST

* Proposer plusieurs class CSS de tabulator pour gérer les aspects.

## Implémentation {#tabulator_implemtation}

* **Créer le code HTML des tabulators**. On commence pour créer le code dans la page, à l'aide de balises `tabulator` et de `button`(s) :

```html

  <tabulator id="un-identifiant-obligatoire" tabindex="1">
    <button>Mon premier bouton</button>
    <button>Mon deuxième bouton</button>
    <!-- etc. -->
  </tabulator>

  <!-- .... -->


  <tabulator id="autre-identifiant-requis" class="tools" tabindex="2"> <!-- (2) -->
    <picto>🛠</picto> <!-- (1) -->
    <button data-tab="first">Ma première commande</button>
    <button data-tab="second">Ma deuxième commande</button>
    <button data-tab="third">Ma troisième commande</button>
    <!-- etc. -->
  </tabulator>

```

> (1) Dans le style "tools", le tabulator affiche le picto quand il n'est pas focusser. Sinon, il le masque et affiche les bouttons
> (2) Noter que les `tabindex` sont obligatoires pour que l'on puisse focusser sur le tabulator.

* **Charger la librairie `Tabulator`**. On charge la librairie `tabulators.js` soit par `require` normal :

```js

let Tabulator = require('./path/to/tabulators.js')

```

… soit par `requirejs` :

```js

requirejs(
  [
    './path/to/tabulators'
  ],(
    Tabulator
  )=>{

    // ... définitions ...
  }
)

```

* **Définir la Map du tabulator**. Il faut ensuite définir la [`Map`] de tabulator, c'est-à-dire les actions qui vont être entreprises au choix des lettres. Cela se fait à l'aide de `Tabulator.Map`

```js

  Tabulator.Map = {
    '<id de balise tabulator>':{
      // Par les lettres
        'q': monObjet.maMethode.bind(monObjet)
      , 's': monObjet.autreMethode.bind(monObjet)
      , 'd': monObjet.troisMethode.bind(monObjet)
      // Par les data-tab si définis
      , 'first': monObjet.maMethode.bind(monObjet)
      , 'second': monObjet.autreMethode.bind(monObjet)
      , 'third': monObjet.troisMethode.bind(monObjet)
      // ... etc.
    }
    , '<id autre tabulator>':{
      enter_method: monObjet.methodDeTraitementPropre.bind(monObjet)
    }
    , '<id troisieme tabulator>':{
      // ... etc.
    }
  }

```

On doit définir ainsi tous les tabulators de la page. Noter que la définition par lettre est moins solide que la définition par `data-tab`. En effet, il suffit qu'un menu soit ajouté, supprimé ou déplacé pour que les lettres, qui sont attribuées dans l'ordre par l'application, ne se retrouvent plus associées avec les bonnes méthodes. Voir [ici une illustration concrète de l'écueil de l'association par lettre](#ecueil_association_par_lettre)



* **Initialiser les tabulators**. Puis, enfin, avant le début du programme, on demande l'initialisation des tabulateurs. Noter qu'il faut impérativement définir la `Map` avant ce `setup` :


```js

Tabulator.setup()

```

> C'est cette méthode `setup` qui finalise l'affichage des tabulateurs en ajoutant par exemple la lettre à côté du menu.

## `Map` des tabulators {#tabulator_map}

La `Map`, propriété de `Tabulator` (`Tabulator.Map`) est la donnée qui définit la relation entre les lettres et l'action à accomplir.

Elle définit les données en fonction de chaque tabulator (qui doit nécessairement avoir un identifiant unique, justement pour définir cette map) :

```js

Tabulator.Map = {
    '<id tabulator 1>': { /* définition ici */ }
  , '<id tabulator 2>': { /* définition ici */ }
  , '<id tabulator 3>': { /* définition ici */ }
  // ... etc.
}

```

On définit ensuite à l'intérieur de chaque table les actions à mener, avec en clé la lettre correspondant au menu.

```js

  Tabulator.Map['<id tabulator 3>'] = {
    'q': monObjet.maMethode.bind(monObjet) // meilleure formulation, avec objet bindé
    's': //... etc.
  }

```

On peut définir aussi une méthode qui sera toujours appelée avant l'opération ou toutes les opérations (`beforeAll`) ou une méthode qui sera appelé après (`afterAll`), ou les mêmes mais avant chaque opération retenue (`beforeEach` et `afterEach`) :

```js

  Tabulator.Map['<tabulator1>'] = {
    beforeAll: monObjet.methodBeforeAll.bind(monObjet),
    beforeEach: monObjet.methodBeforeEach.bind(monObjet),
    // ...
    // Définition des lettres
    // ...
    afterEach: monObjet.methodAfterEach.bind(monObjet)
    afterAll: monObjet.methodAfterAll.bind(monObjet)
  }

```

Par exemple, si les touches 'a', 'f' et 'g' ont été choisies (avec `CAPS LOCK` enfoncée), et que toutes ces méthodes sont définies, alors :

```

    1. La méthode BeforeAll est exécutée

    2. La méthode BeforeEach est exécutée
    3. La méthode définie pour 'a' est exécutée
    4. La méthode AfterEach est exécutée

    5. La méthode BeforeEach est exécutée
    6. La méthode définie pour 'f' est exécutée
    7. La méthode AfterEach est exécutée

    8. La méthode BeforeEach est exécutée
    9. La méthode définie pour 'g' est exécutée
    10. La méthode AfterEach est exécutée

    11. La méthode AfterAll est exécutée

```

On peut également définir un nombre maximum de sélections dans la liste des menus/commandes/outils à l'aide du paramètre `maxSelected` :

```js

  Tabulator.Map['<tabulator id>'] = {
    maxSelected: 3,
      'q': monObjet.maMethodeA.bind(monObjet)
    , 's': monObjet. // etc.
  }

```


### Définir une méthode de traitement propre (`enter_method`) {#tabulator_define_enter_method}

```js

  Tabulator.Map = {
    '<id tabulator>':{
      enter_method: monObjet.maMethode.bind(monObjet)
    }
  }

  // Ailleurs
  class monObjet {
    /**
    * Traitement des keys sélectionnées. Ce sont les lettres, dans l'ordre,
    * associées aux boutons/menus. Par exemple ('a','j','s').
    **/
    maMethode ( keys )
    {
      keys.forEach( (letter) => {
        // Traitement de la lettre +letter+
      })
    }
  }
```


## Annexes

### Écueil de l'association par lettre dans la Map {#ecueil_association_par_lettre}

Soit un tabulator avec trois boutons :

```html

<tabulator id="montabor">
  <button>Ouvrir la porte</button>
  <button>Fermer la fenêtre</button>
  <button>Donner à manger au chien</button>
</tabulator>

```

Tels que définis, les boutons seront associés dans l'ordre aux lettres `q`, `s` et `d`.

Et donc on pourra définir la [`Map`] par :

```js

Tabulator.Map = {
  'montabor':{
      'q': moi.ouvrirPorte.bind(moi)
    , 's': moi.fermerFenetre.bind(moi)
    , 'd': moi.nourrirChien.bind(moi)
  }
}

```

Le problème de cette définition, même si elle est la plus courte, est qu'il suffit que la liste des boutons changent pour avoir à redéfinir la `Map`. En effet, si on supprime le deuxième bouton (“Fermer la fenêtre”), la lettre `d` ne servira plus à nourrir le chien, c'est la lettre `s` qui le fera.

Il est préférable d'utiliser les `data-tab`, c'est un peu plus long mais plus sûr :


```html

<tabulator id="montabor">
  <button data-tab="open-door">Ouvrir la porte</button>
  <button data-tab="close-window">Fermer la fenêtre</button>
  <button data-tab="feed-dog">Donner à manger au chien</button>
</tabulator>

```

Et la [`Map`] devient alors :

```js

Tabulator.Map = {
  'montabor':{
      'open-door': moi.ouvrirPorte.bind(moi)
    , 'close-window': moi.fermerFenetre.bind(moi)
    , 'feed-dog': moi.nourrirChien.bind(moi)
  }
}

```

Maintenant, quelles que soient les associations de `keys` pour activer les menus/boutons, ce sont les bonnes opérations qui seront invoquées. That's it! :-)
