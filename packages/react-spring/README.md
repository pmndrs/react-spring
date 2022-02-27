<p align="center">
  <img src="https://i.imgur.com/QZownhg.png" width="240" />
</p>

<br />
<br />
<br />

**react-spring** is a spring-physics based animation library that should cover most of your UI related animation needs. It gives you tools flexible enough to confidently cast your ideas into moving interfaces.

This library represents a modern approach to animation. It is very much inspired by Christopher Chedeau's [animated](https://github.com/animatedjs/animated) and Cheng Lou's [react-motion](https://github.com/chenglou/react-motion). It inherits animated's powerful interpolations and performance, as well as react-motion's ease of use. But while animated is mostly imperative and react-motion mostly declarative, react-spring bridges both. You will be surprised how easy static data is cast into motion with small, explicit utility functions that don't necessarily affect how you form your views.

[![Build](https://github.com/pmndrs/react-spring/actions/workflows/main.yml/badge.svg?style=flat&colorA=000000&colorB=000000)](https://github.com/pmndrs/react-spring/actions/workflows/main.yml) [![npm version](https://badge.fury.io/js/react-spring.svg)](https://badge.fury.io/js/react-spring) [![Discord Shield](https://discordapp.com/api/guilds/740090768164651008/widget.png?style=shield)](https://discord.gg/ZZjjNvJ) [![Backers on Open Collective](https://opencollective.com/react-spring/backers/badge.svg)](#backers) [![Sponsors on Open Collective](https://opencollective.com/react-spring/sponsors/badge.svg)](#sponsors)

### Installation

    npm install react-spring

### Documentation and Examples

More info about the project can be found [here](https://www.react-spring.io).

Examples and tutorials can be found [here](https://react-spring.io/basics).

---

## Why springs and not durations

The principle you will be working with is called a `spring`, it _does not have a defined curve or a set duration_. In that it differs greatly from the animation you are probably used to. We think of animation in terms of time and curves, but that in itself causes most of the struggle we face when trying to make elements on the screen move naturally, because nothing in the real world moves like that.

<p align="middle">
  <img height="250" src="https://i.imgur.com/7CCH51r.gif" />
</p>

We are so used to time-based animation that we believe that struggle is normal, dealing with arbitrary curves, easings, time waterfalls, not to mention getting this all in sync. As Andy Matuschak (ex Apple UI-Kit developer) [expressed it once](https://twitter.com/andy_matuschak/status/566736015188963328): _Animation APIs parameterized by duration and curve are fundamentally opposed to continuous, fluid interactivity_.

Springs change that, animation becomes easy and approachable, everything you do looks and feels natural by default. For a detailed explanation watch [this video](https://www.youtube.com/embed/1tavDv5hXpo?controls=1&start=370).

### What others say

<p align="middle">
  <img src="assets/testimonies.jpg" />
</p>

### Used by

<p align="middle">
  <a href="https://nextjs.org/"><img width="285" src="assets/projects/next.png"></a>
  <a href="https://codesandbox.io/"><img width="285" src="assets/projects/csb.png"></a>
  <a href="https://aragon.org/"><img width="285" src="assets/projects/aragon.png"></a>
</p>

And [many others](https://github.com/react-spring/react-spring/network/dependents) ...

## Funding

If you like this project, please consider helping out. All contributions are welcome as well as donations to [Opencollective](https://opencollective.com/react-spring), or in crypto:

BTC: 36fuguTPxGCNnYZSRdgdh6Ea94brCAjMbH

ETH: 0x6E3f79Ea1d0dcedeb33D3fC6c34d2B1f156F2682

You can also support this project by becoming a sponsor. Your logo will show up here with a link to your website.

## Gold sponsors

<a href="https://aragon.org/">
  <img width="300" src="https://wiki.aragon.org/design/logo/svg/imagetype.svg"/>
</a>

## Other Sponsors

<a href="https://opencollective.com/react-spring/sponsor/0/website" target="_blank">
  <img src="https://opencollective.com/react-spring/sponsor/0/avatar.svg"/>
</a>
<a href="https://opencollective.com/react-spring/sponsor/1/website" target="_blank">
  <img src="https://opencollective.com/react-spring/sponsor/1/avatar.svg"/>
</a>

## Backers

Thank you to all our backers! 🙏

<a href="https://opencollective.com/react-spring#backers" target="_blank">
  <img src="https://opencollective.com/react-spring/backers.svg?width=890"/>
</a>

### Contributors

This project exists thanks to all the people who contribute.

<a href="https://github.com/react-spring/react-spring/graphs/contributors">
  <img src="https://opencollective.com/react-spring/contributors.svg?width=890" />
</a>
