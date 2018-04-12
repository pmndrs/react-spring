const RequestAnimationFrame = {
    current: cb => requestAnimationFrame(cb),
    inject(injected) {
        RequestAnimationFrame.current = injected
    },
}
export default RequestAnimationFrame
