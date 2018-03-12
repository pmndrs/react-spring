function tensionFromOrigamiValue(oValue) {
    return (oValue - 30) * 3.62 + 194
}

function frictionFromOrigamiValue(oValue) {
    return (oValue - 8) * 3 + 25
}

function fromOrigamiTensionAndFriction(tension, friction) {
    return {
        tension: tensionFromOrigamiValue(tension),
        friction: frictionFromOrigamiValue(friction),
    }
}

export default {
    fromOrigamiTensionAndFriction,
}