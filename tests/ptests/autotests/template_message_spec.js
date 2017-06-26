/*

  Pour tester les messages de template qui peuvent être explicitement fourni

*/
log('-> template_message_spec.js')

let res

describe('Contrôle général des messages de rapport du test',[
  , describe("Messages en cas de succès",[
    // , context('sans message template ni valeur-pseudo',[
    //   , it('écrit le message normal', () => {
    //     res = expect(4).equals(4, {not_a_test:true}).returnedMessage
    //     expect(res, 'le retour de "equal"').contains('4 est égal à 4', {no_values: true})
    //   })
    // ])
    , context('avec des valeurs pseudo', [
      // , context('en indiquant la valeur réelle (défaut)', [
      //   , it('écrit le message avec la valeur-pseudo de l’actual si elle est fournie', () => {
      //     res = expect(4,'le nombre d’œufs').equals(4, {not_a_test:true}).returnedMessage
      //     expect(res,'le retour de "equals"').contains('le nombre d’œufs (4) est égal à 4')
      //   })
      //   , it('écrit le message avec la valeur-pseudo de l’expected si elle est fournie', () => {
      //     res = expect(4).equals(4, 'le nombre d’œufs', {not_a_test:true}).returnedMessage
      //     expect(res,'le retour de "equals"').contains('4 est égal à le nombre d’œufs (4)')
      //   })
      //   , it('écrit le message avec les deux valeurs-pseudo si elles sont fournies', () => {
      //     res = expect(4,'le nombre de pots').equals(4, 'le nombre d’œufs', {not_a_test:true}).returnedMessage
      //     expect(res,'le retour de "equals"').contains('le nombre de pots (4) est égal à le nombre d’œufs (4)')
      //   })
      // ])
      , context('sans indiquer la valeur réelle (no_values: true)', [
        // , it('écrit le message avec la valeur-pseudo de l’actual si elle est fournie', () => {
        //   res = expect(4,'le nombre d’œufs').equals(4, {not_a_test:true, no_values:true}).returnedMessage
        //   expect(res,'le retour de "equals"').contains('le nombre d’œufs est égal à 4')
        // })
        , it('écrit le message avec la valeur-pseudo de l’expected si elle est fournie', () => {
          res = expect(4).equals(4, 'le nombre d’œufs', {not_a_test:true, no_values:true}).returnedMessage
          expect(res,'le retour de "equals"')
            .contains('4 est égal à le nombre d’œufs')
            .and.not.contains('le nombre d’œufs (4)')
            .and.contains('babar et Marion font du vélo')
        })
        // , it('écrit le message avec les deux valeurs-pseudo si elles sont fournies', () => {
        //   res = expect(4,'le nombre de pots').equals(4, 'le nombre d’œufs', {not_a_test:true, no_values:true}).returnedMessage
        //   expect(res,'le retour de "equals"').contains('le nombre de pots est égal à le nombre d’œufs')
        // })
      ])
    ])
    // , context('avec des messages templates',[
    //
    // ])
  ])
  // , describe("Messages en cas d'échec",[
  //   , context('sans message template et sans valeur-pseudo')
  //   , context('avec des valeurs-pseudo')
  //   , context('avec des messages templates')
  // ])
])

// describe('Autre contrôle',[
//
// ])

// describe('Contrôle général des messages de rapport du test')
//   .describe("Messages en cas de succès")
//     .context('sans message template')
//       .it('écrit le message normal', () => {
//         res = expect(4).equals(4, {not_a_test:true}).returnedMessage
//         expect(res, 'le retour de "equal"').contains('4 est égal à 4', {no_values: true})
//       })
//       .it('écrit le message avec la pseudo valeur si elle est fournie', () => {
//         res = expect(4,'le nombre d’œufs').equals(4, {not_a_test:true, no_values:true}).returnedMessage
//         expect(res,'le retour de "equals"').contains('le nombre d’œufs est égal à 4')
//       })
//     .context('avec des « valeurs pseudo » pour actual et expect')
//       .context('et la vraie valeur ajoutée')
//         .it('utilise la valeur pseudo pour actual', () => {
//           res = expect(24, 'l’âge de Marion').equals(24, {not_a_test:true})
//           expect(res.returnedMessage).strictly.contains("l’âge de Marion (24) est égal à 24")
//         })





//     .it('utilise la valeur pseudo pour expected', () => {
//       res = expect(24).equals(24, 'l’âge de Marion', {not_a_test:true})
//       expect(res.returnedMessage).strictly.contains("24 est égal à l’âge de Marion (24)")
//     })
// .context('avec un message template complet')
//   .it('utilise le template', () => {
//     res = expect(24).equals(24, {template:{success:"l'âge de Marion est __EXPECTED__ ans."}, not_a_test:true})
//     expect(res.returnedMessage).contains("l'âge de Marion est 24 ans.")
//   })
//
// describe("Messages en cas d'échec")
// .context('sans message template')
//   .it('écrit le message par défaut', () => {
//     let res = expect(5).equals(4, {not_a_test:true})
//     expect(res.isOK).equals(false)
//     expect(res.returnedMessage).contains('5 n’est pas égal à 4')
//   })
// .context('avec des « valeurs pseudo » pour actual et expect')












// describe('Valeur humaine pour actual')
//   .it('est utilisé dans le message de succès', () => {
//     expect(42, "l'âge du capitaine").to.be.equal_to(42)
//   })
//   .and('et dans le message d’échec [FAILURE VOLONTAIRE]', () => {
//     expect(42, "l'âge du capitaine").to.be.equal_to(40)
//   })
//
// describe('Valeur humaine pour la valeur attendue')
//   .it('est utilisée dans le message de succès', () => {
//     expect(42).to.equals(42, "l'âge du capitaine")
//   })
//   .and('et dans le message d’échec [FAILURE VOLONTAIRE]', () => {
//     expect(41).to.equals(42, "l'âge du capitaine")
//   })
//
// describe('Des valeurs humaine pour actual et expected peuvent être')
//   .it("utilisé pour le message de succès", () => {
//     let
//           age_capitaine = 42
//         , age_femme     = 42
//     expect(age_capitaine, "l'âge du capitaine").to.be.equal_to(age_femme, "l'âge de sa femme")
//   })
//   .and("et le message d'échec [FAILURE VOLONTAIRE]", () => {
//     let
//           age_capitaine = 42
//         , age_femme     = 41
//     expect(age_capitaine, "l'âge du capitaine").to.be.equal_to(age_femme, "l'âge de sa femme", {no_values: true})
//   })
//
// describe("On peut utiliser un message personnalisé")
//   .it('pour le message de succès', () => {
//     expect(4).to.equal(4, null, {template:{success:"les deux valeurs sont bien égales"}})
//   })
//   .it('pour le message d’échec [FAILURE VOLONTAIRE]', () => {
//     expect(4).to.equal(5, null, {template:{failure:"les deux valeurs divergent trop"}})
//   })
//   .it('pour le message d’échec (traitement comme test) [FAILURE VOLONTAIRE]', () => {
//     let oExpect = function(){return expect(4).to.equal(5, null, {template:{failure:"les deux valeurs divergent trop"}})}
//     expect(oExpect.returnedMessage).to.contains("les deux valeurs divergent trop")
//   })
//
// log('<- template_message_spec.js')
