#!/usr/bin/env node

const
      electron      = require('electron')
    , {app}         = require('electron')
    , requirejs     = require('requirejs')
    , ejs           = require('ejs-electron')

app.on('ready', (evt) => {
  let PTests = require('./lib/utils/ptests')
  PTests.prepare()
})
