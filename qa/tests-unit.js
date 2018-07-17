var fortune = require('../lib/fortune');
var expect = require('chai').expect;

suite('Fortune tests', function(){
    test('getFortune() should return string', function(){
            expect(typeof fortune.getFortune() === 'string');
        });
    });