export const GLOBAL = /* css */ `
/* defaults */

*,
*:before,
*:after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-touch-callout: none;
  vertical-align: baseline;
}

html {
  font-size: 12px;
}

@media (max-width: 500px) {
  html {
    font-size: 11px;
  }
}

html,
body,
#root {
  width: 100%;
  height: 100%;
  background-color: #fff;
  color: #111;
  font-weight: 400;
  font-kerning: normal;

  line-height: 1.5;
  letter-spacing: -0.002em;
  font: 15px/22px 'Inter', system-ui, sans-serif;
  font-kerning: normal;
}

@media (min-width: 900px) {
  html,
  body,
  #root {
    min-width: 900px;
  }
}

html {
  font-family: 'Inter', sans-serif;
}
@supports (font-variation-settings: normal) {
  html {
    font-family: 'Inter var', sans-serif;
  }
}

.code-table {
  display: flex;
  width: 100% !important;
  min-height: 10rem;
}

.code-table > pre:first-of-type {
  flex: 1.5 1 50%;
  margin: 0;
  max-width: 50%;
  overflow:scroll;
}
.code-table > div:last-of-type {
  flex: 1;
}
.code-table > div:last-child {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6f9;
  font-family: -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif;
  font-size: 3em;
  font-weight: 600;
  color: white;
}

#intro-demos {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;

  margin: 2em auto;
  max-width: 900px;
}

#intro-demos .demo-cell {
  padding-right: 10px;
}

#intro-demos .demo-cell img {
  width: 100%;
  margin-right: 10px;
}

#intro-demos .demo-cell img.laptop {
  max-width: 410px;
}

#intro-demos .demo-cell img.tablet {
  max-width: 280px;
}

#intro-demos .demo-cell img.phone {
  max-width: 90px;
}
`
