/*

  Utilitaire pour transformer des document Markdown/Kramdown en
  fichier HTML.

  Permet, en plus, de construire les tables de matières

  Pour ne pas mettre de table des matières : options => no_toc = true
  Par exemple :

      Kramdown.file('mon/fichier.md', {no_toc: true})

      Kramdown.parse('<code markdown>'[, <options>])
      // => retourne le code HTML

  Options
  -------

      no_toc        (false par défaut) Si true, on n'ajoute pas la table
                    des matières.

      returnInnerTOC

                    Si true, l'intérieur de la table des matières est retourné
                    au lieu d'être inscrit dans le document.
                    Cela permet de rassembler la table des matières de plusieurs
                    fichiers markdown.
                    Pour les assembler en gardant le style, mettre les
                    différents retours dans une liste et les envoyer à
                    Kramdown.assembleTocs([...liste inners toc...]) qui retourne
                    la table des matières finale.

      returnTOC
                    Retourne la table des matières complète au lieu de
                    l'inscrire dans le code retourné.


      maxLevel      Niveau maximum pour la table des matières. Correspond au
                    nombre de dièses. Tous les titres au-dessus de ce chiffre
                    (3 par défaut) seront ignorés.

  Chargement
  ----------

  requirejs(
    ['path/to/module'],
    (Kramdown) => {
      ... utiliser ...
    }
  )

  En dehors de requirejs :

  let Kramdown
  requirejs(['path/to/kramdown.js'],(K)=>{Kramdown = K})

  ... utiliser Kramdown

*/
const
    kramed  = require('kramed')
  , path    = require('path')
  , fs      = require('fs')
  // , Str     = require(path.join('.','lib','utils','String.js'))
  , Str     = require('./String')

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
  get withTOC () {
    return
          !this.options.no_toc
      &&  !this.options.returnToc
      &&  !this.options.returnInnerToc
  }
  get returnTOC () { return true === this.options.returnTOC }
  get returnInnerTOC () { return true === this.options.returnInnerTOC}

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
    if ( this.returnInnerTOC )
    {
      // => S'il faut retourner l'intérieur de la table des matières
      return [code, this.innerTOC() ]
    }
    else if ( this.returnTOC )
    {
      // => S'il faut retourner la table des matières entière
      return [code, this.tocHTML() ]
    }
    else
    {
      // => Cas normal du retour du code
      return code
    }
  }

  /**
  *   @return le code HTML de la table des matières du document
  *
  * @note On ne prend les titres que jusqu'au level this.options.maxLevel
  **/
  tocHTML ()
  {
    return Kramdown.compileTocs([this.innerTOC()])
  }
  innerTOC ()
  {
    let html = ''
    this.titleList.map( (htitle) => {
      if ( htitle.level > this.options.maxLevel ) { return }
      html += `<li class="kramed-toc-item lev${htitle.level}"><a href="#${htitle.ancre}">${htitle.titre}</a></li>`
    })
    return html
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
    return k.toHTML() // soit code seul soit [code, innerHTML]
  }
  static assembleTocs ( tocs, options )
  {
    if ( undefined === options ) { options = {} }
    return `<ul id="${options.id}" class="kramed-toc">${tocs.join('')}</ul>`
  }

  static parse(code, options)
  {
    let k = new Kramdown({code: code}, options)
    return k.toHTML()
  }
}


module.exports = Kramdown
