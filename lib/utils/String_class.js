/*
  Class String
  ------------
  Pour requirejs
  API permet d'enregistrer toutes les données d'une application dans des
  fichier JSON dans le dossier des données de l'utilisateur.

*/
class Str
{
  static scan (re)
  {
      if (!re.global) throw "Il faut une expression régulière !";
      let
            s     = this
          , m, r  = []

      while ( m = re.exec(s) ) {
          m.shift()
          r.push(m)
      }
      return r
  }// /fin scan

} // /fin Str


/**
* Prend le string et transforme ses caractères spéciaux en caractères
* unicode.
*
**/
String.prototype.toUnicode = function()
{
  let str = this
    , uString = ''
    , cUni
    , i, len
    , chr
  for (i=0,len=str.length; i < len ; ++i) {
    chr = str.charCodeAt(i)
    uString += chr <= 127
                  ? str.substr(i,1)
                  : String.unicodeCharOf(str.charCodeAt(i))
  }
  return uString
}

String.unicodeCharOf = function( charCode )
{
  this.UnicodeDict || ( this.UnicodeDict = {} )
  if ( undefined === this.UnicodeDict[charCode] ) {
    let cUni = charCode.toString(16).toUpperCase()
    while (cUni.length < 4) { cUni = '0' + cUni }
    cUni = '\\u' + cUni
    this.UnicodeDict[charCode] = cUni
  }
  return this.UnicodeDict[charCode]
}

String.prototype.titleize = function(){
  return this.substr(0,1).toUpperCase() + this.substr(1).toLowerCase()
}


module.exports = Str
