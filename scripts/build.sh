set -e
NPM_BIN="./node_modules/.bin"

$NPM_BIN/npm-run-all --parallel rollup copy:ts
$NPM_BIN/cpx '{package.json,readme.md,LICENSE}' dist
$NPM_BIN/json -I -f dist/package.json -e "\
  this.private = false;\
  this.devDependencies = undefined;\
  this.optionalDependencies = undefined;\
  this.scripts = undefined;\
  this.husky = undefined;\
  this.prettier = undefined;\
  this.jest = undefined;\
"
