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

    /**
    *
    *   Méthode appelée quand on clique sur le bouton "Manuel" dans la fenêtre
    *   de l'aide, qui permet de rejoindre le manuel général.
    *
    *   Cette méthode affiche le manuel complet dans la fenêtre en l'actualisant
    *   avant si nécessaire.
    *
    **/
    static manuel ()
    {
      alert("Le manuel n'est pas encore implémenté. Pour le moment, je n'affiche que les fichiers de aide/manuel dans l'ordre alphabétique.")
      let
          MANUEL_FOLDER = path.join(C.VIEWS_FOLDER,'aide','manuel')
        , file_list     = fs.readdirSync(MANUEL_FOLDER, {encoding:'utf8'})
        , section
        , tdms          = []

      // TODO Ici, il faut plutôt constituer un fichier global et simplement vérifier s'il est
      //      à jour et doit être actualisé.
      DOM.inner('aide-content','') // on vide tout en posant la table des matières
      file_list.map( (fname) => {
        let [ code, innerTdm ] = Kramdown.file(path.join(MANUEL_FOLDER,fname), {returnInnerTOC: true})
        tdms.push(innerTdm)
        section = DOM.create('section', {id: `file-${fname}`, inner: code })
        DOM.add('aide-content',  section )
      })
      let ultoc = DOM.create('ul', {id:'manuel-toc', class:'kramed-toc', inner: tdms.join('') })
      DOM.insertTop('aide-content', ultoc)

    }

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
