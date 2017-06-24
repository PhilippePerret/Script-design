#!/bin/sh

# Si on a besoin de modifier les styles, décommenter la ligne suivante
./compile_sass.rb

electron ./ptests.js
