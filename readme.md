<span class="badge-patreon"><a href="https://www.patreon.com/0xca0a" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span> [![Backers on Open Collective](https://opencollective.com/react-spring/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-spring/sponsors/badge.svg)](#sponsors) [![Build Status](https://travis-ci.org/drcmda/react-spring.svg?branch=master)](https://travis-ci.org/drcmda/react-spring) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring) ![react version](https://badgen.now.sh/badge/react/16/green) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/react-spring)

    npm install react-spring

react-spring is a spring physics based animation library for React.

<p align="middle">
  <img src="assets/spring.gif" width="285" />
  <img src="assets/transitions.gif" width="285" />
  <img src="assets/trails.gif" width="285" />
</p>
<p align="middle">
  <img src="assets/tree.gif" width="285" />
  <img src="assets/sunburst.gif" width="285" />
  <img src="assets/areas.gif" width="285" />
</p>
<p align="middle">
  <img src="assets/gestures.gif" width="285" />
  <img src="assets/reveals.gif" width="285" />
  <img src="assets/morph.gif" width="285" />
</p>
<p align="middle">
  <img src="assets/vertical.gif" width="285" />
  <img src="assets/horizontal.gif" width="285" />
  <img src="assets/keyframes-trail.gif" width="285" />
</p>
<p align="middle">
  <img src="assets/dragndrop.gif" width="285" />
  <img src="assets/stream.gif" width="285" />
  <img src="assets/time.gif" width="285" />
</p>

It takes inspiration from Christopher Chedeau's [animated](https://github.com/animatedjs/animated) and Cheng Lou's [react-motion](https://github.com/chenglou/react-motion). Although both are similarily spring-physics based they are still polar opposites.

|                | Declarative | Primitives | Interpolations | Performance |
| -------------- | ----------- | ---------- | -------------- | ----------- |
| React-motion   | ✅          | ✅         | ❌             | ❌          |
| Animated       | ❌          | ❌         | ✅             | ✅          |
| React-spring   | ✅          | ✅         | ✅             | ✅          |

react-spring builds upon animated's foundation while inheriting react-motions declarative api, going to great lengths to simplify it. It has lots of useful animation primitives, can interpolate mostly everything and last but not least, can efficiently animate by committing directly to the dom instead of re-rendering a component frame-by-frame through React.

For a more detailed explanation read [Why React needed yet another animation library](https://medium.com/@drcmda/why-react-needed-yet-another-animation-library-introducing-react-spring-8212e424c5ce).

Full documentation and examples here: [react-spring.surge.sh](http://react-spring.surge.sh/)

# What others say

<p align="middle">
  <img src="assets/testimonies.jpg" />
</p>

# Used by

<p align="middle">
  <a href="https://nextjs.org/"><img width="285" src="assets/projects/next.png"></a>
  <a href="https://codesandbox.io/"><img width="285" src="assets/projects/csb.png"></a>
  <a href="https://aragon.org/"><img width="285" src="assets/projects/aragon.png"></a>
</p>

And [many others](https://github.com/drcmda/react-spring/network/dependents) ...

# Funding

If you like this project, consider helping out, all contributions are welcome as well as donations to [opencollective](https://opencollective.com/react-spring) or [Patreon](https://www.patreon.com/0xca0a). You can make one off donations in crypto to 36fuguTPxGCNnYZSRdgdh6Ea94brCAjMbH (BTC).

## Contributors

This project exists thanks to all the people who contribute.
<a href="graphs/contributors"><img src="https://opencollective.com/react-spring/contributors.svg?width=890" /></a>

## Backers

Thank you to all our backers! 🙏

<a href="https://opencollective.com/react-spring#backers" target="_blank"><img src="https://opencollective.com/react-spring/backers.svg?width=890"></a>

## Gold sponsors

<a href="https://aragon.org/"><img width="300" src="https://wiki.aragon.org/design/logo/svg/imagetype.svg"></a>

## Sponsors

Support this project by [becoming a sponsor](https://opencollective.com/react-spring#sponsor). Your logo will show up here with a link to your website.

<a href="https://opencollective.com/react-spring/sponsor/0/website" target="_blank"><img src="https://opencollective.com/react-spring/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/react-spring/sponsor/1/website" target="_blank"><img src="https://opencollective.com/react-spring/sponsor/1/avatar.svg"></a>
