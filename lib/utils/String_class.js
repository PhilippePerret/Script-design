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


module.exports = Str
