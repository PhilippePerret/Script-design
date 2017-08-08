# Méthodes courantes

Ce fichier tente de répertorier les méthodes les plus courantes pour l'implémentation de Script-design.

* [Méthode de parags](#methodes_parags)


## Méthodes de parags {#methodes_parags}

* [Parags.get()](#parags_get)
* [Parags.coun()](#parags_count)


### `Parags.get(<parag id>)` {#parags_get}

Retourne l'instance `Parag` du parag d'identifiant `<parag id>`.

Noter que la valeur peut ne pas exister si le parag n'a pas encore été chargé. Donc si la méthode `Parags.get` renvoie `undefined`, cela ne signifie pas que le parag n'existe pas.


### `Parags.count` {#parags_count}

Retourne le nombre de parags **actuellement chargés**.

> Pour le moment, il n'existe aucun moyen de compter le nombre réel de parags. Même la taille du fichier des parags ne donnera pas cette indication puisque certains espaces peuvent être vides. La seule manière de connaitre le vrai nombre de parags, c'est de charger les données de tous les panneaux et d'appeler cette méthode.
