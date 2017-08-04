// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = []


let old_ids = [12,1,2,3, 4]
let new_ids = [3,4,5]

new_ids = new_ids.filter( bid => {
  if ( old_ids.indexOf(bid) < 0 )
  {
    // <= L'ancienne liste ne connait pas cet ID
    // => C'est un nouveau brin
    return true
  }
  else
  {
    // <= L'ancienne liste connait cet ID
    // => Il n'y a rien à faire puisqu'il est encore dans la nouvelle.
    //    Donc on le retire de la liste.
    old_ids.splice(old_ids.indexOf(bid), 1)
    return false
  }
})

console.log("old_ids:", old_ids)
console.log("new_ids:", new_ids)


console.log(res)
