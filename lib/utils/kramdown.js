/*

  Utilitaire pour transformer des document Markdown/Kramdown en
  fichier HTML.

  Permet, en plus, de construire les tables de matières

  Pour ne pas mettre de table des matières : options => no_toc = true
  Par exemple :

      Kramdown.file('mon/fichier.md', {no_toc: true})

  Options
  -------

      no_toc        (false par défaut) Si true, on n'ajoute pas la table
                    des matières.

      maxLevel      Niveau maximum pour la table des matières. Correspond au
                    nombre de dièses. Tous les titres au-dessus de ce chiffre
                    (3 par défaut) seront ignorés.

*/
const
    kramed  = require('kramed')
  , fs      = require('fs')


define(
  [
      './String.js'
  ],
  function(
      Str
  ){

    String.prototype.scan = Str.scan

    class Kramdown
    {

      /** ---------------------------------------------------------------------
        *
        *   INSTANCE
        *
      *** --------------------------------------------------------------------- */
      constructor (data, options)
      {
        this.data     = data
        this.options  = options || {}
        // === Options par défaut ===
        if ( undefined === this.options.maxLevel )
        { this.options.maxLevel = 3 }
      }
      get md_code ()
      {
        if ( undefined === this._md_code )
        {
          if ( this.data.code ) { this._md_code = this.data.code }
          else if (this.data.path) {
            this._md_code = fs.readFileSync(this.data.path, {encoding:'utf8'})
          }
          else { throw "Impossible d'obtenir le code fourni" }
        }
        return this._md_code
      }
      get withTOC () { return ! ( true === this.options.no_toc )}

      /**
      *   Grande méthode transformant le document Markdown/Kramdown en
      *   code HTML, avec table des matières si nécessaire.
      **/
      toHTML ()
      {
        // kramed.setOptions({
        //   highlight: function (code) {
        //     return require('highlight.js').highlightAuto(code).value
        //   }
        //   , gfm:    true
        //   , tables: true
        // })
        let code = ''
        if ( this.withTOC ) { code += this.tocHTML() }
        code += kramed(this.md_code)
        return code
      }

      /**
      *   @return le code HTML de la table des matières du document
      *
      * @note On ne prend les titres que jusqu'au level this.options.maxLevel
      **/
      tocHTML ()
      {
        let html = ''
        this.titleList.map( (htitle) => {
          if ( htitle.level > this.options.maxLevel ) { return }
          html += `<li class="kramed-toc-item lev${htitle.level}"><a href="#${htitle.ancre}">${htitle.titre}</a></li>`
        })
        return `<ul class="kramed-toc">${html}</ul>`
      }

      /**
      *  @return les data de table des matières sous la forme d'une liste
      *           contenant { :titre, :level, :ancre }
      **/
      get titleList ()
      {
        if ( undefined === this._titleList )
        {
          this._titleList = []
          let re  = /(#{1,6})(.*?)\{#([a-z_-]*?)\}/g
          let res = this.md_code.scan(re)
          res.map( (arr) => {
            this._titleList.push({
                titre: arr[1].trim()
              , level: arr[0].trim().length
              , ancre: arr[2].trim()
            })
          })
        }
        return this._titleList
      }

      /** ---------------------------------------------------------------------
        *
        *   CLASSE
        *
      *** --------------------------------------------------------------------- */

      // Kramdown le fichier de path +path+ avec les options +options+
      static file (path, options)
      {
        let k = new Kramdown({path: path}, options)
        return k.toHTML()
      }

      static parse(code, options)
      {
        let k = new Kramdown({code: code}, options)
        return k.toHTML()
      }
    }

    return Kramdown
  }
)
