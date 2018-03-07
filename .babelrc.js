function presets(modules = false, loose = true) {
    return [
        ['@babel/preset-env', { loose, modules }],
        ['@babel/preset-stage-2', { loose }], 
        '@babel/preset-react'
    ]
}

module.exports = {
    presets: presets(),
    plugins: [
        ['transform-react-remove-prop-types', { mode: 'unsafe-wrap' }], 
        'annotate-pure-calls'
    ],
    env: { test: { presets: presets('commonjs') } },
}
