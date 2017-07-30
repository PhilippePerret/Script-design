// let path  = require('path')
// let fs    = require('fs')

let res = "FIN"

let liste = [1,2,3]


//
// function sequentialize(promiseFactories) {
//   var chain = Promise.resolve()
//   promiseFactories.forEach(function (promiseFactory) {
//     chain = chain.then(promiseFactory)
//   })
//   return chain
// }
//
//
// let chargerPageInternet = (url) => {
//   return new Promise((onLoaded, onEchec) => {
//     let codePage = ''
//
//     // Pour une essai factice, mais en décalage
//     //* <- Ajouter/retirer "/" au début pour ex-commenter (faux essai)
//     setTimeout( () => {
//       onLoaded("Ceci est le code original de la page.")
//       console.log("J'ai chargé le code original de la page.")
//     }, 1000)
//     //*/
//
//     // Pour un essai réel, supprimer la première "/" ci-dessous et
//     // ex-commenter le code ci-dessus
//     /* <- Ajouter/supprimer "/" au début pour commenter/ex-commenter
//     let req = new XMLHttpRequest()
//     req.open('GET', url)
//     // req.responseType = 'blob'
//     req.onload = () => {
//       if (req.status === 200) {
//         codePage = req.response // (1)
//         onLoaded(codePage)}
//       else {onEchec(Error('Impossible de charger la page' + req.statusText))}
//     }
//     req.onerror = ()=>{onEchec(Error('Erreur réseaux'))}
//     req.send();
//     //*/
//   })
// }
//
// /**
// * Méthode qui doit traduire le texte donné en argument et retourner
// * une promise.
// * @return {Promise}
// **/
// function traduireLaPage (texte)
// {
//   return new Promise((ok, notOk) => {
//
//     // Ici, on doit avoir un code de traduction asynchrone, qui
//     // traite de façon synchrone les termes déjà connus et traite
//     // de façon asynchrone les termes non connus. Ici, pour la
//     // démonstration, on utilise simplement un timeout qui retarde
//     // le résultat de l'opération de 2 secondes.
//     setTimeout( () => {
//       ok("Ceci est le code traduit")
//       console.log("J'ai fini de traduire la page.")
//     }, 1000)
//   })
// }
//
// function timeout(duration) {
//     return new Promise(function(resolve, reject) {
//         setTimeout( () => {
//           console.log("Je dois attendre %d msec", duration)
//           resolve()
//         }, duration);
//     });
// }
//
// class User {
//   constructor ( prenom, attente )
//   {
//     this.prenom = prenom
//     this.attente = (attente || 2) * 1000
//   }
//   sendMail (message) {
//     const my = this
//     return new Promise(function(ok, notok){
//       setTimeout( () => {
//
//         ok("Un message qui ira nulle part.")
//
//         console.log("J'ai envoyé le <mail>%s</mail> à %s", message, my.prenom)
//         // Ci-dessus, on ne peut pas utiliser "this" car "this" concerne la
//         // promise, pas l'instance, même si nous l'avons bindée pour appeler
//         // la méthode.
//
//       }, my.attente)
//     })
//   }
// }
//
// function envoyerLesMails()
// {
//   let users = [
//     new User('Marion', 6),
//     new User('Phil', 1 )
//   ]
//   let message = "Le message"
//   return Promise.all(
//     users.map( u => { return u.sendMail.bind(u, message).call() /* (1) */ } )
//     // Noter ci-dessus que Promise.all attend comme argument un {Array}
//   )
// }
//
// // function envoyerLesMails( code ) {
// //
// //   return new Promise( (ok, notok) => {
// //     let users = [
// //       new User('Phil'), new User('Marion'), new User('Élie'), new User('Salomé')
// //     ]
// //     let message = `<mail>${code}</mail>`
// //
// //     let usersMails = users.map( u => { return u.sendMail.bind(u, message)})
// //     // Remarquer ci-dessus que c'est la méthode qui est placée dans le map,
// //     // pas son résultat.
// //     // C'est ça qu'il faut utiliser :     [maMethode, maMethode, ...]
// //     // Et non pas ça :                    [maMethode(), maMethode(), ...]
// //
// //     return sequentialize( usersMails).then( () => {
// //
// //       console.log("Mails envoyés.")
// //       // Ce message ne sera affiché que lorsque tous les mails auront
// //       // été envoyés.
// //
// //       ok(code)
// //     })
// //   })
// //
// // }
//
// function afficherLaPage ( code ) {
//   return new Promise( (ok, notok) => {
//     setTimeout( () => {
//       console.log("J'affiche la page <html><body>%s</body></html>", code)
//     }, 1000)
//   })
// }
//
// // On lance l'opération
// let url = "www.atelier-icare.net"
//
// chargerPageInternet(url)
//   .then(traduireLaPage)
//   .then(envoyerLesMails)
//   .then(afficherLaPage)
//   .catch(console.log.bind(console))
//
//
//

console.log(res)
