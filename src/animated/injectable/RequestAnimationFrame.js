const RequestAnimationFrame = {
    current: cb => global.requestAnimationFrame(cb),

    inject(injected) {
        RequestAnimationFrame.current = injected
    },
}
export default RequestAnimationFrame
