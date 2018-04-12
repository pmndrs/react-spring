const CancelAnimationFrame = {
    current: id => cancelAnimationFrame(id),
    inject(injected) {
        CancelAnimationFrame.current = injected
    },
}
export default CancelAnimationFrame
