define(
  [],
  function()
  {
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

    return Str
  }
)
