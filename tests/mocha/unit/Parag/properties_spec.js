// Tout le support de test
let path   = require('path')
require(path.resolve(path.join('.','tests','mocha','support','all_tests.js')))

describe('Parag', function () {
  describe('propriétés', function () {
    describe('@modified', function () {
      it('existe', function(){
        expect(parag0).to.have.property('modified')
      });
    });
    describe('@id', function () {
      it('existe', function(){
        expect(parag0).to.have.property('id')
      });
    });
    describe('@contents', function () {
      it('existe', function(){
        expect(parag0).to.have.property('contents')
      })
    });
    describe('@ucontents', function () {
      it('existe', function(){
        expect(parag0).to.have.property('ucontents')
      });

    });
  });
});
