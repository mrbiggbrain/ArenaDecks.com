const cheerio = require('cheerio');
const fetch = require('node-fetch');
const md5 = require('md5');

module.exports = function(eleventyConfig) {

  /* 
   * Shortcodes
   */
  eleventyConfig.addPairedLiquidShortcode("deck", async function(content, deckName){
    return "";
  });

  eleventyConfig.addPairedLiquidShortcode("card", function(content){
    return `<auto-card>${content}</auto-card>`;
  });

  /* Testing new deck builder */
  eleventyConfig.addPairedLiquidShortcode("test", shortcode_test);

  /* Passthrough Files */
  eleventyConfig.addPassthroughCopy("js");
}

function shortcode_test(content, deckName)
{
  
}