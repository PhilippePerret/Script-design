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
  * Méthode appelée à l'ouverture du pan pour le préparer (quand la page
  * est prête, pas avant)
  **/
  static setup ()
  {
    log('-> Tabulator::setup')
    this._items = {} // les tabulateurs
    this.observe()
    log('<- Tabulator::setup')
  }

  /**
  * Place des listener sur tous les boutons en fonction de leur ordre
  **/
  static get LETTERS () {
    return ['q','s','d','f','g','h','j','k','l','m',
            'a','z','e','r','t','y','u','i','o','p']
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
    log('-> Tabulator::observe')
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
    }
    log('<- Tabulator::observe')
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes EVENTS
    *
  *** --------------------------------------------------------------------- */

  /**
  * Méthode évènement appelée quand on focus sur un bouton d'un tabulator
  *
  * @param {String} tabulator_id  ID du tabulator dans le DOM
  * @param {HTMLElement} bouton   Objet DOM du bouton focussé
  **/
  static onFocusButton (tabulator_id, bouton)
  {
    bouton.style.visibility = 'hidden'
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
    // On l'ajoute à la liste. On pourra utiliser `Tabulator.get(<id>)` pour
    // récupérer l'instance.
    Tabulator._items[this.id] = this
  }

  /**
  * On place les gestionnaires d'évènement sur le tabulateur
  **/
  observe ()
  {
    this.tabulator.addEventListener('focus',  this.onFocus.bind(this))
    this.tabulator.addEventListener('blur',   this.onBlur.bind(this))
    // this.tabulator.addEventListener('focus', Tabulator.onFocusTabulator.bind(Tabulator, tabulator))
    // this.tabulator.addEventListener('blur', Tabulator.onBlurTabulator.bind(Tabulator, tabulator))
  }

  /**
  * Quand on focusse dans le tabulateur
  **/
  onFocus (evt)
  {
    Tabulator.current = this
    this.setOnKeys()
  }
  /**
  * Quand on blure du tabulateur
  **/
  onBlur (evt)
  {
    delete Tabulator.current
    this.unsetOnKeys()
  }

  onKeyDown (evt)
  {
    // console.log(`Key down : ${evt.key}`)
    if ( undefined !== this.buttons[evt.key] && !this.buttons[evt.key].downed )
    {
      // <= Un bouton existe, portant cette lettre
      let bouton = this.buttons[evt.key]
      console.log(`Bouton ${bouton.key} pressé`)
      bouton.downed = true
    }
  }
  onKeyUp (evt)
  {
    // console.log(`Key up : ${evt.key}`)
    if ( undefined !== this.buttons[evt.key] )
    {
      let bouton = this.buttons[evt.key]
      bouton.downed = false
      this.setCurrentButton(bouton)
    }
  }

  setCurrentButton (bouton)
  {
    // il y a toujours un bouton courant, sauf quand on règle le premier
    // bouton à la préparation du tabulateur.
    if ( this.current_button ) { this.current_button.actif = false }
    this.current_button = bouton
    bouton.actif        = true
  }
  /* - Private - */

  setOnKeys ()
  {
    this.old_onkeydown = window.onkeydown
    this.old_onkeyup   = window.onkeyup
    window.onkeydown  = this.onKeyDown.bind(this)
    window.onkeyup    = this.onKeyUp.bind(this)
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
    let btn = this.button
    btn.innerHTML =
            `<span class="tab-letter">${this.key}</span>` +
            `<span class="tab-label">${btn.innerHTML}</span>`
    // btn.setAttribute('tab-letter',this.key)
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
    DOM[v?'addClass':'removeClass'](this.button,'actif')
  }
}


module.exports = Tabulator
