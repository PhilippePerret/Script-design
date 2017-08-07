require('../../spec_helper.js')


describe.only('Options pour le projet', function () {
  describe('Elles s’enregistrent quand on les active/désactive', function () {
    before(function () {
      resetTests()
      return panneauNotes.PRactivate()
      let option_edit_originale = projet.option('seloneditpar')
      console.log("option_edit_originale = ", option_edit_originale)
    });

    it("J'active une option", function(){
      window.onkeyup({key: 'd'})
      return new Promise( (ok, ko) => {
        setTimeout( () => {
          window.onkeyup({key: 'd'})
          window.onkeyup({key: 'd'})
        }, 1000)
      })
      .then( () => {

        // On peut vérifier
        let new_option = projet.option('seloneditpar')
        expect(new_option).to.equal( ! option_edit_originale )

      })
    })
  });
});
