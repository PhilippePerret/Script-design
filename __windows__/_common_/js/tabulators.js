/*

  DOM doit être global

  Class Tabulator
  ---------------
  Gestion des sections "tabulaires" dont le fonctionnement est le suivant :
  lorsqu'on focus dessus (à l'aide des touches de préférence), elles s'ouvrent
  en présentant des éléments à choisir (comme des menus) à l'aide des touches
  clavier.

*/
class Tabulator
{

  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
  * Place des listener sur tous les boutons en fonction de leur ordre
  **/
  static get LETTERS () {
    return ['q','s','d','f','g','h','j','k','l','m',
            'a','z','e','r','t','y','u','i','o','p']
  }


  /**
  * Méthode appelée à l'ouverture du pan pour le préparer (quand la page
  * est prête, pas avant)
  **/
  static setup ()
  {
    // console.log('-> Tabulator::setup')
    this.ready  = false // pour les tests
    this._items = {} // les tabulateurs
    this._list  = [] // Idem mais en array
    this.observe()
    this.ready  = true
    // console.log('<- Tabulator::setup')
  }

  /**
  * Méthode appelée pour gérer l'objet DOM quelconque +DOMObj+ comme un
  * tabulateur normal avec les données +data+.
  *
  * Cf. "Élément se comportant comme un tabulator" dans le manuel
  *
  * @param {HTMLElement|String} DOMObj Soit l'élément HTML soit son ID
  * @param {Object} params  Les paramètres caractérisant le comportement des
  *                         éléments.
  *                         Définit :
  *                           Map         [Obligatoire]
  *                           mapLetters  [Optionnel, pour définir d'autres
  *                                       lettres]
  *
  * TODO Plus tard, il faudrait que Tabulator puisse prendre en compte les
  * champs possédant la classe "editable" pour les gérer automatiquement, sans
  * avoir à définir de méthode dans params.Map. Parce qu'en l'occurrence, les champs
  * span/div doit être activés par la méthode d'UI normal, et les autres champs
  * doivent être focussés (les select et checkbox)
  **/
  static setupAsTabulator ( DOMObj, params )
  {
    const my  = this
    const obj = DOM.get(DOMObj)

    // N0003
    // https://github.com/PhilippePerret/Script-design/wiki/NoI#n0003
    Tabulator.SectionMaps || ( Tabulator.SectionMaps = new Map() )

    if ( my.isNotTabulatorized(obj) )
    {
      // <= L'élément n'est pas encore préparé pour Tabulator
      // => Il faut observer tous ses champs portant une data-tab
      my.tabulatorizeObjet(obj, params)
    }

    /*- On prend la sectionMap demandée -*/
    let sectionMap  = Tabulator.SectionMaps.get(obj.id)

    if ( my.curSectionMap ) {
      console.log("[Tabulator] Une section map courante est définie quand on tabulatorise '%s' : '%s'", obj.id, my.curSectionMap.get('objet_id'))
      sectionMap.set('previous_objet_id', my.curSectionMap.get('objet_id'))
    }

    my.curSectionMap = sectionMap
    my.iMaxLetter    = sectionMap.get('iMaxLetter')

    /*- Activer cette section en déasactivant le comportement courant -*/

    sectionMap.set('previousWindowOnKeyUp',   window.onkeyup)
    sectionMap.set('previousWindowOnKeyDown', window.onkeydown)

    window.onkeyup    = undefined
    window.onkeydown  = undefined

    window.onkeyup    = my.onKeyUp_TabulatorLike  .bind(my, sectionMap)
    window.onkeydown  = my.onKeyDown_TabulatorLike.bind(my, sectionMap)

    /*- Message de confirmation à l'utilisateur -*/

    UILog(`#${obj.id} est géré par ©Tabulator`)
  }

  /**
  * Retourne true si l'objet DOM désigné par +obj+ est tabulatorized
  *
  **/
  static isTabulatorized    (obj) { return DOM.hasClass(obj, 'tabulatorized') }
  static isNotTabulatorized (obj) { return !this.isTabulatorized(obj) }
  /**
  * Méthode utilisée par `setupAsTabulator` pour préparer l'élément
  * et composer sa Map d'éléments éditables.
  *
  * @param {HTMLElement}  obj Objet DOM à tabulatoriser
  * @param {Object}       params  Paramètres optionnels
  **/
  static tabulatorizeObjet (obj, params)
  {
    const my  = this
    params || ( params = {} )
    let iletter = -1
      , letter = null
      , tagname
      , data_tab
      , title
      , sectionMap = params.MapLetters || ( new Map() )

    obj.querySelectorAll('*[data-tab]').forEach( (o) => {

      data_tab = o.getAttribute('data-tab')

      while(!letter || sectionMap.get(letter)){letter = Tabulator.LETTERS[++iletter]}
      // N0001
      // https://github.com/PhilippePerret/Script-design/wiki/NoI#n0001


      /*- Ajout dans la map de la section -*/

      sectionMap.set( letter, params.Map[data_tab] )

      /*- Title pour aide -*/

      title = o.getAttribute('title') || ''
      title += ` Taper ${letter}/${letter.toUpperCase()} pour activer`
      o.setAttribute('title', title.trim())

    })

    sectionMap.set( 'iMaxLetter', iletter )
    sectionMap.set('objet_id',    obj.id)


    /*  On met la map dans Tabulator.SectionMaps pour pouvoir l'utiliser
        ici, maintenant et plus tard
    */
    Tabulator.SectionMaps.set( obj.id, sectionMap )

    DOM.addClass(obj, 'tabulatorized') // Marquer que l'élément est préparé

  }

  static onKeyDown_TabulatorLike ( sectionMap, evt )
  {
    return true
  }

  /**
  * Gestionnaire de l'évènement keyUp pour l'élément se comportant comme
  * un Tabulator.
  **/
  static onKeyUp_TabulatorLike ( sectionMap, evt )
  {
    const my = this

    let fonction = sectionMap.get(evt.key) || sectionMap.get(evt.key.toLowerCase())

    /*- Si la fonction est définie, il faut voir si elle existe
        et l'appeler le cas échéant -*/

    if ( fonction )
    {
      my.realLetter     = `${evt.key}`
      my.currentLetter  = evt.key.toLowerCase()

      // N0002
      // https://github.com/PhilippePerret/Script-design/wiki/NoI#n0002
      let modifiers = {altKey:null, metaKey:null, ctrlKey:null, shiftKey:null}
      for(let modifier in modifiers) { modifiers[modifier] = evt[modifier] }
      if ( my.realLetter >= 'A' && my.realLetter <= 'Z' ){
        modifiers.shiftKey = true
      }

      if ( 'function' === typeof(fonction)) { fonction.call(null, modifiers) }
      else {
        alert(`La méthode ${fonction} n'est pas définie…`)
      }
    }
    else
    {
      // Ce n'est pas une fonction définie. Est-ce que ça peut
      // être une autre touche.
      // Noter qu'on ne gère pas ici les Tab, Escape et Enter quand on
      // se trouve dans les champs d'édition puisque c'est une fonction
      // du gestionnaire d'évènement keyup lorsque l'on passe en édition.
      const target = evt.target
      const tagname = target.tagName.toLowerCase()
      switch(evt.key.toLowerCase())
      {
        case 'j':
          my.selectPreviousEditable()
          return DOM.stopEvent(evt)
        case 'l':
          // Même si c'est tentant, ne pas utiliser les flèches, les
          // réserver pour entrer et sortir du champ.
          my.selectNextEditable()
          return DOM.stopEvent(evt)
        case 'k': // simuler la flèche haut
          if ( tagname == 'select' ) // Flèche haut sur un menu sélectionné
          {
            my.selectNextOptionOf(target)
          }
          else
          {
            Keyboard.press('ArrowDown', {target: evt.target})
          }
          break
        case 'i': // simuler la flèche bas
          if ( tagname == 'select' ) // Flèche haut sur un menu sélectionné
          {
            my.selectPreviousOptionOf(target)
          }
          else
          {
            Keyboard.press('ArrowUp', {target: evt.target})
          }
          break
        default:
          // console.log("keyUp in onKeyUp_TabulatorLike : %s", evt.key)
      }
    }
  }

  static selectPreviousOptionOf ( select )
  {
    let i   = select.selectedIndex - 1
      , nb  = select.childNodes.length
    if ( i < 0 ) { i = nb - 1 }
    select.childNodes[i].selected = true
  }
  static selectNextOptionOf ( select )
  {
    let i   = select.selectedIndex + 1
      , nb  = select.childNodes.length
    if ( i >= nb ) { i = 0 }
    select.childNodes[i].selected = true
  }
  /**
  * Méthode fonctionnant avec la précédente pour sortir l'élément
  * de la gestion par Tabulator.
  * Elle consiste principalement à remettre le gestionnaire de keyUp
  * précédent.
  **/
  static unsetAsTabulator( DOMObj )
  {
    const my          = this
        , obj         = DOM.get(DOMObj)
        , sectionMap  = Tabulator.SectionMaps.get(obj.id)

    let old_objet_id  = sectionMap.get( 'previous_objet_id' )

    if ( old_objet_id )
    {
      // <= Un DOMElement était tabulatorisé avant celui-ci
      // => On doit le remettre comme section courant activée
      //    (cf. plus bas)
    }
    else
    {
      // <= Il n'y avait pas de DOMElement tabulatorisé avant celui-ci
      // => On remet les gestionnaires d'évènement enregistrés.

      window.onkeyup    = sectionMap.get('previousWindowOnKeyUp')
      window.onkeydown  = sectionMap.get('previousWindowOnKeyDown')

    }

    // Dans tous les cas, on remet à rien les gestionnaires d'évènements
    // keyUp/keyDown mémorisés (il y en aura d'autre quand on activera
    // le DOM Element à nouveau, si c'est le cas)
    sectionMap.delete('previousWindowOnKeyUp'   )
    sectionMap.delete('previousWindowOnKeyDown' )

    my.curSectionMap = old_objet_id ? my.activatePreviousSection(old_objet_id) : undefined


    UILog(`#${obj.id} n'est plus géré par ©Tabulator`)
  }

  /**
  * Quand on active un DOMElement avec setupAsTabulator, il mémorise l'objet
  * qui peut être activé. Lorsque que ce DOMElement est désactivé (fermé),
  * on doit réactiver l'objet activé précédemment. C'est cet objet +objet_id+
  * dont cette méthode s'occupe.
  **/
  static activatePreviousSection (objet_id)
  {
    const my = this
    let sectionMap = my.Sections.get(objet_id)
    window.onkeyup    = my.onKeyUp_TabulatorLike.bind(my, sectionMap)
    window.onkeydown  = my.onKeyDown_TabulatorLike.bind(my, sectionMap)

    return sectionMap // Pour la définition
  }

    /**
    * Sélectionne l'élément éditable précédent (avec la flèche gauche)
    **/
    static selectPreviousEditable ()
    {
      const my = this
      let prevOffset = my.LETTERS.indexOf(my.currentLetter) - 1
      if ( prevOffset < 0 ) return // rien à faire
      my.selectOtherEditable(my.LETTERS[prevOffset])
    }
    /**
    * Sélectionne l'élément éditable suivant (avec la flèche droite)
    **/
    static selectNextEditable ()
    {
      const my = this
      let nextOffset = my.LETTERS.indexOf(my.currentLetter) + 1
      if ( nextOffset > my.iMaxLetter ) return // on est au bout
      my.selectOtherEditable(my.LETTERS[nextOffset])
    }

    static selectOtherEditable ( letter )
    {
      const my = this
      my.currentLetter = letter
      my.curSectionMap.get(letter).call()
    }

  /**
  * @return {Tabulator} l'instance du tabulateur d'identifiant +tabulator_id+
  * @param  {String} tabulator_id Identifiant DOM du tabulateur
  **/
  static get (tabulator_id)
  {
    return this._items[tabulator_id]
  }

  static observe ()
  {
    // console.log('-> Tabulator::observe')
    let tabulators = document.getElementsByTagName('tabulator')
    let nombre_tabulators = tabulators.length
    let itab = 0
    let tabulator, tabulator_id, instTab
    let boutons, nombre_boutons, ibut, letter, bouton, instBouton
    for(; itab < nombre_tabulators; ++itab)
    {
      tabulator = tabulators[itab]
      tabulator_id = tabulator.id

      // On crée une instance pour ce tabulateur
      instTab = new Tabulator(tabulator)
      instTab.ready = false

      // --- Réglage du tabulateur ---
      instTab.observe()

      // --- Réglage des boutons/menus ---
      boutons = tabulator.getElementsByTagName('button')
      nombre_boutons = boutons.length
      // console.log(boutons)
      for(ibut=0; ibut < nombre_boutons; ++ibut)
      {
        letter = this.LETTERS[ibut]
        bouton = boutons[ibut]

        // On crée l'instance du bouton, qui sera ajoutée au
        // tabulateur courant et on le prépare
        instBouton = new TabulatorButton(instTab, bouton, letter)
        instBouton.prepare()

        // Si c'est le premier bouton/menu, on en fait le bouton/menu
        // courant du tabulateur
        if ( ibut == 0 ) { instTab.setCurrentButton(instBouton) }
      }
      instTab.ready = true
    } // fin de boucle sur tous les tabulateurs

    // Une fois qu'on a récupéré les tabulateurs, on peut construire le
    // code qui va gérer les raccourcis-clavier
    let current_window_onkeyup = window.onkeyup
    window.onkeyup = (evt) => {
      if ( ! Projet.current.mode_edition )
      {
        let keyIndex = this.LETTERS.indexOf(evt.key)
        if ( keyIndex > -1 && keyIndex < nombre_tabulators )
        {
          this._list[keyIndex].tabulator.focus()
          return DOM.stopEvent(evt)
        }
      }
      return current_window_onkeyup(evt)
    }
    // console.log('<- Tabulator::observe')
  }

  /**
  * @return {Tabulator} l'instance Tabulator de l'élément DOM domElement
  *
  **/
  static instanceFrom (domElement)
  {
    return this._items[domElement.id]
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
  * Instanciation
  *
  * @param {String} id Identifiant dans le DOM
  * @param {HTMLElement} odom Objet DOM du tabulateur
  **/
  constructor (odom)
  {
    this.id         = odom.id
    this.tabulator  = odom
    // La liste de ses boutons/menus
    this.buttons    = {}
    // La liste des boutons/menus activés (on peut en effet en choisir plusieurs,
    // dans un ordre précis, pour les activer à la suite)
    this.current_buttons = []
    // On l'ajoute à la liste. On pourra utiliser `Tabulator.get(<id>)` pour
    // récupérer l'instance.
    Tabulator._items[this.id] = this
    Tabulator._list.push(this)
    // Pour les tests, pour savoir si le tabulateur est prêt
    this.ready = false
  }

  /**
  * On place les gestionnaires d'évènement sur le tabulateur
  **/
  observe ()
  {
    // console.log(`-> Tabulator#observe (tabulator#${this.id})`)
    let my = this
    this.tabulator.addEventListener('focus',  my.onFocus.bind(my))
    this.tabulator.addEventListener('blur',   my.onBlur .bind(my))
    // console.log(`<- Tabulator#observe (tabulator#${this.id})`)
  }

  /**
  * Quand on focusse dans le tabulateur
  **/
  onFocus (evt)
  {
    // console.log(`-> Tabulator#onFocus (tabulator#${this.id})`)
    Tabulator.current = this
    this.memorizeInitState()
    this.setOnKeys()
    // console.log(`<- Tabulator#onFocus (tabulator#${this.id})`)
  }

  /**
  * Quand on blure du tabulateur
  **/
  onBlur (evt)
  {
    // Si le bouton/menu n'a pas été joué (touche Enter), on revient à
    // l'état initial
    if( ! this.hasBeenRan ) { this.resetInitState() }
    this.unsetOnKeys()
    delete Tabulator.current
  }

  onKeyDown (evt)
  {
    // console.log(`-> Tabulator#onKeyDown (de tabulator#${this.id} - touche '${evt.key}')`)
    let keymin = evt.key.toLowerCase()
    if ( undefined !== this.buttons[keymin] && !this.buttons[keymin].downed )
    {
      // <= Un bouton existe, portant cette lettre
      let bouton = this.buttons[keymin]
      // console.log(`Bouton ${bouton.key} de tabulator#${this.id} pressé`)
      bouton.downed = true
    }
  }

  // La map de ce tabulator définissant les méthodes à utiliser en
  // fonction des keys
  get Map () {
    this._map || ( this._map = Tabulator.Map[this.id] )
    return this._map
  }

  get maxSelected () { return this.Map.maxSelected }

  get hasBeforeEach () {
    if ( undefined === this._hasbeforeeach ) {
      this._hasbeforeeach = ( 'function' === typeof this.Map.beforeEach )
    }
    return this._hasbeforeeach
  }
  get hasAfterEach () {
    if ( undefined === this._hasaftereach ) {
      this._hasaftereach = ( 'function' === typeof this.Map.afterEach )
    }
    return this._hasaftereach
  }
  get hasBeforeAll () {
    if ( undefined === this._hasbeforeall ) {
      this._hasbeforeall = ('function' === typeof this.Map.beforeAll)
    }
    return this._hasbeforeall
  }
  get hasAfterAll () {
    if ( undefined === this._hasaftereall ) {
      this._hasaftereall = ('function' === typeof this.Map.afterAll)
    }
    return this._hasaftereall
  }

  get hasDefaultMethod () {
    if (undefined === this._hasdefmeth){
      this._hasdefmeth = ('function' === typeof this.defaultMethod)
    }
    return this._hasdefmeth
  }
  get defaultMethod () {
    return this.Map.default
  }

  /**
   * Gestion de la touche entrée sur un Tabulator
   * Note : elle a été isolée car elle peut être appelée aussi lorsque l'on
   * clique deux fois sur une touche qui correspond à un menu/commande/action.
   */
  onEnter (evt)
  {
    // console.log(`-> Tabulator#onEnter (${this.id}) `)
    let method
      , my = this

    // S'il y a une méthode de traitement propre, on l'utilise
    // Sinon, on utilise les méthodes définies pour chaque lettre.
    // La méthode de substition peut être utile, par exemple, pour les
    // panneau qui passent en mode double panneau si deux panneaux sont
    // choisis.
    if ( 'function' === typeof my.Map.enter_method ) {

      // console.log('Methode enter_method utilisée')
      my.Map.enter_method.call(Projet, this.current_buttons.map(b =>{return b.data}))

    } else {

      // Si une méthode Before-All est définie
      this.hasBeforeAll && my.Map.beforeAll.call()

      /**
      * On traite ensuite chaque menu/commande/bouton choisi (en général,
      * il y en a un seul, comme un menu)
      **/
      my.current_buttons.forEach( (bouton) => {

        // Si une méthode Before-Each est définie
        my.hasBeforeEach && my.Map.beforeEach.call()

        // === Exécution de la méthode de data ou de lettre ===

        // console.log(`Bouton ${bouton.key} traité`)
        method = my.Map[bouton.data]
        if ( 'function' == typeof method ) { method.call() }
        else if ( my.hasDefaultMethod ) { my.defaultMethod.call(null,bouton.data) }
        else { throw new Error(`Aucune méthode d'action n'est définie pour ${bouton.data} (lettre ${bouton.key})`)}

        // Si une méthode After-Each est définie
        my.hasAfterEach && my.Map.afterEach.call()

      })

      // Si une méthode After-All est définie
      my.hasAfterAll && my.Map.afterAll.call()
    }
    this.hasBeenRan = true
    this.tabulator.blur()
  }

  onKeyUp (evt)
  {
    // console.log(`-> Tabulator#onKeyUp (de tabulator#${this.id} - touche '${evt.key}')`)
    let my = this
    switch ( evt.key )
    {
      case 'ArrowDown':
        // On sélectionner le menu inférieur, s'il existe, sauf si la
        // touche majuscule est pressée
        if ( ! evt.shiftKey ){
          let curBut = this.current_buttons[0]
            , offcur = Tabulator.LETTERS.indexOf(curBut.key)
            , autbut = this.buttons[Tabulator.LETTERS[Number(offcur)+1]]
          if ( autbut )
          {
            this.setCurrentButton(autbut, false)
          }
        }
        break
      case 'ArrowUp':
        // On sélectionne le menu supérieur, s'il existe, sauf si la touche
        // majuscule est pressée
        if ( !evt.shiftKey )
        {
          // let bouton = this.buttons[keymin]
          // this.setCurrentButton(bouton, withCapsLock)
          let curBut = this.current_buttons[0]
            , offcur = Tabulator.LETTERS.indexOf(curBut.key)
          if ( offcur > 0 )
          {
            let autbut = this.buttons[Tabulator.LETTERS[offcur-1]]
            this.setCurrentButton(autbut, false)
          }
        }
        break
      case 'Enter':
        // console.log("-> Le case:Enter du tabulator")
        this.onEnter(evt)
        return DOM.stopEvent(evt)

      case 'Escape': // pour quitter le tabulator
        this.hasBeenRan = false
        this.tabulator.blur()
        return DOM.stopEvent(evt)

      default:

        // console.log(evt)
        let keymin = evt.key.toLowerCase()
        let withCapsLock = keymin != evt.key
        let double_stroke = this.last_time_record
                            && ( this.last_time_record.key == keymin )
                            && ( evt.timeStamp - this.last_time_record.time < 400 )

        if ( undefined !== this.buttons[keymin] )
        {
          let bouton = this.buttons[keymin]
          bouton.downed = false
          this.setCurrentButton(bouton, withCapsLock)
          if (double_stroke) {
            this.onEnter(evt)
            return DOM.stopEvent(evt)
          }
        }
        this.last_time_record = { key: keymin, time: evt.timeStamp }
    }
  }

  /**
  *
  * Met le bouton +bouton+ ({TabulatorButton}) en bouton courant. Si +withMaj+
  * est true, on conserve les boutons courants (multi sélection).
  *
  *
  * @param {TabulatorButton}  bouton Le bouton activé
  * @param {Boolean}          withMaj  True si la touche majuscule est activée.
  **/
  setCurrentButton (bouton, withMaj)
  {
    // console.log(`-> setCurrentButton(${bouton.id}/${bouton.key})`)
    // il y a toujours un bouton courant, sauf quand on règle le premier
    // bouton à la préparation du tabulateur.
    if ( withMaj )
    {
      if ( bouton.actif )
      {
        // <= Un bouton déjà actif
        // => On le désactive et on le sort de la liste des boutons courants
        this.current_buttons.splice(bouton.index_in_current_buttons,1)
        bouton.actif = false
        return
      }
    }
    else // mode normal, sans SHIFT
    {
      // En mode sans MAJ, s'il y a un bouton courant, on le désactive
      if ( this.current_buttons && this.current_buttons.length > 0 ) {
        this.current_buttons.forEach( b => { b.actif = false })
      }
      this.current_buttons = []
    }

    bouton.index_in_current_buttons = this.current_buttons.length
    this.current_buttons.push(bouton)
    bouton.actif = true

    // S'il y a un maximum de sélections et que ce maximum est atteint,
    // il faut retirer les premières sélections
    if ( this.maxSelected && this.current_buttons.length > this.maxSelected )
    {
      while(this.current_buttons.length > this.maxSelected)
      {
        let button = this.current_buttons.shift()
        button.actif = false
      }
    }

    // On actualise chaque fois les indexes des boutons, en ne les affichant
    // que s'il y a plusieurs sélections
    let index = -1 // pour commencer à 0
    this.selectionMultiple = this.current_buttons.length > 1
    this.current_buttons.forEach( (b) => { b.index_in_current_buttons = ++index} )

  }


  /* - Private - */

  /**
  * On mémorise l'état courant (quand on focusse dans le tabulateur)
  * On enregistre notamment les boutons actifs.
  **/
  memorizeInitState ()
  {
    // console.log('-> Tabulator#memorizeInitState')
    let my = this
    // this.actifs_init = function(){return my.current_buttons}()
    this.actifs_init = Object(my.current_buttons)
    // console.log('this.actifs_init',this.actifs_init)
    // console.log('<- Tabulator#memorizeInitState')
  }
  /**
  * Si on blure du tabulator sans jouer la touche Enter, on doit revenir à
  * l'état initial.
  **/
  resetInitState ()
  {
    // console.log('-> Tabulator#resetInitState')
    let my = this
    // this.current_buttons = function(){return my.actifs_init}()
    this.current_buttons = Object(my.actifs_init)
    // Il faut remettre tous les boutons actifs et désactiver tous les
    // autres. Processus : on désactive tous les boutons puis on remet
    // ceux qui étaient sélectionnés.
    let bouton
      , i = 0
    while (bouton = this.getButton(Tabulator.LETTERS[i++]))
    { bouton.actif = false }
    if(this.current_buttons){
      this.current_buttons.forEach( bouton => bouton.actif = true)
    }
    // console.log('<- Tabulator#resetInitState')
  }

  /**
  * Mémorise le gestionnaire de key-events actuel et place le nouveau qui
  * doit servir au tabulateur courant.
  * À la fin, unsetOnKeys remettra le gestionnaire key-events courant pour
  * revenir à l'état précédent.
  **/
  setOnKeys ()
  {
    // console.log('-> #setOnKey (mémorisation gestionnaire keyevents)')
    this.old_onkeydown = window.onkeydown
    this.old_onkeyup   = window.onkeyup
    window.onkeydown  = this.onKeyDown.bind(this)
    window.onkeyup    = this.onKeyUp.bind(this)
    // console.log('<- #setOnKey (mémorisation gestionnaire keyevents et placement du nouveau)')
  }
  /**
  * Après le blur du tabulateur, remet les anciens gestionnaires
  * d'évènements keyDown et keyUp.
  **/
  unsetOnKeys ()
  {
    window.onkeydown  = this.old_onkeydown
    window.onkeyup    = this.old_onkeyup
  }

  /**
  * On ajoute le bouton +tabbutton+ à la liste des boutons/menus du
  * tabulateur. Noter qu'on se sert de la lettre associée au bouton, valeur
  * la plus pertinente ici.
  *
  * @param {TabulatorButton} tabbutton Instance du bouton
  **/
  addButton (tabbutton)
  {
    this.buttons[tabbutton.key] = tabbutton
  }
  getButton (key)
  {
    return this.buttons[key]
  }
}

class TabulatorButton
{
  /**
  * @param {Tabulator} tabulator Le tabulateur auquel appartient le bouton
  * @param {HTMLElement} button   L'objet DOM du bouton/menu
  **/
  constructor (tabulator, button, key)
  {
    this.tabulator  = tabulator
    this.button     = button
    this.id         = button.id
    this.key        = key // la lettre affectée au bouton
    this.tabulator.addButton(this)
    // Propriétés volatiles
    this.downed = false // mis à true quand on le "presse" (presse sa key)
  }

  /**
  * Préparation du bouton, qui pour le moment en est réduit à sa
  * plus simple expression pour permettre d'implémenter les tabulateurs
  * très facilement.
  **/
  prepare ()
  {
    this.button.innerHTML = `
<span class="tab-letter">${this.key}</span>
<span class="tab-label">${this.button.innerHTML}</span>
<span class="smallidx"></span>
    `
  }

  get downed () { return this._downed }
  set downed (v)
  {
    this._downed = v
    DOM[v?'addClass':'removeClass'](this.button,'downed')
  }

  /**
  * On rend le bouton actif
  * Note : il devient le bouton courant de son tabulateur en désactivant le
  * bouton courant du tabulateur.
  **/
  get actif () { return this._is_active }
  set actif (v){
    this._is_active = v
    // this.button.className = v ? 'actif' : ''
    DOM[v?'addClass':'removeClass'](this.button,'actif')
    if ( ! v ) { this.index_in_current_buttons = null }
  }

  get index_in_current_buttons () { return this._index_in_current_buttons }
  set index_in_current_buttons (v){
    this._index_in_current_buttons = v
    let displayedValue = (this.tabulator.selectionMultiple && v !== null) ? Number(v)+1 : ''
    this.button.querySelector('.smallidx').innerHTML = displayedValue
  }

  /**
  * La donnée contenu dans l'attribut `data-tab`, s'il est défini. Sinon,
  * retourne la key
  **/
  get data () {
    if ( undefined === this._data )
    {
      this._data = this.button.getAttribute('data-tab') || this.key
    }
    return this._data
  }
}


module.exports = Tabulator
