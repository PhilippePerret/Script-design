/** ---------------------------------------------------------------------
  *   API Projet
  *
*** --------------------------------------------------------------------- */
/*

  Projet API
  ----------

*/

/** ---------------------------------------------------------------------
  *
  *   class Projet
  *   ------------
  *   Gestion générale du projet.
  *
*** --------------------------------------------------------------------- */
class Projet
{
  /**
  * Pour faire comme en ruby : Projet.new(<projet id>)
  **/
  static new (projet_id)
  {
    return new Projet(projet_id)
  }


  static get PANNEAU_LIST () {
    this._panneaulist || (this._panneaulist = ['data','personnages','notes','synopsis','scenier','treatment','manuscrit'])
    return this._panneaulist
  }
  // Liste des panneaux qui peuvent être synchronisés les uns avec les autres
  static get PANNEAUX_SYNC () {
    this._panneauxSync || this.resetPanneauxSync()
    return this._panneauxSync
  }
  /**
  * Détaché pour être utilisé par les tests
  **/
  static resetPanneauxSync ()
  {
    this._panneauxSync = ['notes','synopsis','scenier','treatment','manuscrit']
  }

  /**
  *
  * Données absolues des panneaux.
  * Pour obtenir ces données absolues, il suffit de faire :
  *
  *   projet.panneau(panneau_id).absData
  *
  * Voir le rappel N0008 sur ce qu'est un « panneau »
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0008
  **/
  static get PANNEAUX_DATA ()
  {
    this._panneauData || (
      this._panneauData = {
          'data'        : {synchronizable: false, oneLetter: 'd'/* pour relatives*/ }
        , 'd' : 'data'
        , 'manuscrit'   : {synchronizable: true, oneLetter: 'm'}
        , 'm' : 'manuscrit'
        , 'notes'       : {synchronizable: true, oneLetter: 'n'}
        , 'n' : 'notes'
        , 'personnages' : {synchronizable: false, oneLetter: 'p'}
        , 'p' : 'personnages'
        , 'scenier'     : {synchronizable: true, oneLetter: 's'}
        , 's' : 'scenier'
        , 'treatment'   : {synchronizable: true, oneLetter: 't'}
        , 't' : 'treatment'
        , 'synopsis'    : {synchronizable: true, oneLetter: 'y'}
        , 'y' : 'synopsis'
      }
    )
    return this._panneauData
  }

  /**
  * Appelée par le `tabulator des panneaux` pour ouvrir un ou plusieurs
  * panneaux.
  *
  * @param {Array} keys Liste des id-panneaux (< 2) définissant
  *                     le ou les panneaux à ouvrir.
  * @return {Promise} L'activation d'un panneau est une opération asynchrone
  *
  **/
  static activatePanneauByTabulator ( keys )
  {
    const curProj = this.current
    if ( keys.length == 1 )
    {
      return activatePanneau(keys[0]) // handy méthode
    }
    else
    {
      return curProj.activateDoublePanneaux(...keys)
    }
  }

  /**
  * @return {Number} un nouvel IDentifiant pour un projet
  * Utile seulement pour les tests, pour savoir si l'on parle bien
  * du même projet.
  **/
  static newID ()
  {
    this._lastid = this._lastid || 0
    this._lastid ++
    return this._lastid
  }


  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */

  constructor (projet_id)
  {
    this.id = projet_id
    this.__ID = Projet.newID()
  }

  /**
  * Charge le projet
  * ----------------
  * La méthode est appelée au chargement de la fenêtre
  * « Charger le projet » consiste à charger ses informations générales
  * (data) et à les afficher dans le panneau `data`.
  * Aucun `parag` n'est chargé à ce niveau du chargement du projet.
  **/
  PRload ()
  {
    const my = this

    return my.prepare()
      // .then( my.data.load.bind(my.data) )
      .then( my.brins.PRload.bind(my.brins)     )
      .then( my.options.PRload.bind(my.options) )
      .then( my.options.build.bind(my.options)  )
      .then( my.setupOptions.bind(my)           )
      .catch( err => { throw err }              )
  }

  /** ---------------------------------------------------------------------
    *
    *   Propriétés générales
    *
  *** --------------------------------------------------------------------- */

  /** Détermine si on se trouve en mode édition, c'est-à-dire dans un contenu
    * éditable. Ce mode détermine surtout l'action des raccourcis-clavier
    * à touche unique. Par exemple, `n` hors mode édition provoquera la
    * création d'un nouveau `parag` tandis qu'en mode édition il écrira
    * simplement la lettre 'n'.
  ***/
  get mode_edition () { return !!this._mode_edition }
  set mode_edition (v){ this._mode_edition = !!v }

  /**
  * @return {Function|Null} La méthode d'annulation courante (ou null)
  *
  * C'est la méthode qui sera interrogée par la combinaison CMD+Z pour
  * savoir si une cancellisation doit être exécutée.
  * Pour le moment, elle n'est implémentée que pour la suppression de
  * paragraphes.
  **/
  get cancelableMethod () { return this._cancelableMethod }
  set cancelableMethod (v){ this._cancelableMethod = v    }


  /**
  * @return {Boolean} true si le projet est modifié, false otherwise.
  * Le setter définit la variable et règle l'indicateur lumineux.
  **/
  get modified () { return this._modified || false }
  set modified (v)
  {
    this._modified = v
    if (v) { this.ui.setProjetModifed()     }
    else   { this.ui.setProjetUnmodified()  }
  }
  /**
  * @return {Boolean} true si le projet est en train de sauvegarder ses
  * informations.
  **/
  set saving (v) {
    this._saving = v
    if (v) { this.ui.setProjetSaving() }
  }

  /* --- publiques --- */

  /**
  * Demande l'affichage des statistiques du projet.
  * Ouvre le panneau spécial des statistiques et les calcule ou les actualise.
  * TODO Doit être implémenté.
  **/
  afficherStatistiques ()
  {
    alert("Pour le moment, je ne sais pas encore afficher les statistiques du projet.")
  }

  /**
  * Première étape du chargement du projet
  * Note : ce sont les données qui s'affichent toujours en premier, pour
  * le moment.
  * @return {Promise} Une promesse, le chargement étant asynchrone.
  **/
  prepare ()
  {
    this.current_panneau.PRactivate()
    this.ui.observeEditablesIn(document)
    return Promise.resolve()
  }

  /** ---------------------------------------------------------------------
    *
    *   méthodes PANNEAUX
    *
  *** --------------------------------------------------------------------- */

  /**
  * @return {PanProjet} Le panneau courant (qui est beaucoup plus qu'un panneau)
  * Par défaut, c'est le panneau des données générales du projet.
  **/
  get current_panneau () {
    this._current_panneau || ( this._current_panneau = this.panneaux['data'] )
    return this._current_panneau
  }
  /**
  * Définit le panneau courant
  * On change le z-index pour que ses éléments (par exemple le formulaire
  * de création des brins)
  **/
  set current_panneau (v) {
    this.current_panneau && (this.current_panneau.section.style.zIndex = 1)
    this._current_panneau = v
    this._current_panneau && (this._current_panneau.section.style.zIndex = 10)
  }

  panneau (pan_id) { return this.panneaux[pan_id] }
  get panneaux () {
    this._panneaux || this.definePanneauxAsInstances()
    return this._panneaux
  }

  /**
  * Crée toutes les instances panneaux pour le projet courant
  *
  **/
  definePanneauxAsInstances ()
  {
    let my = this
    my._panneaux = {}
    Projet.PANNEAU_LIST.forEach( (panid) => {
      my._panneaux[panid] = panid == 'data'
        ? new PanData(my)
        : new PanProjet(panid, my)
    })
  }

  /**
  * Méthode fonction passant en mode double panneau
  **/
  activateDoublePanneaux (pan1_id, pan2_id)
  {
    const my = this

    // Désactiver les panneaux courants (if any)
    return my.PRdesactiveAllCurrents()
    .then( () => {
      my._current_panneau     = my.panneau(pan2_id)
      my.alt_panneau          = my.panneau(pan1_id)

      my.mode_double_panneaux = true
      // Attention, cette propriété doit être réglée ici, APRÈS
      // `desactiveAllCurrents` qui la met à false.
    })
    .then( my.PRactivateRightPanneau.bind(my) )
    .then( my.PRactivateLeftPanneau.bind(my)  )
    .catch( err => { throw err } )
  }

  PRactivateRightPanneau ()
  {
    const my = this
    console.log("[PRactivateRightPanneau] my.current_panneau.id =", my.current_panneau.id )
    return my.current_panneau.PRactivate.call(my.current_panneau, {side: 'right'})
  }
  PRactivateLeftPanneau ()
  {
    const my = this
    console.log("[PRactivateLeftPanneau] my.alt_panneau.id =", my.alt_panneau.id )
    return my.alt_panneau.PRactivate.call(my.alt_panneau, {side: 'left'})
  }


  /**
  * Désactive le ou les panneaux affichés, en les repassant dans leur
  * mode normal (en mode double panneaux, ils sont rétrécis et placés à
  * gauche et à droite)
  **/
  PRdesactiveAllCurrents ()
  {
    const my = this
    if ( my.mode_double_panneaux )
    {
      my.mode_double_panneaux = false
      // Il faut absolument régler ici la valeur de mode_double_panneaux pour
      // que la désactivation prenne effectivement effet. Sinon, la méthode
      // PanProjet#PRhideCurrent() est court-circuité

      my.alt_panneau.unsetModeDouble()
      my.current_panneau.unsetModeDouble()
      return my.alt_panneau.PRdesactivate() // => {Promise}
    } else if (my.current_panneau ){
      // Note : normalement, il y a toujours un panneau courant
      return my.current_panneau.PRdesactivate()
    } else {
      return Promise.resolve()
    }
  }

  //
  //  FIN MÉTHODES PANNEAUX
  // ---------------------------------------------------------------------

  /**
  * Méthode qui prépare l'interface et le programme en fonction des options
  * choisies par l'auteur. Par exemple, c'est cette méthode qui met en route
  * la sauvegarde automatique si nécessaire.
  **/
  setupOptions ()
  {
    // console.log('-> Projet#setupOptions')
    if ( this.option('autosave') )
    {
      // console.log('   * activation de l’autosave')
      this.options.activateAutosave()
    }
    return Promise.resolve()
  }

  /**
   * Méthode appelée quand la sauvegarde automatique est enclenchée
   */
  doAutosave () {
    if ( this.mode_edition || this.busy ) { return false }
    this.modified && this.saveAll()
    return true
  }
  /**
  * Sauve tout
  * ----------
  *
  * Noter que l'appel de la sauvegarde des relatives et le check du nouvel
  * état du projet est inutile puisque ces deux méthodes sont appelées à
  * chaque sauvegarde de panneau. Et ici, normalement, il ne doit pas y
  * avoir plus de deux panneaux modifiés en même temps, en tout cas en
  * mode de sauvegarde automatique.
  **/
  saveAll ( callback )
  {
    const my = this
    my.saving = true
    my.saved  = false

    my.savingReporter = []
    // Permet d'enregistrer des messages de processus et notamment les
    // messages d'erreur. Les éléments sont des {Object}s qui contiennent au
    // minimum {type: 'error|notice', message: 'le message string'}
    // Ce reporter est inscrit à la fin de l'opération dans une fenêtre

    /*- Sauvegarde de tous les panneaux modifiés -*/
    return my.saveAllPanneaux()
      /*- Sauvegarde de tous les brins (si nécessaire) -*/
      .then( my.brins.PRsave.bind(my.brins) )
      /*- Sauvegarde de tous les parags (si nécessaire) -*/
      .then( my.saveParags.bind(my) )
      /*- Sauvegarde des relatives (si nécessaire) */
      .then( my.saveRelatives.bind(my) )
      .then( () => {
        // console.log("= Fin de l'enregistrement de tous les éléments.")
        my.saving   = false
        my.saved    = true
        my.modified = false
        if ( my.savingReporter.length ) { my.afficheSavingReporter() }
        return Promise.resolve()
      })
      .catch( (err) => { throw err } )

  }

  /**
  * Affiche le reporter de sauvegarde
  *
  * Pour le moment, je mets juste une alerte disant de regarder en console.
  **/
  afficheSavingReporter ()
  {
    console.log("RAPPORT D'ERREUR AU COURS DE LA SAUVEGARDE")
    console.log(this.savingReporter)
    alert("Des erreurs sont survenues pendant la sauvegarde, merci de consulter la console (CMD + i)")
  }

  /**
  * Sauvegarde de tous les panneaux modifiés (et seulement les panneaux
  * modifiés, sauf si +all+ est true)
  *
  * @return {Promise}
  **/
  saveAllPanneaux ( all )
  {
    const my = this
    let panos_modified = []
    Projet.PANNEAU_LIST.forEach( (pan_id) => {
      ;( all || my.panneau(pan_id)._modified ) && panos_modified.push( my.panneau(pan_id) )
      // Attention = si on met une ligne de code avant ce ( all || ... ) il
      // faut impérativement la terminer par un ';' pour que JS ne croie pas
      // qu'il s'agit d'une fonction
    })
    return Promise.all( panos_modified.map( pan => { return pan.save.call(pan) } ) )

  }

  /**
  * Raccourci pour l'enregistrement des relatives
  *
  * @return {Promise}
  **/
  saveRelatives ()
  {
    // console.log("* Enregistrement des relatives")
    return this.relatives.save.bind(this.relatives).call()
  }

  /** ---------------------------------------------------------------------
    *
    *     NOUVELLES MÉTHODES D'ENREGISTREMENT ET DE SAUVEGARDE
    *
    *
    *     Cf. le fichier Sauvegarde_length_fixe.md pour le détail
    *
  *** --------------------------------------------------------------------- */

  /**
  * Enregistre tous les paragraphes modifiés
  *
  * @param {Boolean} all  Si true, on enregistre tous les parags
  *
  * @return {Promise} Pour pouvoir chainer l'enregistrement
  **/
  saveParags ( all )
  {
    const my = this
    // console.log("* Enregistrement des Parags")
    let modified_parags = []
    Parags.items/*{Map}*/.forEach( (parag, pid) => {
      ;/*(1)*/( all || parag.modified ) && modified_parags.push(parag)
      // (1) Ce ';' est obligatoire car sinon, le programme comprend
      // ça : `console.log(...)(all || parag.modified)`
    })
    my.saved_parags_count = modified_parags.length
    // console.log("= Nombre de parags à sauver : %d", my.saved_parags_count)
    return Promise.all( modified_parags.map( p => {
      // console.log("Je sauve le paragraphe #",p.id)
      return p.save()
    }))
  }


  /**
  * Méthode appelée quand on change de donnée par l'interface
  **/
  onChangeData (o)
  {
    let
          prop      = o.id // par exemple 'authors' ou 'title'
        , newValue  = o.innerHTML.trim()
        , owner     = this
        , ownerStr  = 'Projet'

    if (o.getAttribute('owner'))
    {
      // <= Le champ à un propriétaire propre, qui n'est pas le projet
      // => Il faut utiliser ses méthodes pour actualiser la donnée
      ownerStr  = o.getAttribute('owner')
      owner     = eval(ownerStr)

    }
    else
    {
      // <= L'objet n'a pas de propriétaire propre
      // => C'est une propriété du projet courant
      // Traitement des valeurs pour certains champs spéciaux
      switch(prop)
      {
        case 'authors':
          newValue = newValue.split(/[ ,]/).map(p =>{return p.trim()}).filter(p => {return p != ''})
          break
      }
      this.data[prop] = newValue // dans PanData (panneau('data'))
    }

    // On enregistre la donnée et on l'actualise dans l'affichage
    // pour le Projet comme pour tout autre propriétaire défini dans l'attribut
    // `owner` du champ.
    let methode = `redefine_${prop}`
    if ( 'function' === typeof owner[methode] ) {
      owner[methode](newValue)
    } else {
      throw new Error(`Il faut implémenter la méthode ${ownerStr}#${methode} pour pouvoir éditer la propriété de l'objet.`)
    }


  }

  /**
  * @return {Relatives} L'instance gérant les relatives du projet
  * Les relatives, ce sont les relations entre les différents parags entre
  * les différents panneaux. Par exemple, ce sont les relatives qui permettent
  * de savoir que tels paragraphes du scénier correspondent à tel paragraphe
  * du synopsis
  **/
  get relatives ()
  {
    this._relatives || ( this._relatives = new Relatives(this) )
    return this._relatives
  }
  get options ()
  {
    this._options || ( this._options = new ProjetOptions(this) )
    return this._options
  }
  get ui ()
  {
    this._ui || ( this._ui = new ProjetUI(this) )
    return this._ui
  }

  /**
  * Object pour la gestion des brins du projet
  **/
  get brins ()
  {
    this._brins || ( this._brins = new Brins(this) )
    return this._brins
  }

  /**
  * @property {PanData} Le panneau 'data', qui s'occupe des données
  * générales du projet.
  **/
  get data ()
  {
    this._data || ( this._data = this.panneau('data') )
    return this._data
  }

  // ----------------- OPTIONS ---------------------

  /**
  * Raccourci servant au tabulator (car on ne peut pas utiliser `projet.options`
  * dans le départ)
  **/
  define_options ( arg ) { this.options.define( arg ) }

  option ( prop, value )
  {
    if ( 'string' == typeof prop )
    {
      if ( undefined === value ) { return this.options.get(prop) }
      else {
        let h = {} ; h[prop] = value ; this.options.set(h)
      }
    }
    else if ( 'object' == typeof prop )
    {
      this.options.set(prop)
    }
    else
    {
      throw new Error('Mauvais argument pour projet#option')
    }
  }

  /**
  * Méthode qui enregistre et affiche le titre. Si @new_title est défini, elle
  * enregistre le nouveau titre. Sinon, elle l'affiche (dans la barre de titre et
  * dans le document)
  *
  * Noter que le nom de ces méthodes ne doivent pas être modifiée, car elles
  * sont appelées de façon dynamique en construisant "redefine_<propriété>"
  *
  **/
  redefine_title (v) {
    v || ( v = "Projet sans titre")
    if ( v != this.data.title ) this.data.title = v
    DOM.setTitle(v)
    DOM.inner('title', v)
  }
  redefine_authors (v) {
    v || ( v = ['pas d’auteur'])
    if ( v != this.data.authors ) this.data.authors = v
    DOM.inner('authors', (v||[]).join(', '))
  }
  redefine_summary (v) {
    v || ( v = 'Projet sans résumé' )
    if ( v != this.data.summary ) this.data.summary = v
    DOM.inner('summary', (v||'').split("\n").join('<br>'))
  }
  redefine_created_at(){
    let c = moment(this.created_at)
    DOM.inner('created_at', `${c.format('LLL')} (${c.fromNow()})`)
  }

  /**
  * @return {String} Le path du fichier TEXT contenant tous les paragraphes
  * en longueur fixe.
  **/
  get parags_file_path ()
  {
    this._parags_file_path || (this._parags_file_path = path.join(Store.user_data_folder,'projets',this.id,'PARAGS.txt'))
    return this._parags_file_path
  }

  /**
  * @return {String} Le dossier du projet dans les librairies.
  * Normalement, on ne doit pas y avoir accès, mais pour des raisons de
  * programmation, on permet de l'ouvrir avec une commande.
  **/
  get folder ()
  {
    this._folder || ( this._folder = this.data.store.folder )
    return this._folder
  }

  // Raccourcis
  get title       ()  {return this.data.title  || "Projet sans titre"}
  get authors     ()  {return this.data.authors || [] }
  get summary     ()  {return this.data.summary || '[Résumé à définir]'}
  get created_at  ()  {return this.data.created_at}
  get updated_at  ()  {return this.data.updated_at}


}// fin class Projet

module.exports = Projet
