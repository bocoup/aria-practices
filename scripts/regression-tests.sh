#!/bin/bash

COMMIT_RANGE="origin/master...$TRAVIS_BRANCH"

git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin master

echo "TRAVIS_PULL_REQUEST? ${TRAVIS_PULL_REQUEST}"
echo "?????????????????????????????????????????????????"
echo "TRAVIS_BRANCH? ${TRAVIS_BRANCH}"
echo "git diff --name-only ${COMMIT_RANGE}"
git diff --name-only ${COMMIT_RANGE}
echo "?????????????????????????????????????????????????"
echo "TRAVIS_COMMIT_RANGE? ${TRAVIS_COMMIT_RANGE}"
echo "git diff --name-only ${TRAVIS_COMMIT_RANGE}"
git diff --name-only $TRAVIS_COMMIT_RANGE
echo "?????????????????????????????????????????????????"


if ! git diff --name-only $COMMIT_RANGE | grep -qP '(test/|examples/|package\.json)'
then
  echo "Examples files were not updated, not running example regression tests."
  exit
fi

AVACMD="npm run regression -- -t"
ARGS=''

TEST_INFRA=$(git diff --name-only $COMMIT_RANGE | grep -oP 'test/(util|index)')
EXAMPLE_INFRA=$(echo "$EXAMPLE_DIRS" | grep -P '^(js|css)$')


if [ $TEST_INFRA -o $EXAMPLE_INFRA ]
then

    # If the example/js or example/css directories or test/index.js or the test/utils.js
    # files have been edited, run all tests.

    ARGS="test/tests/*.js"

else

  # Otherwise, run only relevant tests

  TEST_FILES=$(git diff --name-only $COMMIT_RANGE | grep -oP 'test/tests/\K.*' | uniq)
  EXAMPLE_DIRS=$(git diff --name-only $COMMIT_RANGE | grep -oP 'examples/\K[\w-]+(?=/)' | uniq)

  echo TEST_FILES $TEST_FILES
  echo EXAMPLE_DIRS $EXAMPLE_DIRS

  for D in $EXAMPLE_DIRS
  do
    # Remove this if statement when we add regression tests for landmark pages
    if [ $D != 'landmarks' ]
    then
      ARGS="${ARGS} test/tests/${D}*.js"
    fi
  done

  for F in $TEST_FILES
  do
    ARGS="${ARGS} test/tests/${F}"
  done

fi

echo "$" $AVACMD $ARGS

$AVACMD $ARGS
