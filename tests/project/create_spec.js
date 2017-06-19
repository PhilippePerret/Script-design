/** ---------------------------------------------------------------------
  *   Ce module teste la création correcte d'un projet
  *
*** --------------------------------------------------------------------- */
const
    chai    = require('chai')
  , sinon   = require('sinon')
  , expect  = require('chai').expect
  , assert  = require('chai').assert


describe('le module de création', function () {

  it('est chargé par le module .lib/project/modules/create', function(){
    let Project = require('../../lib/project/modules/create')
    expect(typeof Project).to.equal('function')
  });

  it('n’est pas chargé par défaut', function(){
    expect(typeof Project).to.equal('undefined')
  });


});
