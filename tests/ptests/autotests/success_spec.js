
describe('TOUS LES TESTS SUIVANTS DOIVENT RÉUSSIR')
  .it('Pour essayer la méthode', () => {
    expect(1).to.equal(1)
  })
  .it('test de l’inégalité', () => {
    expect(1).not.to.equal(2)
  })
  .it("test de l'égalité avec equal_to", () => {
    expect(1).not.equal_to(2)
  })
  .it('test de l’égalité strict (entre 1 number et 1 string)', () => {
    expect(1).not.to.be.strictly.equal_to('1')
  })
  .it('test de l’infériorité', () => {
    expect(1).to.be.less_than(2)
  })
  .it('test de la supériorité non strict', () => {
    expect(2).to.be.greater_than(1)
  })
  .it('test de la supériorité strict', () => {
    expect(2).to.be.strictly.greater_than(1)
    expect(1).to.not.be.strictly.greater_than(1)
  })

describe("Égalité entre deux strings")
  .context('en mode strict')
    .it('"bonjour" n’est pas égal à "Bonjour"', () => {
      expect('bonjour').not.to.strictly.equal('Bonjour')
    })
    .and('"bonjour" n’est pas égal à "BONJOUR"', () => {
      expect('bonjour').not.strictly.equals('BONJOUR')
    })
  .context('en mode non strict')
    .it("'bonjour' est égal à 'Bonjour'", () => {
      expect('bonjour').equals('Bonjour')
    })

// Tester avec 'actual_str' et 'expect_str'


describe("Un second test")
  .context('en mode non strict')
    .it('1 est égal à 1', () => {
      expect(1).equal(1)
    })
    .and('1 est égal à "1"', () => {
      expect(1).equals("1")
    })
  .context('en mode strict')
    .it('1 est toujours égal à 1', () => {
      expect(1).strictly.equals(1)
    })
    .and('1 est différent de "1"', () => {
      expect(1).not.to.strictly.equals('1')
    })

describe('Test de la méthode between')
  .context('en mode non strict')
    .it('1 se trouve entre 0 et 2', () => {
      expect(1).between([0,2])
    })
    .it('1 se trouve entre 1 et 2', () => {
      expect(1).between([1,2])
    })
    .it('1 se trouve entre 1 et 1', () => {
      expect(1).between([1,1])
    })
    .it('"casserole" se trouve entre "amour" et "envie"', () => {
      expect('casserole').between(['amour','envie'])
    })
  .context('en mode strict')
    .it('1 se trouve bien entre 0 et 2', () => {
      expect(1).strictly.between([0,2])
    })
    .it('1 ne se trouve pas entre 1 et 2', () => {
      expect(1).not.strictly.between([1,2])
    })
    .it('1 ne se trouve pas entre 1 et 1', () => {
      expect(1).not.strictly.between([1,1])
    })
