/*

  Toutes les fenêtres doivent charger ce module pour les préparer
  et elles doivent appeler la méthode UI.setup() quand elles sont prêtes

*/
let ipc = require('electron').ipcRenderer

define(
  [
      C.LOG_MODULE_PATH
    , C.DOM_MODULE_PATH
    , C.EVENTS_MODULE_PATH
  ],
  function(
      log
    , DOM
    , Events
  )
  {
    class UI
    {

      /**
      *   Méthode principale qui définit l'interface et notamment le
      *   système de raccourcis clavier
      **/
      static setup ( options )
      {
        log("* Préparation de l'interface… ")
        this.KeyboardObject = options.KeyboardObject
        this.options        = options

        // On prépare tous les champs qui peuvent recevoir du texte pour que
        // lorsqu'on les focusse, les raccourcis clavier changent, les snippets
        // se mettent en route
        DOM.textFields.map( (tf) => {
          // DOM.listen(tf,'keyup', UI.traiteKeyUp_Inside_TextField.bind(UI, tf))
          DOM.listen(tf,'focus', UI.onFocusTextField.bind(UI, tf))
          DOM.listen(tf,'blur',  UI.onBlurTextField.bind(UI, tf))
        })


        // Il faut activer le onkeyup
        window.onkeyup = UI.onKeyUp.bind(UI) //options.KeyboardObject.onkeyup

        // Si un capteur d'évènement touche pressée existe, il faut le connecter
        if ( 'function' === typeof this.KeyboardObject.onkeydown )
        {
          window.onkeydown = this.KeyboardObject.onkeydown
        }

        // Si un champ par défaut est défini, on focus devant
        if ( options.default_field )
        {
          DOM.focus(options.default_field)
        }


        log("  = Interface préparé.")

      }// /setup

      // Raccourci pour obtenir l'API courante (par exemple Projet si c'est
      // la fenêtre des projets qui est la fenêtre courante)
      static get api () { return this.options.api }

      /**
      *   @return true quand on se trouve dans un champ de text,
      *   soit input-text soit textarea
      **/
      static get isEdition () { return !!this._current_text_field }

      /*
        Méthode générale recevant tous les évènements "touche relevée",
        qu'on soit dans un champ de texte ou non.
        C'est suivant la valeur de _current_text_field qu'on oriente vers
        un traitement ou un autre

        Noter que c'est la méthode de gestion du Key-Up appelée avant toutes
        Les autres. On cherche en tout premier lieu à traiter l'évènement par
        la méthode onkeyup propre à chaque API.

       */
      static onKeyUp (evt)
      {

        /**
        *   On invoque la méthode `onkeyup` que doit définir la fenêtre
        *   appelante
        **/
        if ( this.KeyboardObject && 'function' === typeof this.KeyboardObject.onkeyup)
        {
          let res = this.KeyboardObject.onkeyup(evt, this.isEdition)
          if ( res !== 'poursuivre' ) { return res }
        }

        /**
        *   Raccourcis qui ne dépendent pas du fait qu'on se trouve
        *   dans un champ de texte ou non
        **/
        if ( evt.altKey )
        {
          switch (evt.key)
          {
            case 'Tab':
              // ALT + TAB => Passer à la fenêtre suivante
              ipc.send('focus-next-window')
              return Events.stop(evt)
          }
        }
        let method = `traiteKeyUp_${this.isEdition ? 'In' : 'Out'}side_TextField`
        return this[method](evt)
      }

      /**
      *   Gestionnaire de l'évènement KeyUp quand la touche a été
      *   pressée hors d'un champ de texte.
      *
      *   Les raccourcis définis par la fenêtre principale sont toujours
      *   prioritaires sur les raccourcis "normaux"
      **/
      static traiteKeyUp_Outside_TextField (evt)
      {

        // /**
        // *   On invoque la méthode `onkeyup` que doit définir la fenêtre
        // *   appelante
        // **/
        // if ( this.KeyboardObject && 'function' === typeof this.KeyboardObject.onkeyup)
        // {
        //   let res = this.KeyboardObject.onkeyup(evt)
        //   if ( res !== 'poursuivre' ) { return res }
        // }
        //

        if ( evt.altKey )
        {
          switch (evt.key)
          {
            case 'Tab':
            // ALT + Tab permet de passer d'une fenêtre à l'autre
              Window.focusNext()
              return Events.stop(evt)
          }
        }
        else
        {
          switch (evt.key)
          {
            case '@':       // => Aide demandée
              return ipc.send('want-help', { current_window: this.options.window })
            default:
              log(`[UI Général] Touche '${evt.key}' pressée en dehors d'un text fields.`)
          }
        }
      }
      /**
      * La méthode de traitement des key-up quand on se trouve dans un
      * champ de texte
      *
      **/
      static traiteKeyUp_Inside_TextField (evt)
      {
        let tf = this._current_text_field
        log(`Touche '${evt.key}' up in text field ${tf.id} `)
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
               log("C'est un input-text, je joue l'action par défaut.")
               if ( this.KeyboardObject && 'function' == typeof this.KeyboardObject.onEntree )
               {
                 this.KeyboardObject.onEntree.bind(this.KeyboardObject).call()
               }

             }
            break
          default:
            /**
            *   Si aucun raccourci général n'a été trouvé, on invoque
            *   la méthode `onkeyup` que doit définir la fenêtre appelante
            **/
            this.KeyboardObject.onkeyup(evt)
        }
        return true
      }

      static onFocusTextField (tf, evt)
      {
        // Rq.log(`Focus dans champ de texte #${tf.id}`)
        this._current_text_field = tf
      }
      static onBlurTextField (tf, evt)
      {
        // Rq.log(`Blur de champ de texte #${tf.id}`)
        this._current_text_field = null
      }

    }// /fin class UI

    return UI
  }
)
