// let path  = require('path')
// let fs    = require('fs')

let res = "FIN"

let chargerPageInternet = (url) => {
  return new Promise((onLoaded, onEchec) => {
    let codePage = ''

    // Pour une essai factice, mais en décalage
    //* <- Ajouter/retirer "/" au début pour ex-commenter (faux essai)
    setTimeout( () => {
      onLoaded("Ceci est le code original de la page.")
      console.log("J'ai chargé le code original de la page.")
    }, 1000)
    //*/

    // Pour un essai réel, supprimer la première "/" ci-dessous et
    // ex-commenter le code ci-dessus
    /* <- Ajouter/supprimer "/" au début pour commenter/ex-commenter
    let req = new XMLHttpRequest()
    req.open('GET', url)
    // req.responseType = 'blob'
    req.onload = () => {
      if (req.status === 200) {
        codePage = req.response // (1)
        onLoaded(codePage)}
      else {onEchec(Error('Impossible de charger la page' + req.statusText))}
    }
    req.onerror = ()=>{onEchec(Error('Erreur réseaux'))}
    req.send();
    //*/
  })
}

/**
* Méthode qui doit traduire le texte donné en argument et retourner
* une promise.
* @return {Promise}
**/
function traduireLaPage (texte)
{
  return new Promise((ok, notOk) => {

    // Ici, on doit avoir un code de traduction asynchrone, qui
    // traite de façon synchrone les termes déjà connus et traite
    // de façon asynchrone les termes non connus. Ici, pour la
    // démonstration, on utilise simplement un timeout qui retarde
    // le résultat de l'opération de 2 secondes.
    setTimeout( () => {
      ok("Ceci est le code traduit")
      console.log("J'ai fini de traduire la page.")
    }, 1000)
  })
}

function timeout(duration) {
    return new Promise(function(resolve, reject) {
        setTimeout( () => {
          console.log("Je dois attendre %d msec", duration)
          resolve()
        }, duration);
    });
}
// var p = timeout(5000).then(() => {
//     return Promise.all([timeout(1000), timeout(2000)]);
// })
// console.log("p",p)
function envoyerUnMail( code, user )
{
  // var p = timeout(5000).then(() => {
      return Promise.all([timeout(1000), timeout(2000)]);
  // })
//   return new Promise((good,bad) => {
//     y = 1
//       // setTimeout( () => {
//       //   while (y < 10) {
//       //   // console.log("J'envoie le code `<mail>%s</mail>` à `%s`", code, user)
//       //   y ++
//         good( y )
//       // }
//       // }, 1000)
//       // console.log("y = " + y)
//   })
}
function envoyerLesMails( code ) {

  // return new Promise((ok, notOk) => {

    // setTimeout( () => {
    //   ok(code)
    //   console.log("J'ai envoyé les mails avec le code '%s'", code)
    // }, 1000)

    let users = ['Phil','Marion','Ernest','John']
    let usersMails = users.map(user => {return envoyerUnMail(code, user)})
    let pAll = Promise.all(usersMails)
    pAll.then( () => {
      setTimeout(
        () => {
          console.log("Je passe par le then de Promise.all")
          console.log(pAll)
        }
      )
    })

    return pAll
  // })
}

function afficherLaPage ( code ) {
  setTimeout( () => {
    console.log("J'affiche la page <html><body>%s</body></html>", code)
  }, 1000)
}

// On lance l'opération
let url = "www.atelier-icare.net"

chargerPageInternet(url)
  .then(traduireLaPage)
  .then(envoyerLesMails)
  .then(afficherLaPage)
  .catch(console.log.bind(console))







console.log(res)
