/*

  Pour tester les messages de template qui peuvent être explicitement fourni

*/
log('-> template_message_spec.js')

describe("Essai de récupération du message écrit")
  .it('retourne seulement l’objet expect', () => {
    let fn = function(){return expect(4).equals(4)}
    expect(fn.call()).to.be.instanceof('PTestExpectObject')
  })
describe('Valeur humaine pour actual')
  .it('est utilisé dans le message de succès', () => {
    expect(42, "l'âge du capitaine").to.be.equal_to(42)
  })
  .and('et dans le message d’échec [FAILURE VOLONTAIRE]', () => {
    expect(42, "l'âge du capitaine").to.be.equal_to(40)
  })

describe('Valeur humaine pour la valeur attendue')
  .it('est utilisée dans le message de succès', () => {
    expect(42).to.equals(42, "l'âge du capitaine")
  })
  .and('et dans le message d’échec [FAILURE VOLONTAIRE]', () => {
    expect(41).to.equals(42, "l'âge du capitaine")
  })

describe('Des valeurs humaine pour actual et expected peuvent être')
  .it("utilisé pour le message de succès", () => {
    let
          age_capitaine = 42
        , age_femme     = 42
    expect(age_capitaine, "l'âge du capitaine").to.be.equal_to(age_femme, "l'âge de sa femme")
  })
  .and("et le message d'échec [FAILURE VOLONTAIRE]", () => {
    let
          age_capitaine = 42
        , age_femme     = 41
    expect(age_capitaine, "l'âge du capitaine").to.be.equal_to(age_femme, "l'âge de sa femme")
  })

describe("On peut utiliser un message personnalisé")
  .it('pour le message de succès', () => {
    expect(4).to.equal(4, null, {template:{success:"les deux valeurs sont bien égales"}})
  })
  .it('pour le message d’échec [FAILURE VOLONTAIRE]', () => {
    expect(4).to.equal(5, null, {template:{failure:"les deux valeurs divergent trop"}})
  })
  .it('pour le message d’échec (traitement comme test) [FAILURE VOLONTAIRE]', () => {
    let oExpect = function(){return expect(4).to.equal(5, null, {template:{failure:"les deux valeurs divergent trop"}})}
    expect(oExpect.returnedMessage).to.contains("les deux valeurs divergent trop")
  })

log('<- template_message_spec.js')
