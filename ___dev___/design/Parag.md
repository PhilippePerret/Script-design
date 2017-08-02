# Parag {#les_parags}

Les `Parag`(s) (pour « Paragraphes ») sont les entités de base de l'application `Script design`. Ils pourraient s'appeler `Paragraph` s'ils étaient des paragraphes, mais ils sont plus que ça, et peuvent contenir plusieurs paragraphes réels.

## Propriétés des `parags` {#parag_properties}

* [`id`](#parag_property_id),
* [`ucontents`](#parag_property_ucontents),
* [`duration`](#parag_property_duration),
* [`position`](#parag_property_position),
* [`type`](#parag_property_type),
* [`brins_ids`](#parag_property_brins_ids),


### {Number} `id` {#parag_property_id}

Identifiant unique du paragraphe. Il est unique mais pas universel dans le sens où un identifiant dans le scénier, par exemple, a la même valeur que le même parag dans le synopsis ou le manuscrit.

Mais est-ce vraiment une bonne chose, dans le sens où un unique Parag peut donner lieux à plusieurs parags dans un autre document : un parag du synopsis va donner lieu à 5 parags du scénier et 20 parags dans le manuscrit. Pourtant, ils doivent être associés.

### {String} `ucontents` {#parag_property_ucontents}

Contenu textuel du parag. Il est en Unicode dans le fichier pour pouvoir être entièrement en ASCII. Il est décodé à la volée pour définir la propriété [`contents`](#parag_property_contents).


### {Number} `duration` {#parag_property_duration}

Durée en secondes du parag.

### {Number} `position` {#parag_property_position}

Position temporelle, en seconde, du parag. Soit elle est fournie explicitement, soit elle est calculée en fonction des durées des parags qui le précèdent.


### {String} `type` {#parag_property_type}

Type(s) du Parag. C'est un string sur 4 lettres-chiffres qui définissent le type précis du parag. Pour le moment (1 08 2017), ces types ne sont pas définis, sauf pour la valeur par défaut `0000` qui indique qu'aucun type n'est attribué au parag.

Noter que ces types ont une implication sur l'aspect de l'affichage du parag, sauf contre-indication.

### {String} `brins_ids` {#parag_property_brins_ids}

String de 16 caractères pour mémoriser les brins du parag. Chaque double caractère représente une valeur en base 32.

Utiliser les méthodes `Number#toBase32` et `String#fromBase32` pour encoder et décoder les nombres.

Note : cela permet de créer les brins 0 à 1023.

On peut récupérer un brin par :

```js

let instance_brin = Brins.getWithId32( ID32_sur_2_lettres )

```

Pour le moment, un parag ne peut appartenir qu'à 8 brins.


### {String} `contents` {#parag_property_contents}

Propriété la plus importante du parag, c'est le texte qui est affiché (mais pas le texte enregistré — cf. [`ucontents`](#parag_property_ucontents) pour ça).

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
