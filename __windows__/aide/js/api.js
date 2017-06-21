const
      fs      = require('fs')

define([
    C.DOM_MODULE_PATH // => DOM
  , path.join(C.LIB_UTILS_FOLDER,'kramdown.js')  // => Kramdown
],function(
    DOM
  , Kramdown
){

  class AideAPI {

    static afficheAideFor( wind )
    {
      if ( wind )
      {
        // Une fenêtre est définie, il faut afficher son aide si elle
        // existe
        // DOM.inner('helped-page', wind)
        // Chemin vers l'aide
        let aide_path = path.join(C.VIEWS_FOLDER,wind,'aide.md')
        if ( fs.existsSync(aide_path) )
        {
          DOM.inner( 'aide-content', Kramdown.file(aide_path) )
        }
        else
        {
          DOM.inner('aide-content', `Le path de la page d'aide ${aide_path} est introuvable…`)
        }
      }
      else
      {
        // Aucune fenêtre n'est définie, on doit afficher l'aide en
        // général
      }
    }
  }// /fin Aide
  return AideAPI
}
)
