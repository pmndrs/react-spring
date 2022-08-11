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

:root {
  --from: #3cffd0;
  --to: #277ef4;
}

#carbonads * {
  margin: initial;
  padding: initial;
}
#carbonads {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
}
#carbonads {
  display: flex;
  max-width: 100%;
  margin: 20px 0 0 0;
  background-color: hsl(0, 0%, 98%);
  box-shadow: 0 1px 4px 1px hsla(0, 0%, 0%, 0.1);
  z-index: 100;

  @media (min-width: 768px){
    margin: 0 0 20px 0;
  }
}
#carbonads a {
  color: inherit;
  text-decoration: none;
}
#carbonads a:hover {
  color: inherit;
}
#carbonads span {
  position: relative;
  display: block;
  overflow: hidden;
}
#carbonads .carbon-wrap {
  display: flex;
}
#carbonads .carbon-img {
  display: block;
  margin: 0;
  line-height: 1;
}
#carbonads .carbon-img img {
  display: block;
}
#carbonads .carbon-text {
  font-size: 13px;
  padding: 10px;
  margin-bottom: 16px;
  line-height: 1.5;
  text-align: left;
}
#carbonads .carbon-poweredby {
  display: block;
  padding: 6px 8px;
  background: #f1f1f2;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  font-size: 8px;
  line-height: 1;
  border-top-left-radius: 3px;
  position: absolute;
  bottom: 0;
  right: 0;
}
`
