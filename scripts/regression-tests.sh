#!/bin/bash

if ! git diff --name-only $TRAVIS_COMMIT_RANGE | grep -qP '(test/|examples/)'
then
  echo "Examples files were not updated, not running example regression tests."
  exit
fi

TEST_FILES=$(git diff --name-only | grep -oP 'test/tests/\K\w+(?=.js)')
EXAMPLE_FILES=$(git diff --name-only | grep -oP 'examples/\K\w+(?=/)' | uniq)

# Run ava with multiple: --match "*TEST_FILES*"
