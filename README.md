# Script design

Electron's app to design and write movie scripts.

Version 0.1.0

## PTests

Also designed to create a new and simple tests framework (easier than Mocha and other Chai).

With PTests installed :

```js

    // spec_helper.js (in ./tests/ptests/)
    PTests.options.test_file = 'my_test_spec.js'

    // my_test_spec.js (in ./tests/ptests/)
    describe("My first test", [
      , describe("with imbrication", [
        , context("in first context", [
          , it('addition 2+2 = 4 is a success', () => {
            expect(2+2, 'number of eggs').equals(4)
            // => SUCCESS
            // report "OK, number of eggs is equal to 4"
          })
          , it('substraction 4 - 2 = 3 is a failure', () => {
            expect(4 - 2,'4-2').equals(3)
            // => FAILURE
            // report "Error in line 10, 4-2 doesn't equal 3"
          })
        ])
        , context('in second context')
      ])
    ])
```
