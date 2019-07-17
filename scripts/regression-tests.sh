#!/bin/bash

if ! git diff --name-only $TRAVIS_COMMIT_RANGE | grep -qP '(test/|examples/)'
then
  echo "Examples files were not updated, not running example regression tests."
  exit
fi

TEST_INFRA=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep -oP 'test/(util|index)')
TEST_FILES=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep -oP 'test/tests/\K\w+(?=.js)')
EXAMPLE_DIRS=$(git diff --name-only $TRAVIS_COMMIT_RANGE | grep -oP 'examples/\K\w+(?=/)' | uniq)

ARGS=''

# Only add match args if the example/js or example/css directories or test/index.hs
# or the test/utils.js directories have not been edited

if [ ! $TEST_INFRA ] && [ ! echo "$EXAMPLE_DIRS" | grep --silent -P "^(js|css)$" ]
then
  for D in $EXAMPLE_DIRS
  do
    ARGS="${ARGS} --match *${D}*"
  done

  for F in $TEST_FILES
  do
    ARGS="${ARGS} --match *${F}*"
  done
fi

AVACMD="ava -t -c 1 test/tests ${ARGS}"
echo "$ $AVACMD"

$AVACMD
