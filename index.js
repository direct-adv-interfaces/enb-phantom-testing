'use strict';

/** [enb-phantom-testing](https://github.com/direct-adv-interfaces/enb-phantom-testing) */

const require2 = require('./require2');
const vow = require2('enb/node_modules/vow', 'vow');
const vowFs = require2('enb/node_modules/vow-fs', 'vow-fs');
const exec = require('child_process').exec;

const extension = process.platform === 'win32' ? '.cmd' : '';
const phantomPath = require.resolve(`.bin/phantomjs${extension}`);
const mochaPhantomjsPath = require.resolve('mocha-phantomjs-core');
const mochaReporterPath = require.resolve('./mocha-json-reporter');
const MAX_PHANTOM_INSTANCES = require('os').cpus().length;

let phantomQueue = [], phantomInstancesCount = 0;

const runAsync = function(cmd) {

    const deferred = vow.defer();
    const proc = exec(cmd);

    phantomInstancesCount++;

    // proc.stdout.on('data', function() {
    //    console.log(arguments);
    // });

    proc.stderr.on('data', function(err) {
        console.log('ERROR: %s', err);
    });

    proc.on('exit', function(exitCode) {
        phantomInstancesCount--;
        phantomQueue.length && phantomQueue.shift()();
        deferred.resolve(exitCode);
    });

    return deferred.promise();
};

module.exports = require('enb/lib/build-flow').create()
    .name('enb-phantom-testing')
    .target('target', '?.test-result.json')
    .dependOn('html', '?.html')
    .defineOption('tmpTarget', '?.test-result.tmp')
    .methods({
        resolveTargetPath: function(target) {
            let nodePath = this.node.getPath();
            let targetFileName = this.node.unmaskNodeTargetName(nodePath, target);

            return this.node.resolvePath(targetFileName);
        }
    })
    .builder(function() {
        let sourceTargetFilePath = this.resolveTargetPath(this._html),
            tmpTargetFilePath = this.resolveTargetPath(this._tmpTarget), deferred = vow.defer(),
            config = JSON.stringify({
                ignoreResourceErrors: true,
                file: tmpTargetFilePath,
                settings: {
                    loadImages: false,
                    webSecurityEnabled: false
                }
            }),
            cmd = `${phantomPath} '${mochaPhantomjsPath}' '${sourceTargetFilePath}' '${mochaReporterPath}' '${config}'`;
        
        function runPhantom() {
            runAsync(cmd)
                .then(function() {
                    return vowFs
                        .read(tmpTargetFilePath, 'utf8')
                        .fail(function() {
                            return JSON.stringify({ result: { stats: { fatal: 1 } } });
                        });
                })
                .then(deferred.resolve, deferred);
        }

        phantomInstancesCount < MAX_PHANTOM_INSTANCES ? runPhantom() : phantomQueue.push(runPhantom);

        return deferred.promise();
    })
    .needRebuild(function() { return true })
    .createTech();
