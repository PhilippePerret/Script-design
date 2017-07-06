let moment = require('moment')

define(
  [],
  () => {

    /** ---------------------------------------------------------------------
      *   class PanProjet
      *   ---------------
      *   Un panneau est bien plus qu'un panneau. Il gère aussi un élément
      *   complet du projet comme le scénier, le synopsis ou le manuscrit.
      *   C'est par lui que passe la sauvegarde, il est associé à un fichier
      *   JSON qui contient toutes ses données, même ses préférences.
      *
    *** --------------------------------------------------------------------- */

    class PanProjet
    {
      constructor (name)
      {
        this.id     = name
        this.name   = name // p.e. 'data', ou 'scenier'
        // Mis à true quand le panneau est le panneau courant. Sert notamment à
        // savoir si des actualisations se font "par derrière" et donc ne doivent
        // pas être reflétées dans le panneau.
        this.actif  = false
      }

      /* --- Public --- */
      print ()
      {
        alert("Pour le moment, je ne sais pas encore imprimer un panneau.")
      }

      export ()
      {
        alert("Pour le moment, je ne sais pas encore exporter un panneau.")
      }

      synchronize ()
      {
        alert("Pour le moment, je ne sais pas encore synchroniser un panneau.")
      }

      cutParagByReturn ()
      {
        return alert("Pour le moment, on ne peut pas découper les parags suivant les retours chariot")
        if(!confirm("Voulez-vous vraiment découper les parags suivant les retours-chariot.\n\nDès qu'un parag contient un retour-chariot, on le découpe en plusieurs Parags séparés (mais héritant des mêmes propriétés)"))
      }
      /** ---------------------------------------------------------------------
        *
        *   DATA
        *
      *** --------------------------------------------------------------------- */

      /**
      * @return {Projet} Le projet courant (raccourci)
      **/
      get projet ()
      {
        if ( undefined === this._projet ) { this._projet = Projet.current }
        return this._projet
      }

      /**
      * Méthode ajoutant un paragraphe au pan-projet courant, par exemple au
      * synopsis ou au scénier.
      *
      * @param {Parag}  parag Le nouveau paragraphe (ici, une instance)
      * @param {Object} options
      *                     edit      Si true, le paragraphe est aussitôt mis en
      *                               édition.
      *
      * Note : on observe aussi ce paragraphe.
      **/
      addParag (iparag, options)
      {
        if(undefined===options){options={}}
        // On doit l'afficher
        // TODO pour le moment, on ajoute le paragraphe à la fin du conteneur mais
        // plus tard on pourra le mettre à un endroit précis.
        let div = iparag.mainDiv
        this.container.appendChild(div)
        if (true === options.edited){
          iparag.edit()
        } else if (true === options.current){
          Parag.setCurrent(iparag)
        } else if (true === options.selected){
          iparag.select()
        }

      }

      /**
      * Pour activer/désactiver le panneau, c'est-à-dire le mettre en panneau
      * courant, affiché dans l'interface.
      **/
      activate () {
        if ( ! this.loaded ) { this.load() }
        DOM.addClass(`panneau-${this.id}`,'actif')
        this.actif = true
      }
      desactivate () {
        DOM.removeClass(`panneau-${this.id}`,'actif')
        this.actif = false
      }

      /**
      * Élément principal du pan-projet contenant tous les éléments {Parag}
      *
      * @return {HTMLElement} Le container dans le DOM des éléments du pan-projet
      **/
      get container () {
        if (undefined===this._container){this._container=DOM.get(`panneau-${this.id}-contents`)}
        return this._container
      }
      /**
      * @return {HTML} La section complète du panneau
      **/
      get section ()
      {
        if ( !this._section ) { this._section = DOM.get(`panneau-${this.name}`) }
        return this._section
      }

      /** ---------------------------------------------------------------------
        *
        *   Méthodes interface
        *
      *** --------------------------------------------------------------------- */
      get modified () { return this._modified }
      set modified (v)
      {
        this._modified = !!v
        this.light.innerHTML = this._modified ? '🔴' : '🔵'
      }
      get light () {
        if ( ! this._light )
        {
          this._light = this.section.getElementsByClassName('statelight')[0]
        }
        return this._light
      }

      setModeDouble (cote)
      {
        DOM.addClass(this.section, `modedbl${cote}`)
      }
      unsetModeDouble ()
      {
        DOM.removeClass(this.section, `modedblleft`)
        DOM.removeClass(this.section, `modedblright`)
      }

      /** ---------------------------------------------------------------------
        *
        *   Méthodes préférences
        *
      *** --------------------------------------------------------------------- */

      // Les préférences. Pour le moment, rien
      get prefs () { return this._prefs }
      set prefs (v){ this._prefs = v    }

      /** ---------------------------------------------------------------------
        *
        *   Méthodes DATA
        *
      *** --------------------------------------------------------------------- */

      /**
      * Procède au chargement des données de ce panneau/élément narratif
      **/
      load ()
      {
        let my = this
        my.data = my.store.data
        for( let prop in my.data ) {
          my[prop] = my.data[prop]
        }
        // S'il y a des paragraphes, il faut les afficher
        // Attention, ici, on ne peut pas faire `this.parags`, car cette méthode
        // relève les parags dans l'interface (pour enregistrement) et, pour le
        // moment, il n'y en a pas.
        if ( this._hparags ) { this.displayParags() }
        this.loaded = true
      }
      /**
      * Procède à la sauvegarde des données actuelles
      **/
      save ()
      {
        if ( ! this.modified )
        {
          alert(`Le panneau ${this.projet.id}/${this.name} n'est pas marqué modifié, normalement, je ne devrais pas avoir à le sauver.`)
        }
        let resultat_save = this.store.set(this.data2save)
        if ( resultat_save ) {
          // Si nécessaire, on procède à la sauvegarde des relatives
          if ( this.projet.relatives.modified )
          {
            this.projet.relatives.save()
          }
          this.setAllParagsUnmodified()
          this.modified = false
        }
      }

      /**
      * @return {Object} La table des données à sauver
      **/
      get data2save ()
      {
        let now = moment().format()
        return {
            name        : this.name
          , prefs       : this.prefs
          , parags      : this.parags_as_data
          , updated_at  : now
          , created_at  : this.created_at || now
        }
      }

      /**
      * @return {Object} Les données par défaut pour le panneau. C'est celle qui
      * sont transmises à l'instanciation du store du panneau.
      **/
      get defaultData () {
        return {
            name    : this.name
          , id      : this.name
          , prefs   : this.prefs
          , parags  : []
        }
      }

      /**
      * Méthode qui après la sauvegarde marque toutes les paragraphes
      * comme non modifiés
      **/
      setAllParagsUnmodified ()
      {
        this.parags.forEach( p => p.modified = false )
      }
      /**
      * @return {Array} Une liste des Parags tels qu'il faut les enregistrer
      * dans le fichier JSON de données
      **/
      get parags_as_data ()
      {
        return this.parags.map( p => p.as_data )
      }

      /**
      * @return {Array} of {Parag} La liste des Parags tels qu'ils se présentend
      * dans le container de ce tableau.
      * Noter que la liste est actualisée chaque fois qu'on appelle la méthode.
      **/
      get parags ()
      {
        let
              arr = []
            , ps = this.container.getElementsByClassName('p')
            , nb = ps.length
            , i  = 0

        for(; i < nb ; ++i ){
          arr.push( Parags.get(Number(ps[i].getAttribute('data-id'))) )
        }
        return arr
      }

      /**
      * Méthode appelée au chargement du panneau (`load`) qui permet d'écrire les
      * paragraphes.
      **/
      set parags ( hparags )
      {
        this._hparags = hparags
      }
      /**
      * Méthode appelée après le load, permettant d'afficher les paragraphes
      * courants.
      **/
      displayParags ()
      {
        this.container.innerHTML = ''
        this._hparags.forEach( hparag => Projet.current_panneau.addParag( new Parag( hparag ) ) )
      }

      /**
      * @return {Store} L'instance store qui va permettre d'enregistrer les
      * données du panneau.
      **/
      get store ()
      {
        if ( undefined === this._store )
        {
          this._store = new Store(this.store_path, this.defaultData)
        }
        return this._store
      }
      /**
      * @return {String} Le path du fichier JSON contenant les données du panneau
      **/
      get store_path ()
      {
        if ( undefined === this._store_path )
        {
          this._store_path = path.join('projets',this.projet.id,this.name)
        }
        return this._store_path
      }

    }// /fin class PanProjet

    return PanProjet
  }
)
