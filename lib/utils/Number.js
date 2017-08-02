/** ---------------------------------------------------------------------
  *
  *   Extension de la class Number
  *
*** --------------------------------------------------------------------- */

/**
* Transforme un nombre de secondes en nombre de pages, en considérant
* qu'une page fait 60 secondes (comme dans un scénario), avec un chiffre
* après la virgule
**/
Number.prototype.as_pages = function()
{
  let s = this / 60
  return Math.round(s * 10) / 10
}

Number.prototype.as_horloge = function( asDuree )
{
  let h, m, s
  h = Math.floor(this / 3600)
  m = this % 3600
  s = m % 60
  m = Math.floor(m / 60)
  if ( asDuree )
  {
    m = (h && m < 10) ? `0${m}` : String(m)
  }
  else
  {
    m = m < 10 ? `0${m}` : String(m)
    h || ( h = '0' ) // horloge
  }
  return (h ? `${h}:` : '') + `${m}:` + (s > 9 ? String(s) : `0${s}`)
}
Number.prototype.as_duree = function()
{
  return this.as_horloge(true)
}

/**
* @return le nombre de secondes correspondant à l'horloge String.
*
* Noter que l'horloge peut être fournie avec des virgules au lieu des ":"
**/
String.prototype.as_seconds = function()
{
  let me = this
  let h,m,s,l,sum
  me = me.replace(/,/g,':').replace(/ /g,'')
  l = me.split(':')
  l.reverse()
  s = l[0]
  m = l[1] || 0
  h = l[2] || 0
  sum = Number(s)
  m && (sum += Number(m)*60)
  h && (sum += Number(h)*3600)
  return sum
}

Number.s2h    = function(s){return Number(s).as_horloge()}
Number.s2d    = function(s){return Number(s).as_duree()}
Number.pages  = function(s){return Number(s).as_pages()}
String.h2s    = function(h){return String(h).as_seconds()}
