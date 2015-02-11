module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/every-insert/dist/every-insert-latest.js',
      'src/global.js',
      'src/fancy_dropdowns.js',
      'src/floating_labels.js',
      'src/*_spec.js'
    ],
    client: {
      mocha: { ui: 'bdd' }
    }
  });
}
