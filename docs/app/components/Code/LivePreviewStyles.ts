export type LivePreviewStyles = typeof LIVE_PREVIEW_STYLES

export const LIVE_PREVIEW_STYLES = {
  spring: /* css */ `
    html, body {
        height: 100%;
    }
  
    body {
        display:flex;
        align-items: center;
        margin: 0 25px;
    }

    *, *:before, *:after {
      box-sizing: border-box;
    }
  
    .spring-box {
      width: 80px;
      height: 80px;
      background-color: #ff6d6d;
      border-radius: 8px;
      font-family: Helvetica;
      font-size: 14px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #1B1A22;
    }
  `,

  dialog: /* css */ `
    html, body {
        height: 100%;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #1B1A22;
    }

    *, *:before, *:after {
      box-sizing: border-box;
    }
  `,

  configPlayground: /* css */ `
    html,
    body {
      height: 100vh;
      width: 100vw;
    }

    *, *:before, *:after {
      box-sizing: border-box;
    }

    #root {
      position: relative;
      height: 100%;
      overflow: hidden;
    }

    .card-main {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .card {
      width: 20ch;
      height: 20ch;
      background-color: #ff6d6d;
      border-radius: 8px;
      transition: box-shadow 0.5s;
      will-change: transform;
    }
  `,
}
