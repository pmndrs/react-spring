#!/bin/bash

# Force start from root folder
cd "$(dirname "$0")/.."

set -e

tag=$DIST_TAG

if [[ -z "$tag" ]]; then
  echo "Please enter the dist-tag you want to remove"
  read -r tag
fi

# This is the list of packages to remove the tag from
packages=('react-spring' '@react-spring/animated' '@react-spring/core' '@react-spring/parallax' '@react-spring/rafz' '@react-spring/shared' '@react-spring/types' '@react-spring/web' '@react-spring/konva' '@react-spring/native' '@react-spring/three' '@react-spring/zdog')

# Loop over the packages
for package in "${packages[@]}"; do
  # Remove the tag
  echo "Removing $tag from $package"
  npm dist-tag rm $package $tag
done