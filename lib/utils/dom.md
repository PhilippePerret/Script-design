# dom.js

## Définir le titre (title) de la page

Utiliser la méthode `DOM.setTitle(<titre>)`.


## requirejs

~~~javascript

  requirejs(
    [
      ...
      path.join(UTILS_FOLDER,'dom.js')
      ...
    ],
    function(
      ...
      DOM
      ...
    )
    {
      // ---------------------------------------------------------------------

      /*
        Ensuite, on peut utiliser les méthodes  

          DOM.get(id)
          DOM.value(id) / DOM.value(id, new-value)
          DOM.inner(id) / DOM.inner(id, new-content) <=> innerHTML
          DOM.add(id, child)
          DOM.insertTop(id, child) // Ajoute en haut de +id+
          DOM.focus(id)
          DOM.listen(id,event,callback)
          DOM.addClass(id,class)
          DOM.removeClass(id,class)
          DOM.textFields

          DOM.display(odom)       L'affiche en jouant sur le display
          DOM.show(odom)          L'affiche en jouant sur le visibility
          DOM.mask(odom)          Le masque en jouant sur le display
          alias : DOM.undisplay
          DOM.hide(odom)          Le masque en jouant sur la visibilité

       */
      // ---------------------------------------------------------------------
    }
  )
~~~

## create( type, data )

/** ---------------------------------------------------------------------
  *   Pour créer un élément dans le DOM
  *
  *   @usage
  *       DOM.create('<type>', {...data...})
  *
  *       {...data...} peut contenir :
  *         class       Pour le className. Peut être envoyé sous type de
  *                     liste Array : ['css1', 'css2', etc.]
  *         in          Le container. Si défini, l'élément créé est
  *                     automatiquement placé dedans. Sinon il est renvoyé
  *         style       {... style ...} Un Hash contenant la définition
  *                     de l'attribut style. Par exemple :
  *                     style: { backgroundColor: '#CCC', display: 'none' }
  *         child       Si défini, c'est un élément DOM qui est ajouté
  *                     avec appendChild
  *         inner       Code en dur à mettre dans l'élément, ou titre, si c'est
  *                     un lien par exemple.
  *         Toutes les autres propriétés sont ajoutées en tant qu'attribut
  *         de l'élément.
*** --------------------------------------------------------------------- */


## get (id)

Retourne l'élément du document (DOM) d'identifiant `id`.

## add (parent, child)

Append l'enfant `child` dans l'élément `parent`. `child` et `parent` peuvent être soit des strings soit des éléments DOM (obtenus par exemple par `DOM.get`).
