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
  static new (projet_id )
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
  *
  * Pour obtenir ces données absolues, il suffit de faire :
  *
  *   projet.panneau(panneau_id).absData
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

  static UIprepare ()
  {

  }

  /**
  *   Chargement du projet data.projet_id
  *
  * La méthode regarde aussi s'il y a d'autres choses à faire, comme mettre
  * en route la boucle de sauvegarde en fonction des options.
  * TODO Plus tard, on pourra aussi avoir des notes à rappeler à l'ouverture,
  * par exemple.
  **/
  static load (data)
  {
    this.current = new Projet(data.projet_id)
    this.current.prepare()
  }

  /**
  * Méthode appelée par le tabulator des panneaux pour ouvrir un ou plusieurs
  * panneaux
  *
  * @param {Array} keys Liste des id-panneaux (un ou deux seulement) définissant
  *                     le ou les panneaux à ouvrir.
  **/
  static activatePanneauByTabulator ( keys )
  {
    const curProj = this.current
    if ( keys.length == 1 )
    {
      activatePanneau(keys[0]) // handy méthode
    }
    else
    {
      curProj.activateDoublePanneaux(...keys)
    }
  }

  static newID ()
  {
    this._lastid || ( this._lastid = 0 )
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

  /** ---------------------------------------------------------------------
    *
    *   Propriétés générales
    *
  *** --------------------------------------------------------------------- */

  // Détermine si on se trouve en mode édition, c'est-à-dire dans un contenu
  // éditable. Ce mode détermine surtout l'action des raccourcis-clavier
  // uno-touche.
  get mode_edition () { return !!this._mode_edition }
  set mode_edition (v){ this._mode_edition = !!v }

  /**
  * La méthode d'annulation courante du projet.
  *
  * C'est la méthode qui sera interrogée par la combinaison CMD+Z pour
  * savoir si une cancellisation doit être exécutée.
  * Pour le moment, elle n'est implémentée que pour la suppression de
  * paragraphes.
  **/
  get cancelableMethod () { return this._cancelableMethod }
  set cancelableMethod (v){ this._cancelableMethod = v    }


  get modified () { return this._modified || false }
  set modified (v)
  {
    this._modified = v
    if (v) { this.ui.setProjetModifed()     }
    else   { this.ui.setProjetUnmodified()  }
  }
  set saving (v) {
    this._saving = v
    if (v) { this.ui.setProjetSaving() }
  }

  /**
  * Méthode appelée après chaque sauvegarde de panneau (ou autre) qui
  * vérifie l'état de sauvegarde du projet en général.
  * C'est également la méthode qui est appelée par la boucle de sauvegarde
  * automatique.
  * Noter que cette méthode ne fait rien d'autre, en soi, que vérifier l'état
  * général et de régler l'indicateur de sauvegarde dans l'interface.
  **/
  checkModifiedState ()
  {
    let my  = this
      , mod = false // Sera mis à true si on trouve quelque chose modifié
    Projet.PANNEAU_LIST.forEach( (pan_id) => {
      my.panneau(pan_id).modified && ( mod = true )
    })
    my.modified = mod // changera l'indicateur de sauvegarde
  }

  /* --- publiques --- */

  afficherStatistiques ()
  {
    alert("Pour le moment, je ne sais pas encore afficher les statistiques du projet.")
  }

  /**
  * Chargement du projet
  * Note : ce sont les données qui s'affichent toujours en premier, pour
  * le moment.
  **/
  prepare ()
  {
    const my = this
    my.current_panneau.PRactivate()
    my.ui.observeEditablesIn(document)
    my.options.load(my.prepareSuivantOptions.bind(my))
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
  set current_panneau (v) { this._current_panneau = v }

  panneau (pan_id) {
    return this.panneaux[pan_id]
  }
  get panneaux () {
    this._panneaux || this.definePanneauxAsInstances()
    return this._panneaux
  }

  // Crée les instances panneaux pour le projet courant
  definePanneauxAsInstances ()
  {
    let my = this
    // my._panneaux = {}
    // Pour la transition de Projet.panneaux à projet.panneaux
    my._panneaux = {}
    Projet.PANNEAU_LIST.forEach( (panid) => {
      if ( panid === 'data')
      {
        my._panneaux[panid] = new PanData(my)
      }
      else
      {
        my._panneaux[panid] = new PanProjet(panid, my)
      }
    })
  }

  /**
  * Méthode fonctionnelle chargeant le plateau voulu
  **/
  activatePanneau (panneau_id, evt)
  {
    const my = this
    // console.log(`-> Projet#loadPanneau(${panneau_id})`)

    my.desactiveAllCurrents()
    // Si on était en mode double panneau, il faut en sortir, même
    // si on va y revenir tout de suite

    my.current_panneau = my.panneau(panneau_id)
    my.current_panneau.activate()
    my.mode_double_panneaux = false

    // console.log("<- #activatePanneau %s", panneau_id)
  }



  /**
  * Méthode fonction passant en mode double panneau
  **/
  activateDoublePanneaux (pan1_id, pan2_id)
  {
    const my = this
    // Désactiver les panneaux courants (if any)
    my.desactiveAllCurrents()

    my._current_panneau = curProj.panneau(pan2_id)
    my.current_panneau.activate()
    my.current_panneau.setModeDouble('right')

    my.alt_panneau = curProj.panneau(pan1_id)
    my.alt_panneau.activate()
    my.alt_panneau.setModeDouble('left')

    my.mode_double_panneaux = true
  }


  /**
  * Désactive le ou les panneaux affichés, en les repassant dans leur
  * mode normal (en mode double panneaux, ils sont rétrécis et placés à
  * gauche et à droite)
  **/
  desactiveAllCurrents ()
  {
    const my = this
    if ( my.mode_double_panneaux )
    {
      my.alt_panneau.desactivate()
      my.alt_panneau.unsetModeDouble()
      my.current_panneau.unsetModeDouble()
    }
    my.current_panneau && my.current_panneau.desactivate()
  }

  //
  //  FIN MÉTHODES PANNEAUX
  // ---------------------------------------------------------------------

  /**
  * Méthode qui prépare l'interface et le programme en fonction des options
  * choisies par l'auteur. Par exemple, c'est cette méthode qui met en route
  * la sauvegarde automatique si nécessaire.
  **/
  prepareSuivantOptions ()
  {
    // console.log('-> Projet#prepareSuivantOptions')
    if ( this.option('autosave') )
    {
      console.log('   * activation de l’autosave')
      this.options.activateAutosave()
    }
    // console.log('<- Projet#prepareSuivantOptions')
  }

  /**
   * Méthode appelée quand la sauvegarde automatique est enclenchée
   */
  doAutosave () {
    if ( this.mode_edition || this.busy ) { return false }
    this.checkModifiedState()
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
      /*- Sauvegarde de tous les parags -*/
      .then( my.saveParags.bind(my) )
      .then( my.saveRelatives.bind(my) )
      .then( () => {
        my.saving = false
        my.saved  = true
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
      ( all || my.panneau(pan_id)._modified ) && panos_modified.push( my.panneau(pan_id) )
      // Attention = si on met une ligne de code avant ce ( all || ... ) il
      // faut impérativement la terminer par un ';' pour que JS ne croie pas
      // qu'il s'agit d'une fonction
    })
    return Promise.all( panos_modified.map( p => { return p.save.bind(p).call() } ) )
  }

  /**
  * Raccourci pour l'enregistrement des relatives
  *
  * @return {Promise}
  **/
  saveRelatives ()
  {
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
    let modified_parags = []
    for (let pid in Parags.items )
    {
      if ( Parags.items.hasOwnProperty(pid) ) {
        let parag = Parags.get(pid) ; // ATTENTION ";" obligatoire !
        ( all || parag.modified ) && ( modified_parags.push( parag ) )
      }
    }
    my.saved_parags_count = modified_parags.length
    return Promise.all( modified_parags.map( p => { return p.save() } ))
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
