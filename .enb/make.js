'use strict';

const provideFile = require('enb/techs/file-provider');
const phantomTesting = require('../index');

module.exports = function(config) {

    config.nodes('test', node => {

        node.addTechs([
            [provideFile, { target: '?.html' } ],
            [phantomTesting]
        ]);

        node.addTargets(['?.test-result.json']);
    });
};
