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

      /*
        Méthode générale recevant tous les évènements "touche relevée",
        qu'on soit dans un champ de texte ou non.
        C'est suivant la valeur de _current_text_field qu'on oriente vers
        un traitement ou un autre
       */
      static onKeyUp (evt)
      {
        if ( this._current_text_field )
        {
          this.traiteKeyUpOnTextField(evt)
        }
        else
        {

        }
      }

      /**
      * La méthode de traitement des key-up quand on se trouve dans un
      * champ de texte
      **/
      static traiteKeyUpOnTextField (tf, evt)
      {
        Rq.log(`Touche '${evt.key}' pressée dans champ de texte ${tf.id} `)
        switch (evt.key)
        {
          // Touches généralistes
          case 'Escape':  // => Blurer du champ courant
            tf.blur()
            break
          case 'Enter':
            /*
              Deux cas peuvent se produire lorsque l'on est sur un champ
              de texte et qu'on tape la touche Entrée. Si c'est un textarea,
              on renvoie simplement true, si c'est un input-text, on active
              le bouton par défaut
             */
             if ( 'TEXTAREA' === tf.tagName ) { return true }
             else
             {
               Rq.log("C'est un input-text, je joue l'action par défaut.")
               this.options.api[this.options.defaultEntreeMethod].bind(this.options.api).call()
             }
            break
          case '@':       // => Aide demandée
            break
          default:
            // Touches propres à la fenêtre courantes
            this.KeyboardObject.onkeyup(evt)
        }
        return true
      }

      static onFocusTextField (tf, evt)
      {
        Rq.log(`Focus dans champ de texte #${tf.id}`)
      }
      static onBlurTextField (tf, evt)
      {
        Rq.log(`Blur de champ de texte #${tf.id}`)
      }

      static setup ( options )
      {
        Rq.log("* Préparation de l'interface… ")
        this.KeyboardObject = options.KeyboardObject
        this.options        = options

        // On prépare tous les champs qui peuvent recevoir du texte pour que
        // lorsqu'on les focusse, les raccourcis clavier changent, les snippets
        // se mettent en route
        DOM.textFields.map( (tf) => {
          DOM.listen(tf,'keyup', UI.traiteKeyUpOnTextField.bind(UI, tf))
          DOM.listen(tf,'focus', UI.onFocusTextField.bind(UI, tf))
          DOM.listen(tf,'blur',  UI.onBlurTextField.bind(UI, tf))
        })

        // Il faut activer le onkeyup
        window.onkeyup = this.onKeyUp //options.KeyboardObject.onkeyup

        // Si un champ par défaut est défini, on focus devant
        if ( options.default_field ) { DOM.focus(options.default_field)}
        Rq.log("  = Interface préparé.")
      }// /setup
    }
    return UI
  }
)
