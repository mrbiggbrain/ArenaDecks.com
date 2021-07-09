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

/* Used for testing */
async function shortcode_test(content, deckName)
{
  // Parse the content of the tag to get a functioning deck.
  var deck = await ParseDeck(content);

  // Render and return the HTML making up the deck area.
  return RenderDeckHTML(deck);
}

// ## Rendering HTML ## //

/* Render the Deck to HTML */
function RenderDeckHTML(deck)
{
  var preview = RenderDeckPreviewHTML(deck);
  var rawtext = RenderDeckRawTextHTML(deck);
  return RenderCombinedDeckHTML(preview, rawtext);
}

/* Render the preview area (Images, etc) */
function RenderDeckPreviewHTML(deck)
{

}

/* Render the raw text area (raw text) */
function RenderDeckRawTextHTML(deck)
{

}

/* combne the preview and raw text to create the deck view */
RenderCombinedDeckHTML(preview, rawtext)
{

}

// ## Parsing Data ## //

/* Parse the deck into an object */
async function ParseDeck(content)
{
  // Get the lines
  var lines = ParseLines(content);

  var slots = await GenerateCardslotList(lines);

  // Split up the diffrent zones.
  var commander = slots.filter(slot => slot.zone == 'Commander');
  var deck = slots.filter(slot => slot.zone == 'Deck');
  var sideboard = slots.filter(slot => slot.zone == 'Sideboard');

  // Create a deck id based on the hash.
  var id = `deck-${md5(content)}`;

  // generate a list of cards from the lines.
  return {id: id, zones: {commander: commander, deck: deck, sideboard: sideboard}, raw: content};
}

/* Takes lines and converts them to a deck */
async function GenerateCardslotList(lines)
{
  var zone = 'Deck';

  var exportcards = [];

  for(const line of lines)
  {
    if(bIsCardItem(line))
    {
      item = SplitCardLine(line);


      details = await FetchCardFromScryfall(item.card);

      exportcards.push({count: item.count, details: details, zone: zone});
    }
    else
    {
      zone = line;
    }
  }

  return exportcards;
}

// ## Data Fetching ##//

/* Fetches data from scryfall */
async function FetchCardFromScryfall(name)
{
  const response = await fetch(`https://api.scryfall.com/cards/named?exact=${name}&unique=cards`);
      const body = await response.text();
      return JSON.parse(body);
}


// ## Helper Functions ## //

/* Check if an item is a card line or a zone line. */
function bIsCardItem(line)
{
  return /^\d+\s.+$/.test(line);
}

/* Split up any card lines you find. */
function SplitCardLine(l)
{
    var split_location = l.indexOf(' ')
    var count = l.substring(0,split_location);
    var card = l.substring(split_location + 1);

    return {count: count, card: card};
}

/* Parse out all the lines from the content. */
function ParseLines(content)
{
  /* Grab any lines with content on them */
  return content.match(/.+/g);
}