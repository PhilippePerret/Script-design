/** ---------------------------------------------------------------------
  *
  *   Class ProjetOptions
  *   -------------------
  *   Pour la gestion des options du projet
  *
  *   instance <projet>#options
  *
*** --------------------------------------------------------------------- */
let fs = require('fs')
let path = require('path')

class ProjetOptions
{
  static get DATA () {
    if ( undefined === this._options_data )
    {
      this._options_data = {
        'autosave':{
            1 : "Sauvegarde automatique"
          , 0 : "Sauvegarde manuelle"
          , 'aide': ''
        }
        , 'autosync':{
            1: 'Synchronisation automatique des paragraphes'
          , 0: 'Synchronisation manuelle des paragraphes'
          , 'aide': ''
        }
        , 'seloneditpar':{
            1: 'À l’édition, sélectionner tout le champ'
          , 0: 'À l’édition, mettre le curseur en fin de champ'
          , 'aide': ''
        }
        , 'dureepage':{
            1: 'Durée en nombre de pages'
          , 0: 'Durée en nombre de secondes'
          , 'aide': ''
        }
      }
    }
    return this._options_data
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor ( projet )
  {
    this.projet = projet
  }


  /* -publique- */

  /**
  * Appelé par les boutons des préférences dans le panneau. Un appel
  * consiste à inverser la valeur de la propriété, qui se trouve dans
  * l'attribut `value`
  **/
  define ( args )
  {
    let my = this
      , rien
      , optionProp
      , spanb
      , bouton
      , curval, newval, statestr
    this._data || load()
    args.forEach( (arg) => {
      [rien, optionProp] = arg.split('-')
      spanb   = this.getSpanButton(arg)
      bouton  = this.getButton(arg)
      if ( bouton )
      {
        curval    = Number(bouton.getAttribute('value'))
        newval    = curval === 0 ? 1 : 0
        statestr  = ProjetOptions.DATA[optionProp][newval]
        spanb.innerHTML = statestr
        bouton.setAttribute('value', String(newval))
        this._data[optionProp] = newval
        UILog(`${statestr} activé(e)`)
        // Les options qui doivent entrainer un changement immédiat
        switch ( optionProp )
        {
          case 'autosave':
            this[newval === 1 ? 'activateAutosave' : 'desactivateAutosave']()
            break
        }
      }
      else
      {
        alert(`Problème avec le bouton option ${optionProp}, il est introuvable.`)
      }
    })
    this.save()
  }


  /**
  * Les deux méthodes qui activent et désactivent la sauvegarde automatique
  * du projet.
  * Note : activeAutosave est appelée soit au chargement du projet si l'option
  * autosave est true, soit au changement d'option.
  **/
  activateAutosave ()
  {
    let my = this
    let autosaveTimer = setInterval(my.projet.doAutosave.bind(my.projet), 15000 /* 15 secondes */)
  }
  desactivateAutosave()
  {
    this.autosaveTimer && ( clearInterval(this.autosaveTimer) )
  }

  /* -private- */

  get data ()
  {
    this._data || this.store.loadSync() // exceptionnellement (tests)
    this._data || ( this._data = {} )
    return this._data
  }
  set data (v) { this._data = v }

  /**
  * Sauvegarde des options du projet
  **/
  save () { this.store.saveSync() }

  /**
  * Chargement des données des options
  *
  * La méthode définit this._data
  *
  * @return {Promise}
  *
  **/
  PRload ()
  {
    const my = this

    my._data = {}
    if ( my.store.exists() ) { return my.store.load() }
    else { return Promise.resolve() }
  }

  /**
  * Définition des options
  *
  * @param  {Object} hd Les données à actualiser
  **/
  set ( hd )
  {
    forEach(hd, (v, p) => { this.data[p] = v})
    this.save()
  }

  get ( prop )
  {
    return this.data[prop] || false
  }


  get store     () {
    this._store || (this._store = new Store(`projets/${this.projet.id}/options`, this) )
    return this._store
  }

  /**
  * @return {HTMLButtonElement} L'élément bouton, dans l'interface, qui permet
  * de régler l'option. Son attribut 'data-tab' contient la valeur de l'option
  *
  * @param {String} argprop Ça ressemble à 'option-<id option>' par exemple
  *                         'option-autosave'
  **/
  getButton (argprop)
  {
    return this.container.querySelector(`button[data-tab="${argprop}"]`)
  }
  /**
  * @return {HTMLSpanElement} Span dans lequel on marque le menu
  **/
  getSpanButton( argprop)
  {
    return this.getButton(argprop).querySelector('span.tab-label')
  }
  get container ()
  {
    this._container || ( this._container = document.getElementById('options-projet') )
    return this._container
  }


  /** ---------------------------------------------------------------------
    *
    *   Méthodes DOM
    *
  *** --------------------------------------------------------------------- */

  /**
  * Fabrique le menu pour choisir les options
  *
  * @return {Promise} (pour chainage seulement)
  **/
  build ()
  {
    let bouton, value, vNumber
    // '<button data-tab="option-autosave" value="0">Sauvegarde manuelle</button>'
    forEach(ProjetOptions.DATA, (dOption, option) => {
      value = this.get(option)
      vNumber = value ? 1 : 0
      bouton  = DOM.create('button', {
          'data-tab': `option-${option}`
        , 'value'   : String(vNumber)
        , inner     : dOption[vNumber]
      })
      this.container.appendChild(bouton)
    })
    return Promise.resolve()
  }
}

module.exports = ProjetOptions
