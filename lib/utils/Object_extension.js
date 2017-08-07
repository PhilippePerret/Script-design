
/**
* Méthode pour boucler sur les éléments d'un tableau avec une méthode
* Elle équivaut exactement à Map#forEach, notamment avec les deux arguments
* valeur et clé mis dans cet ordre valeur puis clé.
*
* @param {Object}   Objet     L'objet à traiter
* @param {Function} methode   La méthode à utiliser, qui doit recevoir deux
*                             élément : valeur, clé
**/
global.forEach = function ( objet, methode )
{
  for(let p in objet){
    if (!objet.hasOwnProperty(p)){continue}
    methode.call(null, objet[p], p)
  }
}


/**
* Méthode identique à la méthode Iterator#map, mais pour les objects.
*
* @param {Object}   Objet     L'objet à traiter
* @param {Function} methode   La méthode à utiliser, qui doit recevoir deux
*                             élément : valeur, clé
*
* @return La liste des éléments produit par `methode`
**/
global.map = function ( objet, methode )
{
  let arr = []
  for(let p in objet){
    if (!objet.hasOwnProperty(p)){continue}
    arr.push(methode.call(null, objet[p], p))
  }
  return arr
}
