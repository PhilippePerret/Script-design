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
let path        = require('path')
  , moment      = require('moment')
  // , requirejs   = require('requirejs')
  , Kramdown    = require(path.join(C.LIB_UTILS_FOLDER,'kramdown_class.js'))

// let Kramdown
// requirejs([path.join(C.LIB_UTILS_FOLDER,'kramdown.js')], (K)=>{Kramdown=K})

class Parag
{
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {Number} Un nouvel identifiant pour un paragraphe. C'est un ID
  * absolu et universel qui doit être fourni, unique à tous les panneaux
  * confondus.
  **/
  static newID ()
  {
    console.log("-> Parag.newID", this._lastID)
    if (undefined === this._lastID) {
      this._lastID = Projet.current.data_generales.last_parag_id || -1
    }
    ++ this._lastID
    // On enregistre toujours le nouveau dernier ID dans les données
    // du projet
    Projet.current.store_data.set({
        updated_at: moment().format()
      , last_parag_id: this._lastID
    })
    // console.log('this._lastID',this._lastID)
    return Number(this._lastID)
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

  /**
  * @return {Array} de {Parag}, la liste des relatifs du parag courant
  *         tels que définis dans les données Relatives du projet
  **/
  get relatifs ()
  {
    if ( undefined === this._relatifs )
    {
      let drelatifs = this.data_relatives
      let arr = {as_referent: [], as_relatifs: []}
        , pan_arr
        , is_referent

      for ( let pan in drelatifs['r'] )
      {
        pan_arr = drelatifs['r'][pan]
        // On détermine si le parag courant est référent en déterminant le nombre
        // d'élément dans sa donnée panneau.
        // Par exemple, si la donnée "n" (notes) contient 2 identifiants, alors
        // on considère que le parag courant est référent et que ces deux
        // notes sont les relatifs purs
        is_referent = pan_arr.length > 1
        // On enregistre les relatifs dans la liste as_relatifs si le parag
        // est référent est dans la liste as_referent dans le cas contraire
        if ( is_referent )
        {
          pan_arr.forEach( pid => arr.as_relatifs.push(Parags.get(pid)))
        }
        else
        {
          arr.as_referent.push(Parags.get(pan_arr[0]))
        }
      }
      this._relatifs = arr
    }
    return this._relatifs
  }

  get data_relatives ()
    { return Projet.current.relatives.data.relatives[String(this.id)] }


  /**
  * Retourne l'index du paragraphe dans le panneau
  **/
  get index ()
  {
    return Array.prototype.indexOf.call(this.panneau.container.childNodes, this.mainDiv)
  }

  get next ()
  {
    {
      if (this.mainDiv.nextSibling){
        return this.panneau.parags.instanceFromElement(this.mainDiv.nextSibling)
      }
    }
  }
  /**
  * @return {Parag} le paragraphe qui précède le paragraphe courant
  *                 ou nul s'il n'y en a pas
  **/
  get previous ()
  {
    if (this.mainDiv.previousSibling){
      return this.panneau.parags.instanceFromElement(this.mainDiv.previousSibling)
    }
  }


  edit ()
  {
    this.doEdit.bind(this)()
  }

  /**
  * Méthode appelée quand on blur le champ contents pour actualiser
  * le contenu du paragraphe **et que la valeur a changé**
  **/
  onChangeContents ()
  {
    // console.log('-> onChangeContents')
    this.contents = this.newContents
    // console.log('On met le contents à ', this.contents)
    this.data.contents = this.contents
    // pour forcer l'actualisation du contenu mis en forme
    delete this._formated_contents
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
    let o
    if ( ! this._main_div ){
      if (o = this.container.querySelector(`div#p-${this.id}`)) {
        this._main_div = o
      } else {
        this._main_div = this.build()
      }
    }
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
    // console.log(`-> Parag.select #${this.id}`)
    DOM.addClass(this.mainDiv,'selected')
    this.selected = true
    // console.log(`<- Parag.select #${this.id}`)
    return this
  }
  deselect ()
  {
    // console.log(`-> Parag.deselect #${this.id}`)
    if ( this.relatifsExergued ) { this.unexergueRelatifs() }
    DOM.removeClass(this.mainDiv, 'selected')
    this.selected = false
    // console.log(`<- Parag.deselect #${this.id}`)
    return this
  }


  exergue (as_referent)
  {
    if ( this.exergued ) { return this }
    DOM.addClass(this.mainDiv, as_referent ? 'referent' : 'relatif')
    this.exergued = true
    return this
  }
  unexergue ()
  {
    if ( ! this.exergued ) { return this }
    DOM.removeClass(this.mainDiv, 'referent')
    DOM.removeClass(this.mainDiv, 'relatif')
    this.exergued = false
    return this
  }

  /* Private */

  /**
  * Ne jamais appeler directement
  **/
  setCurrent ()
  {
    DOM.addClass(this.mainDiv,'current')
    this.current = true
    return this
  }
  unsetCurrent ()
  {
    DOM.removeClass(this.mainDiv,'current')
    this.current = false
    return this
  }

  // /**
  // * Déplace le parag après le parag +iparag+
  // * @param {Parag} iparag Instance de paragraphe
  // **/
  // moveAfter (iparag)
  // {
  //   this.container.insertBefore(this.mainDiv, iparag.mainDiv.nextSibling)
  //   this.panneau.modified = true
  // }
  // /**
  // * Déplace le parag avant le parag +iparag+
  // * @param {Parag} iparag Instance de paragraphe
  // **/
  // moveBefore (iparag)
  // {
  //   this.container.insertBefore(this.mainDiv, iparag.mainDiv)
  //   this.panneau.modified = true
  // }

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
        , divCont = DOM.create('div',{class:'p-contents',id:`${div_id}-contents`,inner:this.formatedContents})
    // Ajout du contenu textuel

    div.appendChild(divCont)
    this.observe_div(div)
    this.observe_contents(divCont)
    return div
  }

  observe_div (div)
  {
    if(undefined===div){div = this.mainDiv}
    div.addEventListener('click', this.onClick.bind(this))
  }
  observe_contents (divCont)
  {
    if(undefined === divCont){ divCont = this.divContents }
    divCont.addEventListener('click', this.doEdit.bind(this))
    divCont.addEventListener('blur',  this.undoEdit.bind(this))
  }

  /**
  * Méthode appelée lorsque l'on clique sur le div principal
  * Pour le moment, ça n'agit que lorsque la touche Méta (CMD) est pressée,
  * pour ne pas rentrer en collision avec le clique sur le divContents qui
  * met le paragraphe en édition.
  **/
  onClick (evt)
  {
    if (evt.metaKey)
    {
      // CMD Click
      if ( Projet.mode_double_panneaux )
      {
        // <= CMD Click mode double panneaux
        if ( this.selected ){
          this.deselect()
          this.unexergueRelatifs()
        }
        else {
          this.select()
          this.exergueRelatifs()
        }
      }
      return DOM.stopEvent(evt)
    }
  }

  // --- private ---

  /**
  * Méthode qui met en exergue tous les relatifs du paragraphe
  * Plus précisément, la méthode va regarder si le paragraphe est un relatif
  * ou un référent et mettre les paragraphes dans le style en fonction.
  * Le paragraphe est un référent s'il est seul dans la données de ses
  * relatif et il est relatif s'il n'est pas seul dans cette donnée.
  **/
  exergueRelatifs ()
  {
    // Il faut régler la classe du paragraphe cliqué en fonction
    // de son statut dans les doubles panneaux, referent ou relatif
    let statutDblPan = this.statutDoublePanneau
    if(statutDblPan !== 'none')
    {
      // Si le parag courant cliqué est un relatif, alors il faut mettre en
      // exergue tous les relatifs du référent pour mettre en exergue les
      // frère de ce parag.
      // Noter que la propriété `this.referent_id` est tout à fait provisoire
      // et dépend entièrement des panneaux qui sont activés.
      if ( statutDblPan == 'relatif' )
      {
        Parags.get(this.referent_id).exergueRelatifs()
      }
      else
      {
        // Le parag est un référent
        DOM.addClass(this.mainDiv, statutDblPan)
        this.relatifs.as_relatifs.forEach( iparag => iparag.exergue(false) )
      }
    }
    this.relatifsExergued = true
  }
  /**
  * Méthode qui sert de l'exergue tous les relatifs du paragraphe
  **/
  unexergueRelatifs ()
  {
    let statutDblPan = this.statutDoublePanneau
    if ( statutDblPan != 'none' )
    {
      if ( statutDblPan == 'relatif'){
        Parags.get(this.referent_id).unexergueRelatifs()
      }
      else
      {
        // Le parag est un référent
        this.relatifs.as_relatifs.forEach( iparag => iparag.unexergue() )
        DOM.removeClass(this.mainDiv, statutDblPan)
      }
    }
    this.relatifsExergued = false
  }

  /**
  * Propriété statut du parag dans le mode double panneau actuel
  * En fonction des deux panneaux choisis, le paragraphe peut avoir trois
  * status différents :
  *     'none'      Il n'a pas de relatives
  *     'referent'  Il est le référent de plusieurs paragraphes de l'autre
  *                 panneau.
  *     'relatif'   Il est relatif, avec d'autres paragraphes à côté de
  *                 lui, d'un référent de l'autre panneau.
  **/
  get statutDoublePanneau ()
  {
    if ( ! Projet.mode_double_panneaux ) { return 'none' }
    let pan_letter = Projet.PANNEAUX_DATA[this.panneau_id].oneLetter
    // console.log(`pan_letter du parag ${this.id} : ${pan_letter}`)
    // Il faut récupérer les deux panneaux activés
    let other_panneau
    if ( Projet.alt_panneau.name == this.panneau_id ){
      other_panneau = Projet.current_panneau.name
    } else {
      other_panneau = Projet.alt_panneau.name
    }
    // console.log(`Nom de l'autre panneau : ${other_panneau}`)
    let other_pan_letter = Projet.PANNEAUX_DATA[other_panneau].oneLetter
    // console.log(`Lettre de l'autre panneau : ${other_pan_letter}`)
    let drelatives = this.data_relatives
    // console.log(`Données relative : ${JSON.stringify(drelatives)}`)
    if (undefined === drelatives['r'][other_pan_letter]) {return 'none'}
    // console.log(`drelatives['r']['${other_pan_letter}'] = ${drelatives['r'][other_pan_letter].join(', ')}`)
    if ( drelatives['r'][other_pan_letter].length > 1){
      // console.log("=> referent")
      return 'referent' // ce paragraphe est le référent
    } else {
      // Ce paragraphe est un relatif
      // On va plutôt renvoyer le travail d'afficher les relatifs à son
      // référent pour que tous les relatifs soient bien affichés.
      this.referent_id = drelatives['r'][other_pan_letter][0]
      // console.log("=> relatif")
      return 'relatif'
    }
  }

  // Passer le champ contents en mode édition (sauf si la touche CMD est
  // pressée)
  // On conserve la valeur actuelle du champ pour la comparer à la nouvelle
  // et savoir s'il y a eu un changement.

  doEdit (evt)
  {
    if (evt && evt.metaKey) { return true }
    this.divContents.contentEditable = 'true'
    this.divContents.innerHTML = this.contents.replace(/\n/g,'<br>')
    this.divContents.focus()
    Projet.mode_edition = true
    this.actualContents = String(this.contents)
  }
  // Sortir le champ contents du mode édition (et enregistrer
  // la nouvelle donnée si nécessaire)
  undoEdit (evt)
  {
    if ( this.contentsHasChanged() )
    {
      this.onChangeContents.bind(this)()
    }
    this.divContents.contentEditable = 'false'
    // Il faut toujours remettre le contenu car le code original est en
    // kramdown avec des variables.
    this.divContents.innerHTML = this.formatedContents
    Projet.mode_edition = false
  }

  /**
  * @return true si le contenu, après édition, a été modifié. On en profite
  *         aussi pour définir le nouveau contenu dans this.newContents
  **/
  contentsHasChanged () {
    this.defineNewContents()
    return this.actualContents != this.newContents
  }

  /**
  * @return {String} Le nouveau contenu (non formaté, donc pour enregistrement)
  **/
  defineNewContents ()
  {
    let c = this.divContents.innerHTML.replace(/<br>/g,"\n")
    c = c.replace(/<div>/g,'')
    c = c.replace(/<\/?div>/g,"\n").trim()
    this.newContents = c
  }

  /**
  * Le texte tel qu'il doit être affiché dans la page
  *
  * Peut-être qu'une méthode plus générale devra être instituée pour traiter l'affichage
  * du paragraphe, notamment lorsqu'il y aura des balises propres au projet, comme les
  * personnages, etc.
  **/
  get formatedContents () {
    if (undefined === this._formated_contents){
      if ( this.contents )
      {
        this._formated_contents = Kramdown.parse(this.contents)
      }
      else
      {
        this._formated_contents = ''
      }
    }
    return this._formated_contents
  }
}

module.exports = Parag
