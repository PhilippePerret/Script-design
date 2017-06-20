/*

  Toutes les fenêtres doivent charger ce module pour les préparer
  et elles doivent appeler la méthode UI.setup() quand elles sont prêtes

*/

define(
  [
      path.join(APP_PATH,'lib','required.js')
    , path.join(APP_PATH,'lib','utils','dom.js'), // => DOM
  ],
  function(
      Rq
    , DOM
  )
  {
    class UI
    {
      /**
      * La méthode de traitement des key-up quand on se trouve dans un
      * champ de texte
      **/
      static keyupOnFieldText (evt)
      {
        Rq.log(`Touche pressée dans champ de texte : '${evt.key}'`)
        return true
      }
      static setup ( options )
      {
        Rq.log("* Préparation de l'interface… ")
        // On prépare tous les champs qui peuvent recevoir du texte pour que
        // lorsqu'on les focusse, les raccourcis clavier changent, les snippets
        // se mettent en route
        DOM.textFields.map( (tf) => {
          tf.onfocus = function(evt)
          {
            console.log(`Je focus dans le champ #${tf.id}`)
            this.old_window_onkeyup = window.onkeyup
            window.onkeyup = this.keyupOnFieldText
            this._current_field = tf
          }
          tf.onblur = function(evt)
          {
            console.log(`Je blure du champ #${tf.id}`)
            // On remet les anciens raccourcis
            window.onkeyup = this.old_window_onkeyup
            this._current_field = null
          }
        })

        // Si un champ par défaut est défini, on focus devant
        if ( options.default_field ) { DOM.focus(options.default_field)}
        Rq.log("  = Interface préparé.")
      }// /setup
    }
    return UI
  }
)
