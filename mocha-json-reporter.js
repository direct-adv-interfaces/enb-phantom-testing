'use strict';

/**
 * mocha JSON reporter
 * ===
 *
 * Формирует JSON с информацией о результатах выполнения тестов. Также включает в результат
 * информацию о покрытии кода тестами, если доступен объект window.__coverage__.
 *
 * **Пример**
 *
 * ```
 * $ ./node_modules/phantomjs/bin/phantomjs ./node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js path/to/file.html ./mocha-json-reporter.js
 *
 * ```
 *
 * **Пример результата**
 *
 * ```javascript
 *  {
 *      result: {
 *          stats: { ... },
 *          tests: { ... },
 *          pending: { ... },
 *          failures: { ... },
 *          passes: { ... }
 *      },
 *      coverage: { ... }
 *  }
 * ```
 * */

/**
 * Зависимости модуля
 */

var Base, log;

if (typeof window === 'undefined') {
    // выполняемся в Node
    Base = require('mocha').reporters.Base;
    log = console.log;
} else {
    // выполняемся в mocha-phantomjs
    Base = require('./base');
    log = function(msg) { process.stdout.write(msg + '\n'); };
}

/**
 * Инициализирует новый `JSON` reporter.
 *
 * @api public
 * @param {Runner} runner
 */
function JSONReporter(runner) {
    Base.call(this, runner);

    var self = this,
        tests = [],
        pending = [],
        failures = [],
        passes = [];

    runner.on('test end', function(test) {
        //tests.push(test);
    });

    runner.on('pass', function(test) {
        passes.push(test);
        tests.push(test);
    });

    runner.on('fail', function(test) {
        failures.push(test);
        tests.push(test);
    });

    runner.on('pending', function(test) {
        pending.push(test);
        tests.push(test);
    });

    runner.on('end', function() {
        // уточняем статистику для гарантии согласованности данных
        self.stats.tests = tests.length;
        self.stats.passes = passes.length;
        self.stats.pending = pending.length;
        self.stats.failures = failures.length;

        var obj = {
            result: {
                stats: self.stats,
                tests: tests.map(clean),
                pending: pending.map(clean),
                failures: failures.map(clean),
                passes: passes.map(clean)
            },
            coverage: window.__coverage__
        };

        runner.testResults = obj;

        log(JSON.stringify(obj, null, 2));
    });
}

/**
 * Возвращает объект с результатами тестов (без циклических ссылок и т.п.)
 *
 * @api private
 * @param {Object} test
 * @return {Object}
 */
function clean(test) {
    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        err: errorJSON(test.err || {})
    };
}

/**
 * Преобразует `error` в JSON объект
 *
 * @api private
 * @param {Error} err
 * @return {Object}
 */
function errorJSON(err) {
    var res = {};
    Object.getOwnPropertyNames(err).forEach(
        function(key) {
            res[key] = err[key];
        }, err);
    return res;
}

module.exports = JSONReporter;
