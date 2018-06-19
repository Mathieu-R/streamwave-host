#!/bin/bash
set -e

# (c) ebidel: https://github.com/GoogleChrome/chromium-dashboard/blob/master/travis/deploy_pr_gae.sh
# If this isn't a pull request, abort.
if [ "${TRAVIS_EVENT_TYPE}" != "pull_request" ]; then
  echo "This only runs on pull_request events. Event was $TRAVIS_EVENT_TYPE."
  exit
fi

# If there were build failures, abort
if [ "${TRAVIS_TEST_RESULT}" = "1" ]; then
  echo "Deploy aborted, there were build/test failures."
  exit
fi

if [[ "$TRAVIS_BRANCH" == "dev" ]]; then
  git config --global push.default simple
  git remote add deploy ssh://git@$IP:$PORT$DEPLOY_STAGING_DIR
  git push deploy dev

  ssh git@$IP -p $PORT 'cd $DEPLOY_STAGING_DIR; npm install; npm run build'
fi


