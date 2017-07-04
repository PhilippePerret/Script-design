/** ---------------------------------------------------------------------
  *   class Parag
  *   ------------
  *   Classe des textes en tant qu'entité {Parag}
  *   Dans l'application, tous les textes des projets sont des Parag(s),
  *   que ce soit un paragraphe de synopsis ou un évènement du scénier.
  *
  *   Despite its name, a <Parag> can own several real paragraphs.
  *
*** --------------------------------------------------------------------- */
let moment = require('moment')

class Parag
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {Number} Un nouvel identifiant pour un paragraphe
  **/
  static newID ()
  {
    if (undefined === this._lastID) { this._lastID = -1 }
    ++ this._lastID
    return Number(this._lastID)
  }


  // Met le paragraphe +iparag+ en paragraphe courant
  static setCurrent (iparag)
  {
    if (this.current) { this.unsetCurrent(this.current) }
    this._current = iparag
    // TODO Ci-dessous, il faudra remplacer ce "true" par la valeur
    // de la touche majuscule pressée (si MAJ est pressée, la valeur doit
    // être true c'est-à-dire qu'on ne doit pas déselectionner les paragraphes
    // sélectionnés)
    if ( true /* on regardera si la touche majuscule est pressée */ )
    {
      this.selecteds.forEach( p => p.deselect.bind(p)() )
      this._selecteds = []
    }
    this.current.select().setCurrent()
  }

  // Sort le paragraphe +iparag+ du courant
  static unsetCurrent(iparag)
  {
    if(undefined === iparag){iparag = this.current}
    iparag.unsetCurrent()
  }

  static addSelect (iparag)
  {
    if(undefined===this._selecteds){this._selecteds=[]}
    this._selecteds.push(iparag)
  }
  /**
  * @return {Parag} Le paragraphe courant.
  *
  * Noter qu'il peut y avoir plus paragraphe sélectionnés mais qu'il n'y
  * a toujours qu'un seul courant.
  *
  **/
  static get current () { return this._current }
  /**
  * @return {Array} la liste des instances {Parag}(s) sélectionnées,
  * lorsque la touche majuscule est pressée.
  **/
  static get selecteds ()
  {
    if(undefined === this._selecteds){this._selecteds = []}
    return this._selecteds
  }

  /** ---------------------------------------------------------------------
    *
    *   INSTANCE Parag
    *
  *** --------------------------------------------------------------------- */
  constructor (data)
  {
    this.id   = data.id // doit toujours exister
    this.data = data
    this.dispatch(data)
    if ( this.id > Parag._lastID ) { Parag._lastID = this.id }
    if ( ! this.panneau_id ) {
      this.panneau_id = Projet.current_panneau.id // = name
    }
    this.selected = false // à true quand il est sélectionné
    this.current  = false // à true quand c'est le paragraphe courant
    Parags.addItem(this)
  }

  /** ---------------------------------------------------------------------
  *   DATA Methods
  *
  * --------------------------------------------------------------------- */
  dispatch (data)
  {
    for(let prop in data){
      if(!data.hasOwnProperty(prop)){continue}
      this[prop]=data[prop]
    }
  }

  /**
  * @return {Object} les données du parag pour enregistrement
  **/
  get as_data ()
  {
    // Pour le moment, on a juste à retourner les données
    this.data.panneau_id = this.panneau_id
    return this.data
  }

  edit ()
  {
    Parag.setCurrent(this)
    this.doEdit.bind(this)()
  }

  /**
  * Méthode appelée quand on blur le champ contents pour actualiser
  * le contenu du paragraphe **et que la valeur a changé**
  **/
  onChangeContents ()
  {
    this.contents = this.divContents.innerHTML // TODO Corriger
    this.data.contents = this.contents
    this.setModified()
    this.panneau.modified = true
  }

  /**
   * Pour marquer le parag modifié
   */
  setModified ()
  {
    this.modified = true
    this.data.updated_at = moment().format()
  }
  /** ---------------------------------------------------------------------
    *   EVENTS Méthodes
    *
  *** --------------------------------------------------------------------- */


  /** ---------------------------------------------------------------------
    * DOM Methods
  **/

  /**
  * @return {PanProjet} Le panneau courant, auquel appartient le paragraphe
  **/
  get panneau ()
  {
    if ( undefined === this._panneau )
    { this._panneau = Projet.panneaux[this.panneau_id] }
    return this._panneau
  }
  /**
  * @return {HTMLElement} Le container du paragraphe dans le panneau
  * C'est un raccourci de Projet.current_panneau.container.
  **/
  get container ()
  {
    if ( ! this._container ){ this._container = this.panneau.container }
    return this._container
  }
  /**
  * @return {HTMLDivElement} Le div principal du Parag
  *
  * Note : le construit si nécessaire.
  **/
  get mainDiv ()
  {
    if (undefined === this._main_div){this._main_div = this.build()}
    return this._main_div
  }

  /**
  * @return {HTMLElement} Div du contenu textuel du paragraphe.
  **/
  get divContents ()
  {
    if (!this._div_contents)
    {this._div_contents=this.mainDiv.getElementsByClassName('p-contents')[0]}
    return this._div_contents
  }

  /**
  * Sélection du paragraphe courant.
  * Note : au moment de sa sélection, on le met également en courant
  * mais ce comportement pourra être révisé si c'est nécessaire.
  **/
  select ()
  {
    if ( this.selected ) { return this }
    DOM.addClass(this.mainDiv,'selected')
    Parag.addSelect(this)
    this.selected = true
    return this
  }
  deselect ()
  {
    if ( ! this.selected ) { return this }
    DOM.removeClass(this.mainDiv, 'selected')
    this.selected = false
    return this
  }

  /* Private */

  /**
  * Ne jamais appeler directement
  **/
  setCurrent ()
  {
    if ( this.current ) { return this }
    DOM.addClass(this.mainDiv,'current')
    this.current = true
    return this
  }
  unsetCurrent ()
  {
    if ( ! this.current ) { return this }
    DOM.removeClass(this.mainDiv,'current')
    this.current = false
    return this
  }

  /**
  * Déplace le parag après le parag +iparag+
  * @param {Parag} iparag Instance de paragraphe
  **/
  moveAfter (iparag)
  {
    this.container.insertBefore(this.mainDiv, iparag.mainDiv.nextSibling)
    this.panneau.modified = true
  }
  /**
  * Déplace le parag avant le parag +iparag+
  * @param {Parag} iparag Instance de paragraphe
  **/
  moveBefore (iparag)
  {
    this.container.insertBefore(this.mainDiv, iparag.mainDiv)
    this.panneau.modified = true
  }

  /**
  * Build Dom element for parag
  *
  * @return {HTMLDivElement} L'élément construit.
  **/
  build ()
  {

    let
          div_id  = `p-${this.id}`
        , div     = DOM.create('div', {class:'p', id: div_id, 'data-id':String(this.id)})
        , divCont = DOM.create('div',{class:'p-contents',id:`${div_id}-contents`,inner:this.contentsDisplayed})
    // Ajout du contenu textuel

    div.appendChild(divCont)
    this.observe_contents(divCont)
    return div
  }

  observe_contents (divCont)
  {
    if(undefined === divCont){ divCont = this.divContents }
    divCont.addEventListener('click', this.doEdit.bind(this))
    divCont.addEventListener('blur',  this.undoEdit.bind(this))
  }

  // *private* Passer le champ contents en mode édition
  // On conserve la valeur actuelle du champ pour la comparer à la nouvelle
  // et savoir s'il y a eu un changement.
  doEdit (evt)
  {
    this.divContents.contentEditable = 'true'
    this.divContents.focus()
    Projet.mode_edition = true
    this.prevValue = this.divContents.innerHTML
  }
  // *private* Sortir le champ contents du mode édition (et enregistrer
  // la nouvelle donnée si nécessaire)
  undoEdit (evt)
  {
    if ( this.prevValue != this.divContents.innerHTML )
    {
      this.onChangeContents.bind(this)(this.divContents)
    }
    this.divContents.contentEditable = 'false'
    Projet.mode_edition = false
  }

  /**
  * Le texte tel qu'il doit être affiché dans la page
  *
  * Peut-être qu'une méthode plus générale devra être instituée pour traiter l'affichage
  * du paragraphe, notamment lorsqu'il y aura des balises propres au projet, comme les
  * personnages, etc.
  **/
  get contentsDisplayed () {
    if (undefined === this._contents_displayed){
      this._contents_displayed = this.contents.replace(/\r?\n/g,'<br>')
    }
    return this._contents_displayed
  }
}

module.exports = Parag
