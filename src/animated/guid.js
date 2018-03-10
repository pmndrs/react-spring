var _uniqueId = 0

export default function uniqueId() {
    return String(_uniqueId++)
}
