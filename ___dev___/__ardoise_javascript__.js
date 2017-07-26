let path  = require('path')
let fs    = require('fs')


var a = ['un', new String('deux'), 'trois', 'quatre']

var b = a.slice(1,3)

b[0] = 'deuxième'

console.log(b)
console.log(a)
