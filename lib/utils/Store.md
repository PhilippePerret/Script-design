# Class `Store`

Permet d'écrire des données JSON dans des fichiers avec des facilités.

Par exemple :

* ajouter une propriété `saving` au possesseur du fichier pour indiquer qu'on sauve,
* actualise automatiquement la propriété `updated_at` dans les données si elle est définie,
* permet une sauvegarde synchrone ou asynchrone des données.

## Méthodes principales

* [Instanciation `constructor`](#method_constructor)
* [méthode `save`](#method_save)
* [méthode `saveSync`](#method_saveSync)
* [méthode `load`](#method_load)
* [méthode `loadSync`](#method_loadSync)

## Pré-requis pour le propriétaire {#ownere_prerequise}

Il doit posséder la propriété `data` qui est un `hash` de données. Cet objet peut ou non définir la propriété `updated_at`, mais s'il la possède, elle sera automatiquement updatée à chaque sauvegarde.

Il doit posséder la propriété `modified` qui peut être une propriété complexe (i.e. définie par un setter).

## Définition des données par défaut {#define_default_data}

On définit les valeurs par défaut après  l'instanciation en renseignant la propriété `defaults` du store :

```js

let store = new Store('mon/path', monOwner)
store.defaults = {...}

```

## Instanciation du store {#method_constructor}

Cette instanciation se fait avec deux arguments, le **path relatif du fichier store** dans le dossier des données de l'utilisateur, et le **propriétaire** du store, qui est souvent une instance.

## Méthode `save` {#method_save}

Enregistre les data du propriétaire de façon asynchrone (ou les data définies pour le store).

La méthode retourne une `Promise` donc elle peut être utilisée de la façon suivante :

```js

  this.store = new Store('mon/path', this)

  this.store.save()
    .then( ... poursuivre ...)
    .then( () => {
      console.log("Tout s'est bien passé.")
    })
    .catch(console.log.bind(console))

```

## Méthode `saveSync` {#method_saveSync}

Sauvegarde les données du store ou du propriétaire de façon synchrone.

## Méthode `load` {#method_load}

Lit les données du fichier de façon asynchrone, en retournant une promise. Donc peut être utilisé de la façon suivante :

```js

  this.store = new Store('mon/path', this)

  this.store.load()
    .then( ... poursuivre ... )
    .then(...)
    .catch(...)

```

Retourne les données déjsonnisés.

## Méthode `loadSync` {#method_loadSync}

Permet de lire les données de façon synchrone.

Retourne les données déjsonnisés.
