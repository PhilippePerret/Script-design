#!/usr/bin/env bash

# C'est ce fichier qui est appelé par `npm start` notamment pour
# ajouter `node_modules_mine` aux paths par défaut et pouvoir y
# mettre mes propres moduels pour le moment propres à l'application.
#
# Ce module lance aussi `./prepare.rb` qui transforme les SASS en
# CSS au besoin, où qu'ils soient placés dans l'application.

# Définir ./node_modules_of_mine dans les paths par défaut
# MAIS ça ne fonctionne pas, donc j'ai mis le code suivant avant la définition
# de `app` dans main.js :
# require('module').globalPaths.push(__dirname + "/node_modules_of_mine");
# export NODE_PATH=$NODE_PATH:$PWD/node_modules_of_mine

# Pour transformer les SASS en CSS
# TODO Ne le faire qu'en mode développement
./compile_sass.rb

# echo "argv = $1"

# Lancer l'app
# TODO Plus tard, compter le nombre d'arguments avec $# et les passer
electron . $1 $2 $3
