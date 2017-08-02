// let path  = require('path')
// let fs    = require('fs')

let res = "FIN"

let h = [
  [1,'un'], ['deux', 2]
]

let m = new Map(h)

res = m.get('deux')

console.log(res)
