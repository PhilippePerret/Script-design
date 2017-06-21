# dom.js


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
          DOM.focus(id)
          DOM.listen(id,event,callback)
          DOM.addClass(id,class)
          DOM.removeClass(id,class)
          DOM.textFields

       */
      // ---------------------------------------------------------------------
    }
  )
~~~

## get (id)

Retourne l'élément du document (DOM) d'identifiant `id`.

## add (parent, child)

Append l'enfant `child` dans l'élément `parent`. `child` et `parent` peuvent être soit des strings soit des éléments DOM (obtenus par exemple par `DOM.get`).
