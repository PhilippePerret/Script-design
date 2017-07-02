

* Principe de lecture d'une feuille de test


* On lit tout le fichier, en créant des instances pour chaque `describe`, `context`, `it`, `and`
* On repasse en revue toutes les instances créées (dans chaque classe) et on définit pour les enfants le `owner` et le niveau de tabulation (`tab_level`). Note : il faut vraiment le faire après une première "lecture" du fichier, pour connaitre le tab-level des parents.
* On repasse en revue toutes les instances créées (pour chaque classe) et on joue celles qui n'ont pas de `owner` (donc celles qui sont en racine de fichier). Noter que contrairement à `RSpec` par exemple, ici, on peut avoir un `context` ou un `it` en racine de fichier. Un test peut très bien ne contenir que des it (pourquoi en serait-il autrement) :

```js

  it('le premier case', () => { ... })
  it('le deuxième case', () => { ... })
  it('le troisième case', () => { ... })
  ...

```

## Message de retour {#lemessage_de_resultat}

### Propriétés pouvant être définies {#proprietes_definissable}

* [`verb_comparaison`](##message_verb_comparaison),
* [`actualType`, `expectType`](#type_de_element_in_message),
* [`noType`](#message_no_type),
* [`add_on_failure`](#message_add_on_failure),
* [`noEstMessage`](#message_no_est_message),
* [`alt_strict`](#message_alt_strict)

#### Verbe de comparaison `verb_comparaison` {##message_verb_comparaison}

Par défaut, le verbe de comparaison est `égal`. Il peut être remplacé par n'importe quoi à l'aide de `verb_comparaison`.

#### Définition de la préposition `preposition_expect` {#message_preposition_expect}

par défaut, la préposition utilisée est `à` dans le message `… est égal à…`. On peut remplacer cette préposition — ou la supprimer — à l'aide de `preposition_expect`.

#### Suppression du « est » avec `noEstMessage` {#message_no_est_message}

À l'origine, le message est `est égal à` ou `n'est pas égal à`. Le `est` sera supprimé avec la propriété `noEstMessage`. Mais elle sera remplacée par `ne… pas` en cas d'échec, placés autour du [verbe de comparaison](#message_verb_comparaison).

#### Ajout au message avec `add_on_failure` {#message_add_on_failure}

Un texte peut être ajouté au bout du message en cas d'échec. C'est typiquement le cas, par exemple, lorsque le type du `actual` ne correspond pas à ce qu'on cherche. Le message d'erreur retournera :

```

Erreur line 21, [Object HTMLDivElement] n'est pas de classe « HTMLDivElement » ([Object HTMLDivElement] est de class « htmldivelement »)

```

Le « ([Object HTMLDivElement] est de class « htmldivelement ») » a été ajouté par `add_on_failure`.

Noter qu'il faut utiliser `__ACTUAL__` et `__EXPECT__` dans le message, car `expect_str` et `actual_str` ne sont pas encore calculés au moment de la définition du message.

Noter également qu'une espace est automatiquement ajoutée entre le message et l'ajout.


#### Type de l'élément (`this.actualType`, `this.expectType`) {#type_de_element_in_message}

Par défaut, quand le type de l'élément est indiqué (lors des comparaisons strictes par exemple), on indique le type de l'élément. Par défaut, ce type est pris avec `typeof`, mais il peut être spécifié dans une méthode à l'aide de `actualType` et/ou `expectType`.

#### Ne pas afficher le type avec `noType` {#message_no_type}

Par défaut, le message de retour, positif ou négatif, affiche le type des éléments comparés. On peut empêcher cet affichage en indiquant `this.noType = true` dans la définition du message.

#### Changer le « strictement » avec `alt_strict` {#message_alt_strict}

Par défaut, c'est le terme `strictement` qui est ajouté lorsque l'on fait une vérification strict. Ce mot peut être remplacé dans la définition du message par `alt_strict`. Par exemple = `this.alt_strict = "exactement"`.


---------------------------------------------------------------------

## Produire une erreur avec `throwError` {#product_erreur_throwError}

Les erreurs dont il est question ici sont les erreurs qu'on peut faire lorsque l'on programme les tests pour l'application. Par exemple, en 2017, on ne peut pas tester l'appartenance d'un objet dans une liste. Lorsque l'user-programmeur de l'application tente de réaliser ce test :

```js

  expect([1,2,3]).contains({un:"une"})

```

… une erreur est produite, inscrite dans le rapport.

Cette erreur s'implémente avec la méthode `throwError` :

```js

    return throwError('On ne peut pas encore tester l’existence d’un tableau dans une liste.')
    // Le 'return' retourne undefined, sert simplement à interrompre le cours
    // du programme.
```
