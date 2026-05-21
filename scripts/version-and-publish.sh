#!/bin/bash

# Force start from root folder
cd "$(dirname "$0")/.."

set -e

version=$VERSION
distTag=$DIST_TAG
withTag=$WITH_TAG

if [[ -z "$version" ]]; then
  echo "Please enter the version you want to publish"
  read -r version
fi

if [[ -z "$distTag" ]]; then
  echo "Please enter the dist-tag you want to publish with"
  read -r distTag
fi

# publish packages
./node_modules/.bin/changeset version --snapshot "$version"

# Attach SLSA provenance to every tarball npm publishes (changeset publish
# shells out to `npm publish` per package). Requires `id-token: write` on the
# workflow job.
export NPM_CONFIG_PROVENANCE=true

if [[ "$withTag" == "true" ]]; then
  ./node_modules/.bin/changeset publish --snapshot --tag "$distTag"
else
  ./node_modules/.bin/changeset publish --no-git-tag --snapshot --tag "$distTag"
fi
