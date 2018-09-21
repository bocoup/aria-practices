#!/usr/bin/env node
'use strict';

const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const htmlparser2 = require('htmlparser2');
const { spawnSync } = require('child_process');

const examplePath = path.resolve(__dirname, '..', '..', 'examples');
const testsPath = path.resolve(__dirname, '..', 'tests');
const ignoreDirectories = [
  'coding-template',
  'landmarks'
];
const ignoreFiles = [
  'advancedDataGrid.html',
  'mb-about.html',
  'mb-academics.html',
  'feedDisplay.html',
  'mb-admissions.html'
];
const exampleFiles = [];
let exampleCoverage = {};

/**
 * Recursively find all example pages, saves to exampleFiles global
 * obect.
 *
 * @param {String} currentDirPath - root example directory
 */
const getExampleFiles = function (currentDirPath) {
  fs.readdirSync(currentDirPath).forEach(function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (
      stat.isFile()
      && path.extname(filePath) == '.html'
      && ignoreFiles.indexOf(path.basename(filePath)) === -1
    ) {
      exampleFiles.push(filePath);
    }
    else if (
      stat.isDirectory()
      && ignoreDirectories.indexOf(path.basename(filePath)) === -1
    ) {
      getExampleFiles(filePath);
    }
  });
}

/**
 * Return human readible name for a "Keyboard Support" table row.
 *
 * @param {jQuery object} $         - loaded Cheerio dom
 * @param {jQuery object} $tableRow - root example directory
 */
const getKeyboardRowName = function ($, $tableRow) {
  return $('th', $tableRow).text().replace(/\n/g, ', ');
}

/**
 * Return human readible name for an "Attributes" table row.
 *
 * @param {jQuery object} $         - loaded Cheerio dom
 * @param {jQuery object} $tableRow - root example directory
 */
const getAttributeRowName = function ($, $tableRow) {
  // use the containt 'th' text to identify the row. If there is no text
  // in the 'th' element, use the 'element' column text.
  let rowName = $('th', $tableRow).text();
  if (!rowName) {
    rowName = $(':nth-child(3)', $tableRow).text();
  }
  return rowName;
}

/**
 * Return results of running ava in coverage mode. Coverage mode
 * should not start browser and will fail all tests.
 *
 * @param {jQuery object} $tableRow - root example directory
 */
const avaResultsInCoverageMode = function () {
  process.env.REGRESSION_COVERAGE_REPORT = 1;

  let cmd = path.resolve(__dirname, '..', '..', 'node_modules', 'ava', 'cli.js');
  let cmdargs = [testsPath, '--tap', '-c', '1'];

  const output = spawnSync(cmd, cmdargs);
  return `${output.stdout}`;
}

// Find all example pages

getExampleFiles(examplePath);

// Find all data-test-ids in example pages

for (let exampleFile of exampleFiles) {
  var data = fs.readFileSync(exampleFile);
  const dom = htmlparser2.parseDOM(data);
  const $ = cheerio.load(dom);

  let dataTestIds = new Set();
  let attrsMissingIds = new Set();
  let keysMissingIds = new Set();

  // Find all the "Keyboard Interaction" table rows
  $('table.def tbody tr').each(function() {
    let $row = $(this);
    let dataTestId = $row.attr('data-test-id');
    if (dataTestId !== undefined) {
      dataTestIds.add(dataTestId);
    }
    else {
      keysMissingIds.add(getKeyboardRowName($, $row));
    }
  })

  // Find all the "Attribute" table rows
  $('table.attributes tbody tr').each(function() {
    let $row = $(this);
    let dataTestId = $row.attr('data-test-id');
    if (dataTestId !== undefined) {
      dataTestIds.add(dataTestId);
    }
    else {
      attrsMissingIds.add(getAttributeRowName($, $row))
    }
  })

  // Use the relative path to identify the example page
  const example = path.relative(examplePath, exampleFile);

  exampleCoverage[example] = {
    existingTestIds: dataTestIds,
    missingTests: new Set(dataTestIds),
    missingAttrs: attrsMissingIds,
    missingKeys: keysMissingIds,
  }
}

const avaResults = avaResultsInCoverageMode();

let testRegex = /^# (\S+) [>›] (\S+\.html) \[data-test-id="(\S+)"\]/gm;
let matchResults;
while (matchResults = testRegex.exec(avaResults)) {
  let example = matchResults[2];
  let dataTestId = matchResults[3];

  // If the test file has a data-test-id, the data-test-id must exist on
  // the test page.
  exampleCoverage[example].missingTests.delete(matchResults[3]);
}

let examplesWithNoTests = 0;
let examplesWithNoTestsReport = '';
let examplesMissingSomeTests = 0;
let examplesMissingSomeTestsReport = '';
let missingTestIds = 0;
let missingTestIdsReport = '';
let totalTestIds = 0;

for (let example in exampleCoverage) {
  const existingTestIds = exampleCoverage[example].existingTestIds.size;
  const missingTests = exampleCoverage[example].missingTests.size;
  const missingKeys = exampleCoverage[example].missingKeys.size;
  const missingAttrs = exampleCoverage[example].missingAttrs.size;

  if (existingTestIds !== missingTests) {
    totalTestIds += existingTestIds;
  }

  if ( missingTests || missingKeys || missingAttrs ) {
    let exampleName = example;

    if (existingTestIds === missingTests) {
      examplesWithNoTestsReport += exampleName + '\n';
    }
    else if (missingTests) {
      examplesMissingSomeTestsReport += exampleName + ':\n';

      for (let testId of exampleCoverage[example].missingTests) {
        examplesMissingSomeTestsReport += '    ' + testId + '\n';
      }

      examplesMissingSomeTests += 1;
      missingTestIds += missingTests;
    }

    if (missingKeys || missingAttrs) {
      missingTestIdsReport += '\n' + exampleName + '\n';
      if (missingKeys) {
        missingTestIdsReport += ' "Keyboard Support" table(s):\n';
        for (let row of exampleCoverage[example].missingKeys) {
          missingTestIdsReport += '    ' + row + '\n';
        }
      }

      if (missingAttrs) {
        missingTestIdsReport += ' "Attributes" table(s):\n';
        for (let row of exampleCoverage[example].missingAttrs) {
          missingTestIdsReport += '    ' + row + '\n';
        }
      }
    }
  }
}

console.log('\nExamples without regression tests:\n');
console.log(examplesWithNoTestsReport);
console.log('\nExamples missing regression tests:\n');
console.log(examplesMissingSomeTestsReport);
console.log('\nExamples documentation table rows without data-test-ids:\n');
console.log(missingTestIdsReport);

console.log('SUMMARTY:\n');
console.log('  ' + exampleFiles.length + ' example pages found.')
console.log('  ' + examplesWithNoTests + ' example pages have no regression tests.')
console.log('  ' + examplesMissingSomeTests + ' example pages are missing approximately '
            + missingTestIds + ' out of approximately ' + totalTestIds + ' tests.\n')
