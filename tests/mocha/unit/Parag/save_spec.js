/*

  Test de la sauvegarde des paragraphes dans le fichier

  On crée un premier parag d'id #14, qu'on enregistre
  Puis on en crée un autre d'id #5, avec des caractères spéciaux

  Ensuite, on s'assure que les données sont enregistrées correctement et à
  leur place dans le fichier PARAGS.txt

*/
require('../../spec_helper.js')


/**
* Créer le projet et retourne une Promise
*
**/
function CreateProjetForThisTest()
{
  resetTest({nombre_parags : 0})
  expect(()=>{return parag0}).to.throw()

  // - Création du parag #14 -

  Parag._lastID = 13
  let newP_id   = 14

  projet.current_panneau = panneauScenier
  let newP = panneauScenier.parags.createNewParag()
  expect(newP).to.be.instanceOf(Parag)
  expect(newP.id).to.equal(newP_id)
  newP.contents = "Contenu paragraphe #14"
  expect(newP).to.respondsTo('PRsync')
  expect(newP._modified).to.be.true

  // Le panneau contient ce parag #14

  expect(panneauScenier.parags._ids).to.deep.equal([newP.id])

  // Mais à ce moment-là, le paragraphe n'est pas encore enregistré
  expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt ne devrait pas exister').to.be.false

  // On sauve le projet pour enregistrer le paragraphe

  return projet.saveAll()

}

describe('Enregistrement des paragraphes dans le fichier', function () {


  describe('Création de deux parags avec la méthode Parags::createNewParag (sans auto-synchronisation)', function () {
    it("crée un premier parag #14", function(){
      projet.option('autosync', 0)

      CreateProjetForThisTest()
        .then( () => {

          expect(fs.existsSync(projet.parags_file_path), 'le fichier PARAGS.txt devrait exister').to.be.true

          // On s'assure que
          let codeinfile = fs.readFileSync(projet.parags_file_path,'utf8')

          // console.log(`CODE FICHIER : '${codeinfile}'`)
          expect(newP.startPos).to.equal(newP.id * Parag.dataLengthInFile)
          expect(newP.startPos).to.be.at.least(5000)
          let codePinfile = codeinfile.substr(newP.startPos, Parag.dataLengthInFile)

          // console.log("Segment data parag: '%s'", codePinfile)

          expect(codePinfile[0]).to.equal('n')
          expect(codePinfile.substr(1, Parag.DATA['id'].length).trim()).to.equal(String(newP_id))
        })
    })


    it("crée un second parag #5", function(){

      // le fichier des paragraphs doit exister après le cas précédent
      CreateProjetForThisTest()
      .then( () => {

        expect(fs.existsSync(projet.parags_file_path)).to.be.true

        let codeinfile = fs.readFileSync(projet.parags_file_path,'utf8')

        // Création d'une instance de Parag

        const newP = new Parag({
            id: 5
          , contents    : 'en été ça marche !'
          , _modified   : true
          , duration    : 90
        })

        // On l'ajoute au panneau manuscrit

        panneauManuscrit.parags.add( newP )

        // On sauve à nouveau les paragraphe

        return projet.saveAll()
          .then( () => {
            /*  On va vérifier que l'instance 14 et l'instance 5 ont bien leurs
                données dans le fichier.
            */

            const lenData = Parag.dataLengthInFile

            // Le code complet du fichier

            let codeinfile = fs.readFileSync(projet.parags_file_path,'utf8')

            // Les données de l'instance 14

            let code14 = codeinfile.substr( 14 * lenData, lenData)
            let code5  = codeinfile.substr( 5  * lenData, lenData)

            const now = moment().format('YYMMDD')

            let arrExp = [
                {id: 'id',          type: 'n', exp5: '5', exp14: '14'}
              , {id:'panneau_let',  type: 's', exp5: 'm', exp14: 's' }
              , {id:'ucontents',    type: 's', exp5: "en été ça marche !".toUnicode(), exp14: 'Contenu paragraphe #14' }
              , {id:'duration',     type: 'n', exp5: "90", exp14: '60'}
              , {id:'created_at',   type: 'e', exp5: now, exp14: now}
              , {id:'updated_at',   type: 'e', exp5: now, exp14: now}
            ]
            let rest5  = code5, type5, data5
            let rest14 = code14, type14, data14
            arrExp.forEach( (hexp) => {

              type5 = rest5[0]
              expect(type5).to.equal(hexp.type)
              data5 = rest5.substr(1, Parag.DATA[hexp.id].length).trim()
              expect(data5).to.equal(hexp.exp5)
              rest5 = rest5.substr(Parag.DATA[hexp.id].length + 1)

              type14 = rest14[0]
              expect(type14).to.equal(hexp.type)
              data14 = rest14.substr(1, Parag.DATA[hexp.id].length).trim()
              expect(data14).to.equal(hexp.exp14)
              rest14 = rest14.substr(Parag.DATA[hexp.id].length + 1)

            })

          })

      })

    })
  })
})
