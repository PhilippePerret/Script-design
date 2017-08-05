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
    * Alterne entre le manuel et l'aide de la fenêtre courante
    *
    **/
    static toggle ( )
    {
      if ( this._isManuel ) { this.aideFenetreCourante() }
      else { this.manuel() }
    }
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
      let
          MANUEL_FOLDER = path.join(C.VIEWS_FOLDER,'aide','manuel')
        , file_list     = fs.readdirSync(MANUEL_FOLDER, {encoding:'utf8'})
        , section
        , tdms          = []

      // TODO Ici, il faut plutôt constituer un fichier global et simplement vérifier s'il est
      //      à jour et doit être actualisé.
      DOM.inner('aide-content','') // on vide tout en posant la table des matières

      DOM.inner('aide-content', '<div class="warning clear">Pour le moment, l’aide compile simplement les fichiers se trouvant dans le dossier `./__windows__/aide/manuel/` dans l’ordre alphabétique.</div>')

      file_list.map( (fname) => {
        let [ code, innerTdm ] = Kramdown.file(path.join(MANUEL_FOLDER,fname), {returnInnerTOC: true})
        tdms.push(innerTdm)
        section = DOM.create('section', {id: `file-${fname}`, inner: code })
        DOM.add('aide-content',  section )
      })
      let ultoc = DOM.create('ul', {id:'manuel-toc', class:'kramed-toc', inner: tdms.join('') })
      DOM.insertTop('aide-content', ultoc)

      // On affiche le bouton pour revenir à l'aide de la fenêtre courante
      // si elle est définie
      if ( this._current_window )
      {
        DOM.display('btn-aide-fenetre')
      }
      // Dans tous les cas ou masque le bouton du manuel
      DOM.undisplay('btn-aide-manuel')
      this._isManuel = true
    }

    // Appelée par le bouton pour revenir à l'aide de la fenêtre courante si
    // elle existe.
    static aideFenetreCourante ()
    { this.afficheAideFor(this._current_window) }

    static afficheAideFor( wind, options )
    {
      console.log("wind:%s, options:", wind, options)
      if ( wind )
      {
        // Une fenêtre est définie, il faut afficher son aide si elle
        // existe
        // DOM.inner('helped-page', wind)
        // Chemin vers l'aide
        this._current_window = wind
        let aide_path = path.join(C.VIEWS_FOLDER,wind,'aide.md')
        if ( fs.existsSync(aide_path) )
        {
          DOM.inner( 'aide-content', Kramdown.file(aide_path) )
          if ( options && options.anchor )
          {
            // <= Une ancre est définie
            // => Il faut l'atteindre dans la page
            console.log("Une ancre est demandée : ", options.anchor)
            window.location.href = `#${options.anchor}`
          }
        }
        else
        {
          DOM.inner('aide-content', `Le path de la page d'aide ${aide_path} est introuvable…`)
        }
        DOM.undisplay('btn-aide-fenetre')
        DOM.display('btn-aide-manuel')
        this._isManuel = false
      }
      else
      {
        // Aucune fenêtre n'est définie, on doit afficher l'aide en
        // général
        this.manuel()
      }
    }

    static scroll ()
    {
      console.log('Action par défaut demandée : scroller la fenêtre')
    }
  }// /fin Aide
  return AideAPI
}
)
