# enb-phantom-testing

[![npm](https://img.shields.io/npm/v/enb-phantom-testing.svg)](https://www.npmjs.com/package/enb-phantom-testing)
[![license](https://img.shields.io/npm/l/enb-phantom-testing.svg)](http://spdx.org/licenses/MIT.html)
[![dependency status](https://img.shields.io/david/direct-adv-interfaces/enb-phantom-testing.svg)](https://david-dm.org/direct-adv-interfaces/enb-phantom-testing)

`enb-phantom-testing` - плагин (*технология*) для сборщика [ENB](https://ru.bem.info/toolbox/enb/), который выполняет тесты в PhantomJS.

## Установка

```
npm i enb-phantom-testing
```

## Использование

Технология принимает на вход html-файл с тестами и запускает тесты в нем с помощью [phantomjs](https://www.npmjs.com/package/phantomjs) и [mocha-phantomjs-core](https://www.npmjs.com/package/mocha-phantomjs-core). Результат в формате JSON записываеся в файл.
Если код предварительно был инструментировн, в результирующий файл будет также записана информация о покрытии кода тестами.

### Опции

- `String` **[target]** — Результирующий таргет. По умолчанию `?.test-result.json`.
- `String` **[html]** — Таргет страницы с тестами, которая будет передана в Headless Chrome. По умолчанию `?.html`. Указанный таргет будет собран автоматически перед запуском тестов.

### Пример

```js
const phantomTesting = require('enb-phantom-testing');

nodeConfig.addTech([
    phantomTesting, 
    {
        target: '?.test-result.json',
        html: '?.html'
    }
]);

nodeConfig.addTargets(['?.test-result.json']);
```

## JSON reporter

Формирует JSON с информацией о результатах выполнения тестов. В отличие от репортера `"json"`, входящего в состав mocha, он включает в результат
информацию о покрытии кода тестами, если доступен объект `window.__coverage__`.

### Пример

```
$ ./node_modules/phantomjs/bin/phantomjs ./node_modules/mocha-phantomjs-core/mocha-phantomjs-core.js path/to/file.html ./mocha-json-reporter.js
```

### Пример результата

```javascript
 {
     result: {
         stats: { ... },
         tests: [ ... ],
         pending: [ ... ],
         failures: [ ... ],
         passes: [ ... ]
     },
     coverage: { ... }
 }
```
