module.exports = function(eleventyConfig) {
  // Passthrough built assets and images
  eleventyConfig.addPassthroughCopy({ 'src/assets/dist': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/assets/images': 'assets/images' });
  // PWA manifest at site root
  eleventyConfig.addPassthroughCopy({ 'src/manifest.json': 'manifest.json' });
  // Copy service worker to site root
  eleventyConfig.addPassthroughCopy({ 'src/assets/workers/sw.js': 'sw.js' });
  // Watch additional files
  eleventyConfig.addWatchTarget('src/assets/css/main.css');
  eleventyConfig.addWatchTarget('src/assets/js');

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk'
  };
};
