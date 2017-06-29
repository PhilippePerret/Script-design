/*
  Module de test complet sur les fichiers
*/
let
    res
  , resO = {not_a_test:true}

function testFileExiste(fpath, resultat, asfile)
{
  if (undefined === asfile) asfile = true
  res = expect(fpath, resO)[asfile?'asFile':'asFolder'].to.exist
  expect(res.isOK).to.equal(resultat)
  expect(res.returnedMessage).to.contain(`le ${asfile?'fichier':'dossier'} ${fpath} ${resultat?'existe':'n’existe pas'}`)
}

describe("Avec les fichiers et dossiers",[
  , describe("méthode #exist",[
    , it("produit un succès si le fichier existe", ()=>{
      testFileExiste('./ptests.js', true)
    })
    , it("produit un succès si le dossier existe", ()=>{
      testFileExiste('./lib', true, false)
    })
    , it("produit un échec si le fichier n'existe pas", ()=>{
      testFileExiste('./averybadfile.emmm', false)
    })
    , it("produit un échec si le dossier n'existe pas", ()=>{
      testFileExiste('./liberationnestpasunfolder', false, false)
    })
  ])
])

let file_test = `${PTests.root}/support/assets/mon_fichier.txt`

describe("Avec les fichiers",[
  , describe("la méthode #contain",[
    , it("produit un succès si le texte du fichier contient l'expect", ()=>{
      res = expect(file_test).asFile.to.contain('--- ne pas modifier ---',resO)
      expect(res.isOK).to.be.true
      expect(res.returnedMessage).contains(`le fichier '${file_test}' contient « --- ne pas modifier --- »`)
    })
    , it("produit un succès si le texte contient toutes les chaines fournies", ()=>{
      res = expect(file_test).asFile.to.contain(['mot','pour voir','modifier'], resO)
      expect(res.isOK).to.be.true
      expect(res.returnedMessage).contains(`le fichier '${file_test}' contient « mot », « pour voir » et « modifier »`)
    })
    , it("produit un échec si le fichier n'existe pas, avec le bon message d'erreur", ()=>{
      res = expect('./averybadfile.emmm').asFile.to.contain('texte',resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).contains("le fichier './averybadfile.emmm' n’existe pas")
    })
    , it("produit un échec si le fichier existe mais qu'il ne contient pas l'expect", ()=>{
      res = expect(file_test).asFile.to.contain('NEDOITPASAVOIRÇA', resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).to.contain(`le fichier '${file_test}' ne contient pas « NEDOITPASAVOIRÇA »`)
    })
    , it("produit un échec si le fichier existe mais qu'une chaine dans la liste n'est pas trouvé", ()=>{
      res = expect(file_test).asFile.to.contain(['modifier','mot','NEDOITPASAVOIRÇA'], resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).to.contain(`le fichier '${file_test}' contient « modifier » et « mot » mais ne contient pas « NEDOITPASAVOIRÇA »`)
    })
    , it("produit un échec et un message d'erreur si expect n'est pas un string ou une liste de string", ()=>{
      [true,null,undefined,{un:"une"},[1,2,3]].forEach( (val) => {
        res = expect(file_test).asFile.to.contain(val,resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contain("Le texte recherché doit être un String !")
      })
    })
    , it("produit un échec et le bon message d'erreur si expect est une chaine vide", ()=>{
      res = expect(file_test).asFile.to.contain('', resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).to.contain("Le texte recherché ne peut pas être une chaine vide !")
    })
  ])
])

let folder = `${PTests.root}/lib/utils`

describe("Dossiers",[
  , describe("méthode #contain",[
    , it("produit un succès si le dossier contient le fichier spécifié", ()=>{
      res = expect(folder).asFolder.to.contain('PTests.js', resO)
      expect(res.isOK).to.be.true
      expect(res.returnedMessage).to.contain(`le dossier '${folder}' contient le fichier 'PTests.js'`)
    })
    , it("produit un succès si le dossier contient tous les fichiers spécifiés", ()=>{
      res = expect(folder).asFolder.to.contain(['PTests.js', 'PTests.sass', 'PTests.css'], resO)
      expect(res.isOK).to.be.true
      expect(res.returnedMessage).to.contain(`le dossier '${folder}' contient les fichiers 'PTests.js', 'PTests.sass' et 'PTests.css'`)
    })
    , it("produit un échec si le dossier ne contient pas le fichier spécifié", ()=>{
      res = expect(folder).asFolder.to.contain('baddescrfile.emme', resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).to.contain(`le dossier '${folder}' ne contient pas le fichier 'baddescrfile.emme'`)
    })
    , it("produit un échec si le dossier ne contient pas tous les fichiers spécifiés", ()=>{
      res = expect(folder).asFolder.to.contain(['PTests.js', 'PTests.sass', 'PTest.badext'], resO)
      expect(res.isOK).to.be.false
      expect(res.returnedMessage).to.contain(`le dossier '${folder}' contient les fichiers 'PTests.js' et 'PTests.sass' mais pas le fichier 'PTest.badext'`)
    })
    , it("produit un échec si l'expect n'est ni un string ni une liste de string", ()=>{
      [true, null, undefined, [1,2,3], {un:"une"}].forEach( (val) => {
        res = expect(folder).asFolder.to.contain(val, resO)
        expect(res.isOK).to.be.false
        expect(res.returnedMessage).to.contain("le premier argument de 'contain' doit être un String ou une liste de Strings")
      })
    })
  ])
])
