const cheerio = require('cheerio');

module.exports = function(eleventyConfig) {

  /* 
   * Shortcodes
   */

  /* Deck Input */
  eleventyConfig.addPairedLiquidShortcode("deck", function(content, deckName){

    /* Grab any lines with content on them */
    var lines = content.match(/.+/g);

    /* Output each line with formatting */
    var cardText = "";
    var deckText = "";

    lines.forEach(function (l) {
      cardText += `${l}\n`;

      var split_location = l.indexOf(' ')
      var count = l.substring(0,split_location);
      var card = l.substring(split_location + 1);

      deckText += `${count}x ${card}\n`;

    })



    //return output;
    return `<div class="container"><div class="row"><div class="col-sm-12 text-center"><hr /></div></div><div class="row"><div class="col-sm-8 text-center" style="padding-right:20px; border-right: 1px solid #ccc;"><auto-card-list preview name="${deckName}">${deckText}</auto-card-list></div><div class="col-sm-4 text-center"><u><h5>Raw Text</h5></u></hr><pre>${cardText}</pre></div></div><div class="row"><div class="col-sm-12 text-center"><hr /></div></div></div>`;
  });

  /* Passthrough Files */
  eleventyConfig.addPassthroughCopy("js");
}