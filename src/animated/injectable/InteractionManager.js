const InteractionManager = {
    current: {
        createInteractionHandle() {},
        clearInteractionHandle() {},
    },

    inject(manager) {
        InteractionManager.current = manager
    },
}
export default InteractionManager
