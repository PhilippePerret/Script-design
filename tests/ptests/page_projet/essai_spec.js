/*
Cette page pour essayer de tester unitairement
*/

// Nécessaire pour pouvoir charger le module qui est en requirejs
let requirejs = require('requirejs')
let path = require('path')
const Constantes = require_module('lib/constants.js')
global.C = Constantes

pmod = './__windows__/projet/js/api.js'

requirejs(
  [
    pmod
  ], (
    Projet
  ) => {

    puts("Je dois tester ici.")
  }
)
