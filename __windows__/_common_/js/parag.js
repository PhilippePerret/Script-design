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
    // console.log("-> Parag.newID", this._lastID)
    if( undefined === this._lastID)
    {
      if ( undefined === Projet.current.data_generales.last_parag_id ) {
        this._lastID = -1
      } else {
        this._lastID = Projet.current.data_generales.last_parag_id
      }
    }
    ++ this._lastID
    // On enregistre toujours le nouveau dernier ID dans les données
    // du projet
    Projet.current.store_data.set({
        updated_at: moment().format()
      , last_parag_id: this._lastID
      },
      undefined,
      true /* pour dire de ne pas le faire en asynchrone */
    )
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
    this.id     = data.id // doit toujours exister
    this.projet = Projet.current
    this.panneau_id = data.panneau_id || this.projet.current_panneau.id
    delete data.panneau_id
    this.data   = data
    // Dans tous les cas, on ajoute l'instance à Parags.items afin de pouvoir
    // toujours récupérer un paragraphe, quel que soit son panneau, avec la
    // méthode `Parags.get(<id>)`
    Parags.add(this)
  }

  /** ---------------------------------------------------------------------
  *
  *   DATA Methods
  *
  * --------------------------------------------------------------------- */
  get contents    ()  { return this.data.c    }
  set contents    (v) { this.data.c = v ; this.reset()  }
  get duration    ()  { return this.data.d    }
  set duration    (v) { this.data.d = v ; this.reset()  }
  get created_at  ()  { return this.data.ca   }
  set created_at  (v) { this.data.ca = v      }
  get updated_at  ()  { return this.data.ua   }
  set updated_at  (v) { this.data.ua = v      }

  // Pour forcer le "recalcul" de toutes les propriétés volatiles à
  // construire.
  reset ()
  {
    delete this._formated_contents
    delete this._formcontsanstags
    delete this._formated_duration
    this.updateDisplay()
  }

  /**
  * Cette méthode actualise l'affichage du paragraphe s'il existe dans son
  * conteneur.
  **/
  updateDisplay ()
  {
    if ( this.divContents )
    {
      // this.divContents.innerHTML = this.contentsFormated
    }
  }
  /** ---------------------------------------------------------------------
    *
    *   Méthode de formatage
    *
  *** --------------------------------------------------------------------- */

  /**
  * Le texte tel qu'il doit être affiché dans la page
  *
  * Peut-être qu'une méthode plus générale devra être instituée pour traiter l'affichage
  * du paragraphe, notamment lorsqu'il y aura des balises propres au projet, comme les
  * personnages, etc.
  **/
  get contentsFormated () {
    if ( ! this._formated_contents )
    {
      this.formateContents() // peut être asynchrone
    }
    return this._formated_contents
  }

  get contentsFormatedSansTags () {
    this._formcontsanstags || (
      this._formcontsanstags =
          this.contentsFormated
            .replace(/<(.*?)>/g, '')
            .replace(/"/, "\\\"")
            .trim()
    )
    return this._formcontsanstags
  }


  as_link (options) {
    options       || ( options = {} )
    options.titre || ( options.titre = `#${this.id}`)
    return  '<a href="#"'
          + `  onclick="return showParag(${this.id})"`
          + '  class="p-al"'
          + `  title="${this.contentsFormatedSansTags}">${options.titre}</a>`
              // Class 'p-al' pour 'parag as link'
  }

  get durationFormated () {
    if ( ! this._formated_duration ) {
      if(undefined === this.duration){
        this._formated_duration = '---'
      } else {
        this._formated_duration = Number[this.projet.option('dureepage')?'pages':'s2h'](this.duration)
      }
    }
    return this._formated_duration
  }

  /**
  * Méthode qui formate le contenu à afficher du paragraphe
  *
  * @return {String} Le contenu formaté
  * @produit this._formated_contents
  *
  **/
  formateContents ()
  {
    if ( ! this.contents ) { return '' }
    let c = Kramdown.parse(this.contents)

    // === Les balises PARAG#xxx ===
    // Pour mettre la liste des paragraphes qui n'ont pas été trouvés
    // de côté.
    // Si le paragraphe existe (i.e. est déjà chargé), on met directement
    // son lien d'affichage, sinon, on conserve l'identifiant dans la liste
    // missing_parags_list pour le charger plus tard et on met en attendant
    // une marque __Pxxx__ à remplacer après le chargement des paragraphes.
    let missing_parags_list = []
    let p
    c = c.replace(/PARAG#([0-9]+)/g, (found, pid) => {
      p = Parags.get(Number(pid))
      if ( undefined !== p )
      {
        return p.as_link({relative: true})
      }
      else
      {
        missing_parags_list.push(pid)
        return `<__P${pid}__/>`
      }
    })
    this._formated_contents = c
        // ATTENTION : Il faut vraiment définit this._formated_contents AVANT
        // de traiter les missings_parags car la méthode loadAndReplaceMarks
        // se sert de la valeur de this._formated_contents
    if ( missing_parags_list.length )
    {
      // <= des paragraphes n'étaient pas chargés, on a mis des marques
      //    marques à la place, qu'on va remplacées une fois qu'elles
      //    seront.
      this.missing_parags_ids = missing_parags_list
      this.loadAndReplaceMarks()
    }
    return c // cf. contentsFormated()
  }

  /**
  * Méthode qui prend en argument une liste d'identifiant de paragraphes
  * non chargés, qui les charges, puis qui remplace dans les textes affichés
  * les marques __Pxxx__ par les liens correspondants vers les paragraphes
  * correspondants.
  **/
  loadAndReplaceMarks ()
  {
    console.log("-> loadAndReplaceMarks")
    console.log('[loadAndReplaceMarks] this.missing_parags_ids = ', this.missing_parags_ids)
    const my = this
    let pid, p, re, pano

    my.provisoireContents || ( my.provisoireContents = my._formated_contents )

    if ( pid = Number(this.missing_parags_ids.pop()) )
    {
      // <= Il reste encore des paragraphes manquants
      // => On traite le dernier.
      // On essaie toujours de récupérer le paragraphe car il a peut-être
      // été chargé par le chargement du paragraphe précédent
      if ( p = Parags.get(pid) )
      {
        // <= Le paragraphe a été chargé entre temps
        // => On peut l'utiliser tout de suite et passer à la suite
        my.traiteMarkParagAndGoOn(pid, p)
      }
      else
      {
        // <= Le paragraphe n'est toujours pas chargé
        // => Il faut charger son panneau pour l'obtenir
        //    Note : les relatives nous donne l'information très simplement
        pano = my.projet.relatives.all[String(pid)]['t']
        pano = my.projet.panneau(Projet.PANNEAUX_DATA[pano])
        pano.load(() => {
          let my = Parags.get(this.id)
          my.traiteMarkParagAndGoOn.bind(my)(pid)
        })
      }
    }
    else
    {
      // <= Il n'y a plus de paragraphes manquant à traiter
      console.log("Fin du traitement des paragraphes manquants")
      delete my.missing_parags_ids
      my._contents_formated = my.provisoireContents
      delete my.provisoireContents
      // TODO il faut modifier le texte dans le document
    }
  }
  /**
  * Méthode utile à la précédente, pour modifier les marques __Pxxx__ dans
  * le texte formaté du paragraphe, lorsque des marques PARAG#xxx ont été
  * trouvées, mais que ces paragraphes n'étaient pas encore chargés.
  **/
  traiteMarkParagAndGoOn (pid, iparag )
  {
    let my = this
    iparag || ( iparag = Parags.get(pid) )
    console.log('REMPLACEMENT')
    console.log("DE", `<__P${pid}__/>`)
    console.log("PAR", iparag.as_link({relative:true}))
    console.log('DANS', my.provisoireContents)
    my.provisoireContents = my.provisoireContents
          .replace(`<__P${pid}__/>`, iparag.as_link({relative:true}))
    console.log("my.provisoireContents = ", my.provisoireContents)
    // On poursuit avec le prochain paragraphe manquant qu'il faut charger
    my.loadAndReplaceMarks()
  }
  /** ---------------------------------------------------------------------
    *
    *     RELATIVES
    *
  *** --------------------------------------------------------------------- */

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
          pan_arr.forEach( pid => arr.as_relatifs.push(Parags.get(Number(pid))))
        }
        else
        {
          arr.as_referent.push(Parags.get(Number(pan_arr[0])))
        }
      }
      this._relatifs = arr
    }
    return this._relatifs
  }

  get data_relatives ()
    { return this.projet.relatives.data.relatives[String(this.id)] }

  set data_relatives (v) {
    this.projet.relatives.data.relatives[String(this.id)] = v
    // TODO Il faut aussi régler les associés
  }
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

  /**
  * Méthode appelée pour éditer le parag
  **/
  edit ()
  {
    this.doEdit.bind(this)()
  }

  syncAllPanneaux()
  {
    console.log('-> syncAllPanneaux')
    const my    = this
        , proj  = this.projet
    my.i_panneau_sync || ( my.i_panneau_sync = 0 )
    let pan_id = Projet.PANNEAUX_SYNC[my.i_panneau_sync++]
    console.log("pan_id:", pan_id)
    if ( pan_id )
    {
      if ( proj.panneau(pan_id).loaded ) {
        my.syncInPanneau(pan_id)
      } else {
        // On charge le panneau puis on lance la méthode de synchronisation
        console.log("--> On doit charger le panneau", pan_id)
        proj.panneau(pan_id).load( this.syncInPanneau.bind(this, pan_id) )
      }
    }
    else
    {
      //
      // On achève la synchronisation
      //
      // En enfin, on procède à l'association de tous les paragraphes
      // créés
      // puts(`Paragraphes à associer : ${this.parags2sync_list.map(p=>{return p.id})}`)
      console.log("Fin de la synchronisation de tous les panneaux synchronisables.")
      proj.relatives.associate(this.parags2sync_list)
      proj.busy = false
      delete this.i_panneau_sync
    }
  }
  /**
  * Méthode qui synchronise le paragraphe courant dans le panneau pan_id
  **/
  syncInPanneau(pan_id)
  {
    const my = this
    console.log("Synchronisation du panneau", pan_id)
    let newParagSync
      , pano
      , nombre_parags = this.panneau.parags.count
      , myindex       = this.index
      , ipar
      , iparag
      , paragAfter_id
      , paragAfter // le paragraphe avant lequel ajouter le parag synchronisé
      , optionsAdd

    // S'il s'agit du panneau du parag, on ne fait rien, évidemment
    if ( pan_id !== my.panneau_id ) {

      // puts(`* ÉTUDE DU PANNEAU ${pan_id} *`)
      // Si le paragraphe courant est déjà en relation avec un paragraphe
      // du panneau +pan_id+, il n'y a rien à faire
      if ( my.relativeParagInPanneau(pan_id) ) { return true }

      pano = my.projet.panneau(pan_id)

      paragAfter = undefined

      for(ipar = myindex+1; ipar < nombre_parags ; ++ipar){
        iparag = my.panneau.parags.items[ipar]
        if ( null !== (paragAfter_id = iparag.relativeParagInPanneau(pan_id, true)) )
        {
          paragAfter = Parags.get(Number(paragAfter_id))
          break
        }
      }

      if ( !paragAfter
          && my.previous
          && (paragAfter_id = my.previous.relativeParagInPanneau(pan_id, false))
      )
      {
        paragAfter = Parags.get( Number(paragAfter_id) ).next
      }

      newParagSync = new Parag({
          id: Parag.newID()
        , c : `[Relatif du paragraphe PARAG#${my.id}]`
        , ca: moment().format('YYMMDD')
        , d : my.duration // par défaut, la même durée que ce parag
      })
      // puts("===/fin de création du paragraphe")

      optionsAdd = {}
      paragAfter && ( optionsAdd.before = paragAfter )
      console.log(`[Synchronisation] Ajout du parag#${newParagSync.id} en synchro avec parag#${this.id} dans le panneau '${pan_id}'`)
      pano.parags.add( newParagSync, optionsAdd )
      pano.modified = true
      // Ajout du paragraphe à la liste des paragraphes qui seront associés
      // quand on les aura tous créés.
      this.parags2sync_list.push(newParagSync)

    } // fin de si ça n'est pas le panneau courant

    // À la fin, on peut passer au panneau suivant, ou arrêter
    this.syncAllPanneaux()
  }
  /**
  * Méthode appelée pour synchroniser le parag dans les autres panneaux
  *
  * C'est une méthode asynchrone car il faut peut-être charger le panneau
  * qui va recevoir le nouvel élément.
  **/
  sync ()
  {
    console.log(`-> sync() du parag#${this.id}`)
    this.projet.busy = true         // pour empêcher la sauvegarde
    this.parags2sync_list = [this]  // liste des parags qui seront associés
    this.syncAllPanneaux()
  }

  /**
  * Méthode qui retourne le paragraphe avant lequel le paragraphe courant est
  * en relation dans le panneau courant.
  *
  * Noter que cette méthode ne
  *
  * @param  {String} pan_id   L'ID du panneau (entier, donc 'manuscrit')
  * @param {Boolean} firstOne Si true, on doit renvoyer le premier, sinon,
  *                           on renvoie le dernier.
  *
  * @return {Number}  L'ID du paragraphe avant lequel insérer le nouveau
  *                   paragraphe ou NULL s'il doit être inséré à la fin.
  **/
  relativeParagInPanneau ( pan_id, firstOne )
  {
    // La lettre correspondant au panneau
    const oneLettreCol = Projet.PANNEAUX_DATA[pan_id].oneLetter
    // puts(`oneLettreCol = ${oneLettreCol}`)

    // Toutes les relatives du projet
    // ------------------------------
    const rels = this.projet.relatives.all
    // if (! this.this_projet_relatives_marked )
    // {
    //   puts(`this.projet.relatives.all = ${JSON.stringify(this.projet.relatives.all)}`)
    //   this.this_projet_relatives_marked = true
    // }

    // Relatifs du paragraphe courant
    // ------------------------------
    // C'est un Hash qui contient en clé les colonnes une-lettre et
    // en valeur une liste
    const rels_cur_parag = rels[String(this.id)]['r']
    // puts(`rels[String(${this.id})]['r'] (rels_cur_parag) = ${JSON.stringify(rels[String(this.id)]['r'])}`)

    // Si le paragraphe n'a pas de donnée concernant la colonne, on ajoute
    // à la fin
    if ( undefined === rels_cur_parag[oneLettreCol] ) {
      // puts(`Pas de clé '${oneLettreCol}' dans ${JSON.stringify(rels[String(this.id)]['r'])}`)
      return null
    }
    // Sinon, il y a des données, c'est-à-dire que le paragraphe est en
    // relation avec des paragraphes de l'autre panneau.
    // Mais il faut noter que les identifiants ne sont pas forcément dans l'ordre
    // dans le plateau. Il faut les classer.
    // puts(`Classement au début : ${rels_cur_parag[oneLettreCol]}`)
    rels_cur_parag[oneLettreCol].sort((pid1,pid2)=>{
      return Parags.get(pid1).index - Parags.get(pid2).index
    })
    // puts(`Classement après classement : ${rels_cur_parag[oneLettreCol]}`)

    if ( firstOne )
    {
      // puts(`On retourne le premier parag : ${rels_cur_parag[oneLettreCol][0]}`)
      return rels_cur_parag[oneLettreCol][0]
    }
    else
    {
      let nombre_rels = rels_cur_parag[oneLettreCol].length
      // puts( `On retourne le dernier parag : ${rels_cur_parag[oneLettreCol][nombre_rels - 1]}`)
      return rels_cur_parag[oneLettreCol][nombre_rels - 1]
    }
  }

  /**
  * Méthode appelée quand on blur le champ contents pour actualiser
  * le contenu du paragraphe **et que la valeur a changé**
  *
  * À la création du paragraphe, c'est cette méthode qui crée
  * les paragraphes synchronisés si le paragraphe a réellement
  * été créé (this.sync_after_save à true).
  **/
  onChangeContents ()
  {
    // console.log('-> onChangeContents')
    this.contents = this.newContents
    // pour forcer l'actualisation du contenu mis en forme
    delete this._formated_contents
    this.setModified()
    if ( this.sync_after_save )
    {
      this.sync()
      delete this.sync_after_save
    }
    this.panneau.modified = true
  }

  /**
   * Pour marquer le parag modifié
   */
  setModified ()
  {
    this.updated_at = moment().format('YYMMDD')
    this.modified = true
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
    this._panneau || (this._panneau = this.projet.panneau(this.panneau_id))
    return this._panneau
  }
  /**
  * @return {HTMLElement} Le container du paragraphe dans le panneau
  * C'est un raccourci de Projet.current_panneau.container.
  **/
  get container ()
  {
    this._container || ( this._container = this.panneau.container )
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
        , divCont = DOM.create('div',{class:'p-contents',id:`${div_id}-contents`,inner:this.contentsFormated})
    // Ajout du contenu textuel

    div.appendChild(divCont)
    this.observe_div(div)
    this.observe_contents(divCont)
    return div
  }

  observe_div (div)
  {
    div || (div = this.mainDiv)
    div.addEventListener('click', this.onClick.bind(this))
  }
  observe_contents (divCont)
  {
    divCont || (divCont = this.divContents)
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
      if ( this.projet.mode_double_panneaux )
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
    if ( ! this.projet.mode_double_panneaux ) { return 'none' }
    let pan_letter = Projet.PANNEAUX_DATA[this.panneau_id].oneLetter
    // console.log(`pan_letter du parag ${this.id} : ${pan_letter}`)
    // Il faut récupérer les deux panneaux activés
    let other_panneau
    if ( this.projet.alt_panneau.name == this.panneau_id ){
      other_panneau = this.projet.current_panneau.name
    } else {
      other_panneau = this.projet.alt_panneau.name
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
    if ( evt && evt.metaKey ) { return true }
    let o = this.divContents
    let realContents
    o.contentEditable = 'true'
    try
    {
      realContents = this.contents.replace(/\n/g,'<br>')
    }
    catch(err)
    {
      console.log(`[doEdit] ERREUR avec parag#${this.id}`, err)
      console.log(`[doEdit] Le parag#{this.id} contient (data) :`,this.data)
      realContents = ''
    }
    o.innerHTML = realContents
    o.focus()

    let startNode = o.firstChild
      , endNode   = o.firstChild

    if ( startNode )
    {
      let range     = document.createRange()
      // Ci dessous, si on met '0', on sélectionne tout.
      // À mettre dans les options : soit on se place à la fin soit on
      // sélectionne tout
      range.setStart(startNode, realContents.length /* 0 */ )
      range.setEnd(endNode, realContents.length)
      let sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)
    }

    this.projet.mode_edition = true // C'est ça qui change les gestionnaires de keyup
    this.actualContents = String(this.contents)
  }
  // Sortir le champ contents du mode édition (et enregistrer
  // la nouvelle donnée si nécessaire)
  undoEdit (evt)
  {
    this.contentsHasChanged() && this.onChangeContents.bind(this)()
    this.endEdit()
  }

  /**
  * Sortir du champ contents en mode édition
  * Soit cette méthode est appelée par `undoEdit` lorsque l'édition a été
  * faite complètement, soit on passe directement ici pour une annulation de
  * l'édition avec ESCAPE.
  **/
  endEdit (evt)
  {
    this.divContents.contentEditable = 'false'
    this.divContents.innerHTML = this.contentsFormated
    this.panneau.select(this) // on le remet toujours en courant
    this.projet.mode_edition = false
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

}

module.exports = Parag
