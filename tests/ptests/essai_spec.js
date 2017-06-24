console.log('-> essai_spec.js')

log('Je rentre dans le premier essai.')

describe('Un premier test')
  .it('Pour essayer la méthode', () => {
    expect(1).to.equal(1)
  })
  .it('test de l’inégalité', () => {
    expect(1).not.to.equal(2)
  })
  .it("test de l'égalité avec equal_to", () => {
    expect(1).not.equal_to(2)
  })
  .it('test de l’égalité parfaite', () => {
    expect(1).not.to.be.strictly.equal_to('1')
  })
  .it('test de l’infériorité', () => {
    expect(1).to.be.less_than(2)
  })
  .it('test de la supériorité', function(){
    expect(2).to.be.greater_than(1)
  });

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

log('Je sors du premier essai.')

console.log('<- essai_spec.js')
