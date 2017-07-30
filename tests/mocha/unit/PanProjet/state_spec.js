
describe('État du panneau', function () {

  describe('@loaded', function () {
    it("n'est pas indéfini", function(){
      expect(panneauNotes.loaded).not.to.equal(undefined)
    })
    it("retourne true si `@pids` est défini", function(){
      panneauNotes.reset()
      panneauNotes.pids = [1,2,3]
      expect(panneauNotes.loaded).to.equal(true)
    })
    it("retourne false si `@pids` n'est pas défini", function(){
      panneauNotes.reset()
      panneauNotes.pids = undefined
      expect(panneauNotes.loaded).to.equal(false)
    })
  });
});
