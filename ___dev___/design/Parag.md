# Parag {#les_parags}

Les `Parag`(s) (pour « Paragraphes ») sont les entités de base de l'application `Script design`. Ils pourraient s'appeler `Paragraph` s'ils étaient des paragraphes, mais ils sont plus que ça, et peuvent contenir plusieurs paragraphes réels.

## Propriétés des `parags` {#parag_properties}

* [`id`](#parag_property_id),
* [`contents`](#parag_property_contents),
* [`classes`](#parag_property_classes)

### {Number} `id` {#parag_property_id}

Identifiant unique du paragraphe. Il est unique mais pas universel dans le sens où un identifiant dans le scénier, par exemple, a la même valeur que le même parag dans le synopsis ou le manuscrit.

Mais est-ce vraiment une bonne chose, dans le sens où un unique Parag peut donner lieux à plusieurs parags dans un autre document : un parag du synopsis va donner lieu à 5 parags du scénier et 20 parags dans le manuscrit. Pourtant, ils doivent être associés.

### {Number} `relative_id` {#parag_property_relatives}

Nombre qui conserve l'identifiant unique de la donnée des relatifs au Parag, c'est-à-dire ses correspondants dans les autres panneaux (synopsis, manuscrit, notes, etc.). Cf. [les relatives](#parag_relatives)

### {String} `contents` {#parag_property_contents}

Propriété la plus importante du parag, c'est le texte qui est affiché.

### {Array of Strings} `classes` {#parag_property_classes}

Ce sont les classes du parag, qui lui donneront un style et le feront appartenir à des rubriques particulière.

C'est un `Array` de `String`. Par exemple : `['action','bernard']`.

### {DateString} `created_at`, `updated_at` {#parag_property_created_updated_at}

Propriétés conservant la date de création et de dernière modification du parag.



## Les relatives (relatifs) {#parag_relatives}

```js

/* Pour un Parag #6 du synopsis */

{
    "scenier":[12] // Ce parag du synopsis correspond au paragraphe #12 du scénier
  , "manuscrit":[256,3698]  // ce parag du synopsis correspond aux parags 356 et
                          // 3698 du manuscrit
  , "notes":[14,15] // il correspond aux Parags 14 et 15 des notes
}

// En conséquence, le Parag #12, appartenant au synopsis, aura les relatives :
{
    "synopsis"  : [6]
  , "manuscrit" : [256,3698]
  , "notes"     : [14,15]
}

```

En conséquence, est-ce qu'il ne serait pas plus intelligent d'enregistrer une table contenant ces informations, à côté. Une table appelée par exemple `relatives.json` dans le dossier du projet, et qui contiendrait :

* la table des données relatives,
* la correspondance entre un identifiant et un élément de cette table.

C'est-à-dire, par exemple pour le parag #6 que nous venons de voir :

```js
{
  "relatives": {
    153 : {
        "synopsis"  : [6]
      , "scenier"   : [12]
      , "manuscrit" : [256,3698]
      , "notes"     : [14,15]
      // Noter qu'on distingue les provenances des ID (scénier, synopsis, etc)
      // mais que cette information pourrait très bien être zappée puisque les
      // IDs sont uniques et universels et qu'on peut donc retrouver, d'après
      // un ID, le containeur du parag.
    }    
  }
  "id2relatives":{
    6: 153
    12: 153
    256: 153
    3698: 153
    14: 153
    15: 153
  }
}
```


Comment ça marche :

1. Je fais un parag dans le synopsis. Il porte l'identifiant #1

Cela crée automatiquement une donnée `relative` :

```js
{
  "relatives":{
    ...
    12:{
      "synopsis":[1]
    }
  },
  "id2rel":{
    1: 12
  }
}
```

2. Je fais un autre parag. dans le scénier. Il porte l'identifiant #2. Ça crée une nouvelle donnée relative :

```js
{
  "relatives":{
    ...
    12:{
      "synopsis":[1]
    }
    , 13:{
      "scenier":[2]
    }
  },
  "id2rel":{
    1: 12,
    2: 13
  }
}
```

3. Je fais un autre paragraphe dans le scénier, qui porte l'identifiant #3. Ça crée un autre relatif :

```js
{
  "relatives":{
    ...
    12:{
      "synopsis":[1]
    }
    , 13:{
      "scenier":[2]
    }
    , 14:{
      "scenier":[3]
    }
  },
  "id2rel":{
    1: 12,
    2: 13
    3: 14
  }
}
```

Ensuite, on dit que le #1 et le #2 sont les mêmes (plus tard, on pourra dire que le #1 et les deux autres sont mergés). Le programme transforme alors la donnée en :


```js
{
  "relatives":{
    ...
    12:{
        "synopsis":[1]
      , "scenier": [2]
    }
    // SUPPRESSION DE LA DONNÉE 13
    // , 13:{
    //   "scenier":[2]
    // }
    , 14:{
      "scenier":[3]
    }
  },
  "id2rel":{
      1: 12
    , 2: 12,  // <= avant, c'était 13
    , 3: 14
  }
}
```

Comment ça marche :
-------------------

* Le programme cherche la donnée relatives de #2. C'est la #13
* Le programme cherche la donnée relatives de #1. C'est la #12
* Le programme merge la donnée #13 dans la 12
* Le programme supprimer la relative #13
* Le programme met l'id2rel de la #2 à #12


« Faire une synchro » correspond alors à créer des relations de relatives en créant des parags.

Par exemple, on a les parags #2, #4 et #5 dans le synopsis.

On a donc, dans la données des relatives :

```js
{
  "relatives":{
    12: { "synopsis":[2]}
    15: { "synopsis":[4]}
    25: { "synopsis":[5]}
  }
  "id2rel":{
    2: 12,
    4: 15,
    5: 25
  }
}

```

On va donc créer pour chaque parag un parag équivalent dans les autres panneaux :

* le scénier,
* le traitement,
* les notes,
* le manuscrit,

Ce qui va créer au niveau de la table des relatives, après le scénier :


```js
{
  "relatives":{
    12: { "synopsis":[2], "scenier":[7]}
    15: { "synopsis":[4], "scenier":[8]}
    25: { "synopsis":[5], "scenier":[9]}
  }
  "id2rel":{
    2:  12,
    4:  15,
    5:  25,
    7:  12,
    8:  15,
    9:  25
  }
}

```

Après le traitement :


```js
{
  "relatives":{
    12: { "synopsis":[2], "scenier":[7], "treatment":[10]}
    15: { "synopsis":[4], "scenier":[8], "treatment":[11]}
    25: { "synopsis":[5], "scenier":[9], "treatment":[12]}
  }
  "id2rel":{
    2:  12,
    4:  15,
    5:  25,
    7:  12,
    8:  15,
    9:  25,
    10: 12,
    11: 15,
    12: 25
  }
}

```


Après les notes :


```js
{
  "relatives":{
    12: { "synopsis":[2], "scenier":[7], "treatment":[10], "notes":[13]}
    15: { "synopsis":[4], "scenier":[8], "treatment":[11], "notes":[14]}
    25: { "synopsis":[5], "scenier":[9], "treatment":[12], "notes":[15]}
  }
  "id2rel":{
    2:  12,
    4:  15,
    5:  25,
    7:  12,
    8:  15,
    9:  25,
    10: 12,
    11: 15,
    12: 25,
    13: 12,
    14: 15,
    15: 25
  }
}

```

… etc.

Noter que la table "id2rel" pourrait être calculée lorsqu'il y a modification des relations.
