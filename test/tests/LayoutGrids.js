'use strict';

const { ariaTest } = require('..');

let pageExamples = [
  {
    exampleId: 'ex1',
    gridSelector: '#ex1 [role="grid"]',
    ariaLabelledby: true, // maybe include the selector for where this label should be?
  },
  {
    exampleId: 'ex2',
    gridSelector: '#ex2 [role="grid"]',
    ariaLabelledby: true,
  },
  {
    exampleId: 'ex3',
    gridSelector: '#ex3 [role="grid"]',
  }
];

// Attributes

ariaTest('grid/LayoutGrids.html', 'grid-role', async (t) => {
  for (let i = 0; i < pageExamples.length; i++) {
    let ex = pageExamples[i];
    let gridLocator = t.context.By.css(ex.gridSelector);
    let gridElement = await t.context.session.findElement(gridLocator);

    // TODO: instead sort through all the divs in the example and make sure one has the role?

    t.truthy(
      gridElement,
      '"grid" element should be findable by selector: ' + ex.gridSelector
    );
  }
});

ariaTest('grid/LayoutGrids.html', 'aria-labelledby', async (t) => {
  for (let i = 0; i < pageExamples.length; i++) {
    let ex = pageExamples[i];
    if (!ex.hasOwnProperty('aria-Labelledby')) {
      continue;
    }

    let gridLocator = t.context.By.css(ex.gridSelector);
    let labelId = await t.context.session
        .findElement(gridLocator)
        .getAttribute('aria-labelledby');

    t.is(
      labelId,
      'foo',
      '"aria-labelledby" attribute should exist on element selected by: ' + ex.gridSelector
    );

    let exLocator = t.context.By.id(example.exId);
    let labelLocator = t.context.By.id(labelId);
    let labelElement = await t.context.session
        .findElement(exLocator)
        .findElement(labelLocator);

    console.log(await labelElement.getHTML('tabindex'));
    t.is(
      await labelElement.getHTML('tabindex'),
      'foo',
      'Element with id "' + labelId + '" should contain text that labels the grid'
    );
  }
});

ariaTest('grid/LayoutGrids.html', 'aria-label', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'aria-rowcount', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'row-role', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'aria-rowindex', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'gridcell-role', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'tabindex-span', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'tabindex-widget', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

// Keys

ariaTest('grid/LayoutGrids.html', 'key-right-arrow', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-left-arrow', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-down-arrow', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-up-arrow', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-page-down', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-page-up', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-home', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-end', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-control-home', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});

ariaTest('grid/LayoutGrids.html', 'key-control-end', async (t) => {
  await new Promise((resolve) => setTimeout(resolve, 10));
  t.pass();
});
