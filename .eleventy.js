const moment = require("moment");
const shortcode_deck = require("./code/cards/deck.shortcode")
const shortcode_cardlist = require("./code/cards/cardlist.shortcode")
const shortcode_card = require("./code/cards/card.shortcode")

module.exports = function(eleventyConfig) {

    /* Shortcodes */
    eleventyConfig.addPairedLiquidShortcode("deck", shortcode_deck);
    eleventyConfig.addPairedLiquidShortcode("cardlist", shortcode_cardlist);
    eleventyConfig.addPairedLiquidShortcode("card", shortcode_card);

    /* Passthrough Files */
    eleventyConfig.addPassthroughCopy("js");
    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("css");

    // date filter
    eleventyConfig.addFilter("date", function(date, format) {
        return moment(date).format(format);
    });
}