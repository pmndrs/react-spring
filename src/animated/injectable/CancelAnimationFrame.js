const CancelAnimationFrame = {
    current: id => global.cancelAnimationFrame(id),

    inject(injected) {
        CancelAnimationFrame.current = injected
    },
}
export default CancelAnimationFrame
