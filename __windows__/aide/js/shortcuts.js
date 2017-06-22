define(
  [],
  function(){

    class AideShortcuts
    {

      /**
      *   Méthode appelée quand on clique une touche dans l'aide.
      *
      *   @evt          L'évènement KeyUp
      *   @modeTexte    True si on se trouve dans un champ de texte
      *
      **/
      static onkeyup (evt, modeTexte)
      {
        switch(evt.key)
        {
          case '@':
            return AideAPI.toggle()
          // case 'm':
          //   return AideAPI.manuel()
          // case 'f':
          //   return AideAPI.aideFenetreCourante()
        }

        return 'poursuivre' // pour dire de poursuivre le test keyUp
      } // fin de onkeyup

      static onEntree ()
      {
        AideAPI.scroll()
      }
    } // /fin de AideShortcuts
    return AideShortcuts
  }
)
