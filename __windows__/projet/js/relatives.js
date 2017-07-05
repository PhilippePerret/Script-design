define(
  [
      C.LOG_MODULE_PATH // => log
    , C.DOM_MODULE_PATH // => DOM
    , PROJET_API_PATH   // => Projet
  ]
, function(
      log
    , DOM
    , Projet
  ){
   return require(path.join(PROJET_JS_FOLDER,'relatives_class'))
 }
)
//
//
// define(
//   [
//       C.LOG_MODULE_PATH // => log
//     , C.DOM_MODULE_PATH // => DOM
//     , PROJET_API_PATH   // => Projet
//   ]
// , function(
//       log
//     , DOM
//     , Projet
//   ){
//
//     class Relatives
//     {
//       constructor (iprojet)
//       {
//         this.projet = iprojet
//       }
//
//       /** ---------------------------------------------------------------------
//         *
//         *   Méthodes publiques
//         *
//       *** --------------------------------------------------------------------- */
//       addParag (iparag)
//       {
//         let newRelID = ++ this.data.lastRelativeID
//         this.data.relatives[newRelID] = {}
//         this.data.relatives[newRelID][iparag.panneau_id] = [iparag.id]
//         this.data.id2relatives[iparag.id] = newRelID
//         // Non, on enregistrera les relatives que lorsqu'on sauvera
//         // les paragraphes. On note simplement que relatives a été modifié
//         this.modified = true
//         // this.save()
//       }
//
//       /** ---------------------------------------------------------------------
//         *
//         *   Méthodes fonctionnelle
//         *
//       *** --------------------------------------------------------------------- */
//       save ()
//       {
//         this.store.set( this.data )
//       }
//
//       get data ()
//       {
//         if ( undefined === this._data ) { this._data = this.store.data }
//         return this._data
//       }
//
//       get defaultData () {
//         return {
//             "lastRelativeID"  : 0
//           , "relatives"       : {}
//           , "id2relatives"     : {}
//         }
//       }
//
//       get store ()
//       {
//         if (undefined === this._store)
//         {
//           this._store = new Store(this.relative_path, this.defaultData)
//         }
//         return this._store
//       }
//       get relative_path ()
//       { return path.join('projets',this.projet.id,'relatives') }
//
//
//       /**
//       * Méthode qui procède à l'association des parags contenus dans la liste
//       * @param {Array} parags Liste de {Parag} à associer
//       * @product
//       **/
//       associate ( parags )
//       {
//         // On regroupe les paragraphes par panprojet (synopsis, scenier, etc.)
//         // On doit obtenir un Hash qui ressemble à celui qui doit être enregistré :
//         // {
//         //   "scenier": [x, y]
//         //   "synopsis": [z, a, b]
//         // }
//         let hrelate = {}
//         parags.forEach( (parag) => {
//           if ( undefined === hrelate[parag.panneau_id] ){
//             console.log(`J'ajoute la clé ${parag.panneau_id} à hrel`)
//             hrelate[parag.panneau_id] = []
//           }
//           // On ajoute l'identifiant à cette liste
//           console.log(`J'ajoute l'id #${parag.id} à la liste hrelate[${parag.panneau_id}]`)
//           hrelate[parag.panneau_id].push(parag.id)
//         })
//         console.log("J'obtiens l'hrelate:",JSON.stringify(hrelate))
//         // On doit actualiser le lien entre le parag et le relative
//         // Il faut procéder à un contrôle pour voir si les paragraphes courants ne sont
//         // pas déjà associés
//         // Par exemple, on peut imaginer que le premier paragraphe d'un scénier était déjà
//         // associé à deux paragraphes du manuscrit, et qu'un troisième paragraphes du
//         // manuscrit soit ajouté à cette association.
//         // Dans ce cas, il faut que tous les paragraphes
//
//         // On ne peut pas associer deux ou plus paragraphes d'un panneau avec deux ou plus
//         // paragraphes d'un autre panneau. L'association se fait forcément entre un paragraphe
//         // et un ou plusieurs autres de l'autre panneau.
//         // Donc si plusieurs éléments de hrelate ont plus d'un élément, on signale une erreur
//         let erreurNoReferent = false
//         let referent = null
//         for(let pan in hrelate)
//         {
//           if ( hrelate[pan].length == 1 )
//           {
//             referent = {panneau: pan, id: hrelate[pan][0]}
//             delete hrelate[pan]
//             break
//           }
//         }
//
//         console.log("hrelate après retrait du référent", JSON.stringify(hrelate))
//
//         if ( ! referent )
//         {
//           return alert("Plusieurs parags ont été sélectionnés dans les deux panneaux. Je n'ai donc aucun référent. Il faut sélectionner un seul élément dans l'un des panneaux (le référent) et un ou plusieurs dans l'autre.")
//         }
//
//         // Le référent possède forcément un enregistrement relative. On ajoute dedans les autres
//         // paragraphes
//         let referent_relative_id = this.data.id2relatives[String(referent.id)]
//         let referent_relatives = this.data.relatives[referent_relative_id]
//         console.log(`Enregistrement actuel du référent : ${JSON.stringify(referent_relatives)}`)
//         let autre_panneau = Object.keys(hrelate)[0]
//
//         // Associer deux parags signifie qu'ils vont partager tous leurs
//         // associés.
//         // Donc, il faut :
//         //    - prendre l'enregistrement des associés dans 'relatives' de l'autre
//         //    - détruire son enregistrement des associés dans 'relatives'
//         //    - ajouter tous ses associés au relatives du référent
//         //    - modifier l'identifiant de relatives de tous les parags associés
//         //      pour qu'ils pointent vers le nouveau relatives
//
//         // L'enregistrement connait le panneau, on ajoute les éléments inconnus
//         hrelate[autre_panneau].forEach( (pid) => {
//
//           // Ici, on considère <<<referent>>> qui est le paragraphe de
//           // référence, unique
//           // Et <<<other>>> qui sont, l'un après l'autre, tous les autres
//           // paragraphes qu'on doit lui associer
//
//           let relative_id_other = this.data.id2relatives[String(pid)]
//           let relatives_other   = this.data.relatives[relative_id_other]
//
//           // TODO Poursuivre
//
//           // On peut effacer cette enregistrement et désassocier l'other
//           delete this.data.relatives[relative_id_other]
//           this.data.id2relatives[String(pid)] = referent_relative_id
//
//         })
//
//         console.log("\nRelatives finales est devenu : ", JSON.stringify(this.data))
//       }
//
//     } // class Relatives
//
//     RelOut = Relatives
//     return Relatives
// })
//
// // Pour require
// module.exports = RelOut
