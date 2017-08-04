// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = ''

let start, laps, laps1, laps2


start = (new Date()).getTime()
for(let i = 0; i < 100000 ; ++i){
  res = new Array(1000)
  res[999] = 3
  res = res.filter( (n) => { return n != 3 })
}
laps = (new Date()).getTime() - start
console.log("Durée premier test : ", laps )


start = (new Date()).getTime()
for(let i = 0; i < 100000 ; ++i){
  res = new Array(1000)
  res[2] = 3
  res = res.filter( (n) => { return n != 3 })
}
console.log("Durée premier test BIS : ", (new Date()).getTime() - start )


start = (new Date()).getTime()
for(let i = 0; i < 100000 ; ++i){
  res = new Array(1000)
  res[999] = 3
  res.splice( res.indexOf(3), 1)
}
console.log("Durée second test : ", (new Date()).getTime() - start )


start = (new Date()).getTime()
for(let i = 0; i < 100000 ; ++i){
  res = new Array(1000)
  res[2] = 3
  res.splice( res.indexOf(3), 1)
}
console.log("Durée second test BIS : ", (new Date()).getTime() - start )



console.log(res)
