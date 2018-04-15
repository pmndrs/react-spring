export default class Animated {
  __attach() {}
  __detach() {}
  __getValue() {}
  __getAnimatedValue() {
    return this.__getValue()
  }
  __addChild(child) {}
  __removeChild(child) {}
  __getChildren() {
    return []
  }
}
