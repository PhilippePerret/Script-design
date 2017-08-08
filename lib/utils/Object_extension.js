
/**
* Méthode pour boucler sur les éléments d'un tableau avec une méthode
* Elle équivaut exactement à Map#forEach, notamment avec les deux arguments
* valeur et clé mis dans cet ordre valeur puis clé.
*
* @param {Object|Map|Iterator|Array}   Objet     L'objet à traiter
* @param {Function} methode   La méthode à utiliser, qui doit recevoir deux
*                             élément : valeur, clé
**/
global.forEach = function(objet, methode)
{
  if ( 'function' == typeof objet.next ) type = 'iterator' ;
  else if ('function' == typeof objet.map) type = 'array' ;
  else if ('function' == typeof objet.get) type = 'map' ;
  // else if ('function' == typeof objet.length) type = 'array' ;
  else type = 'object'

  switch(type)
  {
    case 'iterator':
      let v
      while( v = objet.next().value ){
        methode.call(null, v)
      }
      break
    case 'array':
      objet.map( (v, k) => {
        methode.call(null, v, k)
      })
      break
    case 'map':
      objet.forEach( (v, k) => {
        methode.call(null, v, k)
      })
      break
    case 'object':
      for(let p in objet){
        if (!objet.hasOwnProperty(p)){continue}
        methode.call(null, objet[p], p)
      }
      break
  }
}



/**
* Méthode identique à la méthode Iterator#map, mais pour les objects.
*
* @param {Object}   Objet     L'objet à traiter
* @param {Function} methode   La méthode à utiliser, qui doit recevoir deux
*                             élément : valeur, clé
* @param {Array}    arr       Optionnellement, on peut transmettre une liste
*                             à laquelle seront ajoutées les valeurs et qui
*                             sera retournée.
*
* @return La liste des éléments produit par `methode`
**/
global.map = function ( objet, methode, arr )
{
  arr || ( arr = [] )

  if ( 'function' == typeof objet.next ) type = 'iterator' ;
  else if ('function' == typeof objet.map) type = 'array' ;
  else if ('function' == typeof objet.get) type = 'map' ;
  else type = 'object'

  switch(type)
  {
    case 'iterator':
      let v
      while(v = objet.next().value){
        arr.push(methode.call(null, v))
      }
      break
    case 'array':
      objet.map( (v, k) => {
        arr.push(methode.call(null, v, k))
      })
      break
    case 'map':
      objet.forEach( (v, k) => {
        arr.push(methode.call(null, v, k))
      })
      break
    case 'object':
      for(let p in objet){
        if (!objet.hasOwnProperty(p)) continue ;
        arr.push(methode.call(null, objet[p], p))
      }
      break
  }

  return arr
}
