module.exports = {
  // exclude: /node_modules\/(core-js|mdn-polyfills)\//,
  presets: [
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        corejs: 3,
        debug: false,
        // // Optimize polyfills
        // exclude: [
        // 	'es.array.for-each',
        // 	'web.dom-collections.for-each'
        // ]
      },
    ],
  ],
};
