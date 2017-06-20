

Dans le fichier de vue `.ejs` :

```
  <%- menu_animaux %>

```

Dans un fichier `js` de la fenêtre :

```

let Select = require('phil-select-menu') // ou utilise requirejs

function monMenuAnimaux () {
  let data_menu = {
    id:     'animaux',
    container: <DOMElement du container> ou <id>
                // si spécifié, le menu est placé dedant
    in: <identique à container>
    name:   'animaux-name',
    class:  'class-big-menu',
    width:  <taille du menu>, // en pixels (null par défaut)
    onchange: [Objet, '<method>'],  // reçoit (DOMElement du menu, new value)
                                    //
    maxHeight: <hauteur maximale en pixel>, // 300 par défaut
    opened:     Mettre à true pour que le menu apparaisse ouvert, comme une
                liste.
    options: [
      {inner: 'Mammifères', class: 'title'}, // UN TITRE
      {inner: 'Lion', value: 'lion', selected: true, class: 'i'}, // UN ITEM
      {inner: 'Vache', value: 'vache'},
      {inner: null, class: 'separator'} // UN SÉPARATEUR
    ],
    select:   <value du selected>,
    multiple:   Si true, sélection multiple autorisée
  }
  let m = new Select(data_menu)
  return m.select
}

let menu_animaux = monMenuAnimaux()

```

## Définir un titre

Il y a deux moyens de définir un titre dans le menu :

        {title: 'le titre à écrire'}
        {title: 'Titre à deux classes', class: 'autreclasse'}

Ou :

        {inner: 'le titre à écrire', class: 'title'}

        {inner: 'titre avec deux classes', class: 'title autreclasse'}

## Définir l'élément sélectionné

On peut le définir dans le `Hash` du menu :

        {value: 'valeur', inner: "Ma valeur", selected: true}

On peut le définir dans les données générales :

        {
          id: ...
          ...
          selected: 'valeur'
        }

Sinon, c'est toujours le premier menu qui est sélectionné.

Si `multiple` est à `true` dans les données générales, plusieurs items peuvent être choisis.

## Construction du menu en deux temps

On peut construire le menu en deux temps, c'est-à-dire d'abord placer le container du menu puis ensuite le peupler.

Dans ce cas, on utilise dans le premier temps la procédure normale, puis ensuite :

* `<instance Select>#options = [...]` pour définir les items,
* `<instance Select>#populate()` pour peupler le menu

> Noter que pour cette fonctionnalité, il faut impérativement que le menu possède un identifiant.

Exemple complet :

```

let Select = require('select-menu')
let menu_animaux = new Select({id:'animaux'})


```

Dans le partiel :

```
  <%- menu_animaux.select %>

```

Puis plus tard :

```
menu_animaux.options = [{inner:"Premier", value:"1"}, {inner:"Deuxième", value: 2}]
menu_animaux.populate

```
ou en une ligne :

```
menu_animaux
  .set_options([{inner:"Premier", value:"1"}, {inner:"Deuxième", value: 2}])
```


```

Styles utilisables
* ------------------
*     div.select    Le menu général.
*     div.option    Un item du menu
*
*     Classes prédéfinie qu'on peut ajouter aux options :
*       'title'       Pour que l'option soit un titre
*                     Re-styliser avec div.option.title
*       'separator'   Pour que l'option soit un séparateur
*                     Re-styliser avec div.option.separator
*       'unabled'     Pour que l'option soit inutilisable
*                     Re-styliser avec div.option.unabled

```

## Méthode appelée en cas de changement {#onchange_value}

Cette méthode se définit avec la propriété `onchange` dans les données du menu.

```
  let monMenu = new Select({
    ...
    onchange: maFonctionOnChange,
    ...
    options: [...]
    })
```

Cette méthode reçoit deux arguments :

        <fonction>( <DOMElement select>, <valeur choisie> )

Le premier est l'objet DOM du select qui a changé de valeur.
