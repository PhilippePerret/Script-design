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



## Les Relatives (relatifs) {#parag_relatives}

Les “relatives” permettent de tenir à jour la liste des relations entre les `parags`.

Cette liste permet par exemple de savoir que 25 parags du manuscrits sont issus de 12 parags du traitement qui eux-mêmes sont issus de 4 parags du scénier qui eux-mêmes sont issus de 2 parags du synopsis.

```                    
                                  /-- P568(treatment)
                /-- P89(scenier)----- P241(treatment)
                |                 \-- P546(treatment) ...
  P1(synopsis)--|                  \- P654(treatment)
                |    
                \-- P56(scenier)----- P478(treatment) ...

                                  /-- P321(treatment)
                /-- P23(scenier)----- P322(treatment) ...
                |                 \-- P323(treatment)
  P2(synopsis)--|                 \-- P324(treatment)
                |                 \-- P328(treatment)
                |   
                \-- P12(scenier) ---- P456(treatment) ...
                                  \-- P489(treatment)

```

La propriété `Projet#relatives` du projet est une instance `Relatives` qui conserve ces données.

Sa propriété `data` contient :


```js
{
  "created_at": "<date de création>",
  "updated_at": "<data de dernière modification>",
  "relatives": {
    // Définition des relations
  }
}
```


Comment ça marche :

1. Je fais un parag dans le synopsis. Il porte l'identifiant #1

Cela crée automatiquement une donnée `relative` :

```js

// Forme syntaxique :

{
  "relatives":{
    "<id du parag>":{"t":"<panneau une lettre>","r":{}}
  }
}

// Par exemple :
{
  "relatives":{
    "1":{"t":"y","r":{}} // "y" pour "synopsis"
  }
}

```

La donnée est créée mais aucune relation (`r`) n'est affectée.

Noter que l'identifiant du paragraphe est un `String`, pas un `Number` (tout simplement parce que la conversion en JSON transforme les clés numériques en clé string).

Noter que `"t"` signifie `type` et peut avoir comme valeur la lettre correspondant au panneau dans `Projet::DATA_PANNEAUX`. `"r"` signifie “relatives”.

On utilise des données courtes car cette table va être amenées à contenir des dizaines de milliers de relations.


2. Je fais un autre parag. dans le scénier. Il porte l'identifiant #2. Ça crée une nouvelle donnée relative :

```js

{
  "relatives":{
    "1":{"t":"y","r":{}} // "s" pour "scenier"
    "2":{"t":"s","r":{}}
  }
}

```

3. Je fais un autre paragraphe dans le scénier, qui porte l'identifiant #3. Ça crée un autre relatif :

```js
{
  "relatives":{
    "1":{"t":"y","r":{}} // "s" pour "scenier"
    "2":{"t":"s","r":{}}
    "3":{"t":"s","r":{}}
  }
}

```

Ensuite, on associe les parags #1 et #2. Le programme transforme alors la donnée en :


```js

{
  "relatives":{
    "1":{"t":"y","r":{"s":[2]}} // "s" pour "scenier"
    "2":{"t":"s","r":{"y":[1]}}
    "3":{"t":"s","r":{}}
  }
}

```

### Principe d'unicité du référent {#parag_principe_unicite_referent}

Ce principe veut qu'un groupe de paragraphe donné dans un panprojet possède un et un seul référent. En d'autres termes, deux parags du synopsis ne peuvent avoir ensemble qu'un seul relatif dans le scénier.
