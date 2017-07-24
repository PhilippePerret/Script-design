let path  = require('path')
let fs    = require('fs')
require('../lib/utils/String_class')// extensions de la classe String
//
// let arr =[
//     "Ça c’est l'été"
//   , "Une beaucoup plus grande phrase avec peu d’unicode pour voir la différence !"
// ].forEach( (t) => {
//   let tUnicode = t.toUnicode()
//   console.log("toUnicode", tUnicode)
//   console.log("T unicode parsé par JSON", JSON.parse(`"${tUnicode}"`))
//   let tHex = new Buffer(t).toString('hex')
//   console.log("Hexa ", tHex)
//   console.log(`Longueur Unicode: ${tUnicode.length} - Hexa : ${tHex.length}`)
//
// })
//
//


class Parag
{
  static get dataLengthInFile () { return 512 }
  constructor ( data )
  {
    this.id = data.id
    if (data.contents) { this.contents = data.contents }

  }
  get posStart () { return this.id * Parag.dataLengthInFile }
  get contents () { return this._contents }
  set contents (v){
    this._contents = v
    // Quand on définit le contenu du paragraphe, si son contenu unicodé
    // n'est pas défini, on le défini (ou alors, on réserve ça à l'enregistrement)
    if ( ! this._unicode_contents )
    {
      this._unicode_contents = this._contents.toUnicode() // ma librairie
    }
  }
  get dataline_infile () {
    if ( undefined === this._dataline_infile ) {
      let c, dif, suf

      // c = this._unicode_contents.replace(/\u/,'_U_')
      // dif = Parag.dataLengthInFile - c.length
      // console.log("Dif sans \\u",dif)
      // suf = ''
      // for(let i=0; i<dif;++i){suf += ' '}
      // this._dataline_infile = suf + c
      // console.log("Longueur data sans \\u", this._dataline_infile.length)
      // console.log("Dif avec \\u",dif)

      //
      dif = (Parag.dataLengthInFile - this._unicode_contents.length)
      if ( dif < 0 )
      {
        console.log("Une donnée est trop longue, il faudrait la checker mieux.")
        this._dataline_infile = this._unicode_contents.substring(0, Parag.dataLengthInFile)
      }
      else
      {
        suf = ''
        for(let i=0; i<dif;++i){suf += ' '}
        this._dataline_infile = suf + this._unicode_contents
        if (this._dataline_infile.length !== Parag.dataLengthInFile)
        {
          console.log("this.contents erroné :", this.contents)
          console.log("this._unicode_contents erroné :", this._unicode_contents)
          console.log('Longueur de this._unicode_contents', this._unicode_contents.length)
          console.log("\n\n\n")
          setTimeout( () => {
            throw new Error(`ERREUR DE LONGUEUR DE DONNÉE avec le parag#${this.id}. Attendu: ${Parag.dataLengthInFile} / Obtenu: ${this._dataline_infile.length}`)
          }, 2000)
        }
      }
    }
    return this._dataline_infile
  }
  parse_data_infile ( rawdata )
  {
    console.log(`Je vais parser les données de #${this.id}`)
    this._contents = JSON.parse(`"${rawdata.trim()}"`)
    console.log('this._contents',this._contents)
  }
}
class Parags
{
  static get ( pid )
  {
    // Ne rien faire ici
  }
  /**
  * On définit la liste des paragraphes à sauver
  **/
  defineListeParagsToSave ()
  {
    this.liste_parags_to_save = []
    const Words = [
      'l’été', 'le manège', 'le sacrilège', 'le consor', 'le sacrifice',
      'la chaise', 'la leçon'
    ]
    const Verbs = [
      'prendrait', 'viendrait', 'arrivait', 'sacralisait','prévenait',
      'montait', 'amendait', 'étayait'
    ]
    const Pronums = [
      'il', 'elle', 'nos', 'ces', 'ça', 'nous'
    ]
    const specs = ['à','ç','Ç','é','è','…', 'ï', 'Ï', 'î', 'ñ', '∞', '~','«', ' ']
    let c = ''
    for(let i = 100; i >= 0; --i){
      c = ''
      while (c.length < 255) {
        c += (Words[Math.floor(i)] || Words[Math.floor(i/10)] || 'païen') + ' '
        c += (Verbs[Math.floor(i)] || Verbs[Math.floor(i/10)] || 'agaçait') + ' '
        c += (Pronums[Math.floor(i)] || Pronums[Math.floor(i/10)] || 'ça') + ' '
      }
      this.liste_parags_to_save.push(new Parag({id:i, contents: c.trim()}))
    }
  }
  get parags_file_path () {
    return './monfichier.txt'
  }
  writeParags ()
  {
    this.defineListeParagsToSave()

    fs.open(this.parags_file_path, 'w', (err, filedescriptor) => {
      if ( err ) {
        console.log("Une erreur est survenue, je dois renoncer à l'enregistrement :", err)
        throw err
      }
      this.writeNextParag(filedescriptor)
    })

  }
  writeNextParag (fd)
  {
    let iparag = this.liste_parags_to_save.shift()
    if ( iparag )
    {
      this.writeParag(fd, iparag)
    }
    else
    {
      console.log("=== Tous les paragraphes ont été sauvés. ===")
    }
  }
  writeParag( fd, iparag )
  {
    console.log("On va copier à ", iparag.posStart)
    const my = this
    fs.write(fd, iparag.dataline_infile, iparag.posStart, 'utf8', (err, sizew, writen) => {
      if (err){ throw err }
      console.log("Longueur copiée dans le fichier", sizew)
      my.writeNextParag(fd)
    })
  }

  /**
  * Méthode principale qui charge la liste des parags définis dans
  * +ids+, en fait des instances ou les renseigne en lisant le fichier
  * de données, puis appelle la méthode +callback+
  *
  * @param {Array} ids Liste des identifiants à charger (ou un seul)
  * @param {Function} callback  La méthode à appeler à la fin.
  **/
  readParags ( ids, callback )
  {
    const my = this

    if ('number' === typeof ids) { ids = [ids]}
    my.list_parags_to_read  = ids
    my.after_reading_parags = callback
    fs.open(this.parags_file_path, 'r', (err, fd) => {
      if ( err ) { throw err }
      my.readNextParag(fd)
    })
  }

  /**
  * Méthode fonctionnelle, utilisée par `readParags` ci-dessus, qui lit
  * un paragraphe dans le fichier de données et le parse.
  **/
  readNextParag (fd)
  {
    let parag_id = this.list_parags_to_read.shift()
    if ( undefined !== parag_id )
    {
      this.readParag( fd, parag_id )
    }
    else
    {
      // console.log("J'ai fini de lire les paragraphes, je peux continuer.")
      if ( 'function' === typeof this.after_reading_parags )
      {
        this.after_reading_parags.call()
      }
    }
  }

  /**
  * Lit les données du paragraphe dans le fichier de données
  *
  * La méthode appelle ensuite la méthode qui parse la donnée pour en
  * faire une vraie instance Parag
  **/
  readParag (fd, pid)
  {
    const my = this
    let startPos = pid * Parag.dataLengthInFile
    let buffer   = new Buffer(Parag.dataLengthInFile)
    fs.read(fd, buffer, 0, Parag.dataLengthInFile, startPos, (err, bsize, buf) => {
      if ( err ) { throw err }
      my.parseParag(fd, pid, buf.toString() )
    })
  }
  parseParag( fd, pid, rawdata )
  {
    const my = this
    let parag = Parags.get(pid)
    parag || ( parag = new Parag({id: pid}) )
    parag.parse_data_infile( rawdata )
    // On peut poursuivre en s'occupant du paragraphe suivant, ou en
    // poursuivant avec la méthode de callback
    my.readNextParag(fd)
  }
}

let parags = new Parags()

/* Pour tout ré-initialiser
if(fs.existsSync(parags.parags_file_path)){fs.unlinkSync(parags.parags_file_path)}
parags.writeParags()
//*/

//* Pour lire les paragraphes voulus
parags.readParags([52, 14, 0, 38])
//*/
