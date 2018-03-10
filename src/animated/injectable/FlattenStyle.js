const FlattenStyle = {
    current: style => style,

    inject(flatten) {
        FlattenStyle.current = flatten
    },
}
export default FlattenStyle
