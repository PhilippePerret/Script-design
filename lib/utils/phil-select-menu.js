/** ---------------------------------------------------------------------
  *   Pour construire et gérer un menu de type select, mais stylisé
  *
  * Cf. le fichier phil-select-menu.md
  *
*** --------------------------------------------------------------------- */
const {app} = require('electron').remote.require('electron')
let path = require('path')

// console.log('app',app)
let dot = app.getAppPath().match(/default_app\.asar/) < 0 ? app.getAppPath() : '.'

define(
  [
      path.join(dot,'lib','utils','dom.js')
  ],
  function(
    DOM
  )
  {

    const PICTO_MENU_SRC = '_common_/img/ui/mac_select_button.png'
    const DOMGet = DOM.get
    const DOMAdd = DOM.add

    class Select {

      static get SELECT_HEIGHT () { return 18 /* pixels */ }

      /**
      * @data_menu = {
      *     options: [{libelle, value[, css, id]}, {option},... {option}],
      *     id: <id du "select">
      *   }
      **/
      constructor (data_menu) {
        this.data = data_menu
        this.prepare_data()
        if ( this.data.container )
        {
          DOM.add(this.data.container, this.select)
        }
      }

      /**
      * Préparation des données
      *
      * Note: les options, elles seront préparées juste avant
      *       de peupler le select, car elles peuvent être définies
      *       plus tard.
      **/
      prepare_data () {
        if ( this.data.width )
        {
          let val = this.data.width
          if ( '%' != `${val}`.substr(-1, 1) ) {
            val = `${val}px`
            this.data.width = val
          }
        }
        if ( undefined === this.data.maxHeight )
        {
          this.data.maxHeight = 300
        }
        if ( this.data.in )
        {
          this.data.container = this.data.in
          this.data.in = undefined
        }
        if ( this.data.container )
        {
          if ( 'string' == typeof(this.data.container) )
          { this.data.container = DOM.get(this.data.container) }
        }
        if ( this.data.opened )
        {
          this.isClosable = false
          this.isOpened   = true
        }
        else
        {
          this.data.opened  = false
          this.isClosable   = true
          this.isOpened     = false
        }
      }
      /**
      * On peut redéfinir les options plus tard avec cette méthode.
      * Ce doit être une liste conforme.
      **/
      set options ( arr_options )
      {
        this.data.options = arr_options
      }
      /**
      * Méthode qui définit l'item sélectionné. Soit il est défini explicitement
      * dans les données, soit il faut mettre le premier menu à sélected.
      * Conclusion :
      *   Soit défini dans this.data.selected
      *   Soit défini dans le hash du menu selected = true
      *   Soit c'est le premier menu
      **/
      define_selected ()
      {
        let sel = this.data.selected
        let len = this.data.options.length
        let selected_defined = false
        // Pour mémoriser l'index du premier menu (qui n'est pas
        // forcément le premier, si c'est un titre par exemple)
        let i_first_real_menu = null
        for ( let i = 0 ; i < len ; ++i )
        {
          let hoption = this.data.options[i]
          if ( !i_first_real_menu && hoption.value ) { i_first_real_menu = i }
          if ( hoption.selected || ( sel && hoption.value == sel ) )
          {
            hoption.selected  = true // si c'est sel
            this.value        = hoption.value
            selected_defined = true
            if ( ! this.isMultiple ) { break }
          }
        }
        // Aucun menu n'a été trouvé, on prend le premier vrai menu
        if ( false === selected_defined && i_first_real_menu)
        {
          this.data.options[i_first_real_menu].selected = true
          this.value = this.data.options[i_first_real_menu].value
        }
      }
      /**
      * Return true si on peut sélectionner plusieurs valeurs
      **/
      get isMultiple  () { return true === this.data.multiple }
      get isOpened    () { return true === this.data.opened   }
      set isOpened    (v){ this.data.opened = v               }

      get DOMSelect   () {
        if ( !this._DOMSelect ) { this._DOMSelect = DOMGet(this.data.id) }
        return this._DOMSelect
      }
      set DOMSelect  (v) { this._DOMSelect = v }
      /**
      * Pour, en même temps, définir les options et peupler le menu
      *
      * @options
      *     populate      Mettre à false pour ne pas peupler tout de suite
      **/
      set_options (arr_options, options )
      {
        if ( !options ) { options = {} }
        if ( undefined === options.populate ) { options.populate = true }
        this.options = arr_options
        if ( options.populate ) { this.populate() }
      }
      /**
      * Méthode principale à appeler sur l'instance pour
      * obtenir le menu (dans son conteneur)
      * C'est la méthode à appeler pour obtenir le menu et le placer
      * dans le document.
      **/
      get select ()
      {
        if (undefined === this._select ) { this.build() }
        return this.select_container
      }

      get select_container ()
      {
        let c = document.createElement('span')
        c.className = 'select_container'
        if ( this.data.width ) { c.style.width = this.data.width }
        DOM.add(c, this._select)
        DOM.add(c, this.hidden_value_field)
        // c.appendChild( this._select )
        // c.appendChild( this.hidden_value_field )
        this.DOMContainer = c
        this.set_observers()
        return this.DOMContainer
      }

      build ()
      {
        // Construction du menu lui-même (SELECT)
        let sel = document.createElement('div')
        let className = ['select']
        if ( this.data.options ) { this.populate( sel ) }
        if ( this.data.class   ) { className.push(this.data.class) }
        sel.className   = className.join(' ')
        this.initialClass = `${sel.className}` // conserver
        sel.className   += this.isOpened ? ' opened' : ' closed'
        sel.name        = this.data.name || this.data.id
        this._dom_id    = `select-${this.data.id || this.data.name}`
        sel.id          = this.dom_id
        if ( this.data.width ) { sel.style.width = this.data.width }
        sel.style.maxHeight = `${this.data.maxHeight}px`
        if ( this.isOpened )
        {
          // Si le menu doit être présenté ouvert
          sel.style.height = `${this.data.maxHeight}px`
        }
        else
        {
          // Si le menu doit être présenté fermé
          // Ajout du picto d'ouverture
          sel.appendChild(this.picto_menu_closed)
        }
        // On généralise la donnée
        this._select = this._DOMSelect = sel
        // Construction du champ hidden qui permettra de récupérer la valeur
        this.build_hidden_value_field()
      }

      // Construit et retourne le code HTML du picto pour ouvrir le
      // menu
      get picto_menu_closed () {
        let picto       = document.createElement('img')
        picto.src       = PICTO_MENU_SRC
        picto.id        = this.picto_open_id
        picto.className = 'picto-select-menu-closed'
        picto.addEventListener( 'click', this.ouvre.bind(this) )
        return picto
      }
      get picto_open_id () {
        if ( undefined === this._picto_open_id ) {
          this._picto_open_id = `${this.dom_id}-picto-open`
        }
        return this._picto_open_id
      }

      build_hidden_value_field () {
        let hid = document.createElement('input')
        hid.type  = 'hidden'
        hid.id    = this.data.id
        // console.log(`Valeur du champ hidden ${this.data.id} mis à ${this.value}`)
        hid.value = this.value
        this.hidden_value_field = hid
      }

      /**
      * @return l'ID du div.select
      **/
      get dom_id () {
        if ( undefined === this._dom_id )
        {
          this._dom_id = `select-${this.data.id || this.data.name}`
        }
        return this._dom_id
      }

      /**
      * Prépare les options, c'est-à-dire, pour le moment, uniformise
      * les données pour avoir toujours :inner, :class.
      * Détermine également si c'est un menu à titre, dans lequel cas
      * la class `with-titles` est ajoutée aux options
      **/
      prepare_options () {
        this.hasTitles = false
        let len = this.data.options.length
        for (var i = 0 ; i < len ; ++i )
        {
          let hoption = this.data.options[i]
          if ( hoption.class == 'titre' || hoption.class == 'title')
          {
            hoption.class   = 'title'
            this.hasTitles  = true
          }
          if ( hoption.title )
          {
            // => Un titre
            hoption.inner = hoption.title
            let ac = hoption.class ? hoption.class.split(' ') : []
            ac.push('title')
            hoption.class = ac.join(' ')
            this.hasTitles = true
          }
          else if ( 'separator' === hoption.class )
          {
            hoption.inner = ''
          }
        }
      }
      populate (select) {
        this.define_selected()
        this.prepare_options()
        if ( undefined == select ) { select = this.DOMSelect }
        let arr_objets_options = []
        let me = this
        this.data.options.map( (hoption) => {
          let option = document.createElement('div')
          let optCss = ['option']
          if ( hoption.selected ) { optCss.push('selected')     }
          if ( hoption.class    ) { optCss.push(hoption.class)  }
          if ( this.hasTitles   ) { optCss.push('with-titles')  }
          option.className = optCss.join(' ')
          if ( hoption.value    )
          {
            option.setAttribute('data-value', hoption.value)
            option.id = `${me.dom_id}-item-${hoption.value}`
          }
          option.innerHTML = hoption.inner
          if ( this.isOpened )
          {
            option.style.display = 'block'
          }

          arr_objets_options.push(option)
          select.appendChild(option)
          if ( hoption.selected ) { me.selected = option }
        })
        this.DOMOptions = arr_objets_options
      }

      /**
      * Placement des observateurs sur le menu pour le gérer
      **/
      set_observers () {
        let me = this
        this.DOMOptions.map( (DOMObj) => {
          DOMObj.addEventListener('click', me.onclick_option.bind(me, DOMObj) )
        })
      }

      showOptions () {
        this.DOMOptions.map( (DOMObjt) => {
          DOMObjt.style.display = 'block'
        })
      }
      hideOptions () {
        this.DOMOptions.map( (DOMObjt) => {
          if ( DOMObjt.className.match(/\bselected\n/) ) { return }
          DOMObjt.style.display = null
        })
      }

      /**
      * L'élément sélectionné. C'est un DOMElement
      **/
      get selected () { return this._selected }
      set selected (v){ this._selected = v}

      /**
      * La valeur actuelle du menu
      **/
      get value () {
        if ( DOMGet(this.data.id) ) {
          return DOMGet(this.data.id).value
        } else { return this._value }
      }
      set value (v){
        this._value = v
        if ( DOMGet(this.data.id) ) {
          DOMGet(this.data.id).value = v
        }
      }

      /** ---------------------------------------------------------------------
        *   Méthodes d'évènements
        *
      *** --------------------------------------------------------------------- */

      ouvre () {
        // this.DOMSelect.style.height = 'auto'
        this.DOMSelect.className = this.initialClass + ' opened'
        this.showOptions()
        this.isOpened = true
      }

      ferme ()
      {
        if ( true === this.isClosable )
        {
          // console.log('-> Select#ferme')
          // this.DOMSelect.style.height = `${Select.SELECT_HEIGHT}px`
          this.DOMSelect.className = this.initialClass + ' closed'
          this.hideOptions()
          this.isOpened = false
        }
      }

      /**
      * Sélectionne un item du menu pour sa valeur (comme le
      * ferait un select normal)
      *
      * WARNING ! Ne pas utiliser `select`, qui retourne le
      * DOMElement du menu
      *
      **/
      choose ( item_value )
      {
        this.deselectionne( this.selected ) // si défini
        this.selectionne(DOMGet(`${this.dom_id}-item-${item_value}`))
      }

      /**
      * Sélectionne l'élément @oDom et le met en this.selected
      **/
      selectionne (oDom) {
        // console.log('-> Select#selectionne')
        if ( !oDom ) { return }
        if ( ! (oDom.className || '').match(/\bselected\b/) ) {
          oDom.className = `${oDom.className} selected`.trim()
        }
        this.selected = oDom
      }
      /**
      * Déselectionne l'élément @oDom
      *
      * La déselection connsiste simplement à retirer la class 'selected'
      * au div.option.
      **/
      deselectionne (oDom)
      {
        if ( ! oDom ) { return }
        oDom.className = oDom.className.replace(/\bselected\b/g,'').trim()
        this.selected = null
      }


      /**
      * Méthode appelée quand un item de menu est cliqué
      *
      * Cela correspond à une sélection
      **/
      onclick_option (oOption, evt)
      {
        // console.log("-> Select#onclick_option")
        if (this.isOpened)
        {
          //
          // Quand le menu est ouvert
          // i.e. l'user a choisi une valeur
          //
          let ca = oOption.className
          if (
            ca.match(/\bunabled\b/) ||
            ca.match(/\btitle\b/)   ||
            ca.match(/\bseparator\b/)
          ) {
            // On ne peut pas prendre ce menu, on ne fait rien
          } else {
            // On peut prendre ce menu
            let value = oOption.getAttribute('data-value')
            // console.log(`Valeur choisie : ${value}`)
            if ( value != this.value )
            {
              this.onchange( value, oOption )
            }
            this.ferme()
          }
        }
        else
        {
          // Quand le menu est fermé
          this.ouvre()
        }
      }

      /**
      * Appelée en cas de changement de valeur
      **/
      onchange (new_value, oOpt) {
        // console.log("-> Select#onchange")
        this.value = new_value
        if ( ! this.isMultiple ) { this.deselectionne( this.selected ) }
        this.selectionne(oOpt)
        if ( this.data.onchange )
        {
          // console.log('--> Appel de la méthode onchange définie pour le menu')
          let [Obj, methode] = this.data.onchange
          Obj[methode].bind(Obj, this.DOMSelect, new_value)()
        }
      }

    }

    return Select
  }
)
