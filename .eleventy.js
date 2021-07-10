const cheerio = require('cheerio');
const fetch = require('node-fetch');
const md5 = require('md5');

module.exports = function(eleventyConfig) {

  /* 
   * Shortcodes
   */
  eleventyConfig.addPairedLiquidShortcode("deck", shortcode_deck);

  eleventyConfig.addPairedLiquidShortcode("card", shortcode_card);

  /* Testing new deck builder */
  eleventyConfig.addPairedLiquidShortcode("test", shortcode_deck);

  /* Passthrough Files */
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
}

/* Used for testing */
async function shortcode_deck(content, deckName)
{
  // Parse the content of the tag to get a functioning deck.
  var deck = await ParseDeck(content);

  // Render and return the HTML making up the deck area.
  return RenderDeckHTML(deckName, deck);
}

async function shortcode_card(content)
{
  let card = await FetchCardFromScryfall(content);

  return `<a href="${card.scryfall_uri}" data-bs-toggle="tooltip" data-bs-html="true" style="opacity:1!important;" title="<img  src='${card.image_uris.small}' />">${content}</a>`;

}

// ## Rendering HTML ## //

/* Render the Deck to HTML */
function RenderDeckHTML(deckName, deck)
{
  // Use cheerio
  const $ = cheerio.load('', null, false)

  let commander_outline = GenerateOutline("Commander", deck.zones.commander, deck.id);
  let deck_outline = GenerateOutline("Deck", deck.zones.deck, deck.id)
  let sideboard_outline = GenerateOutline("Sideboard", deck.zones.sideboard, deck.id);

  let links_col = `<div class="container">${commander_outline} ${deck_outline} ${sideboard_outline}</div>`;

  let image_col = `<image class="img-fluid" src="/img/Magic_card_back.jpg" data-deck-name="${deck.id}" />`;


  let left_root_cols = `<div class="col-4">${image_col}</div><div class="col-8">${links_col}</div>`;
  let left_root_rows = `<div class="row">${left_root_cols}</row>`;
  let left_root = `<div class="container">${left_root_rows}</div>`;
  var left = $(`<div class="col-sm-8 text-center" style="padding-right:20px; border-right: 1px solid #ccc;"><h3>${deckName}</h3><hr />${left_root}</div>`);


  /*
  // Build the right raw view
  */
  var right = $(`<div class="col-sm-4 text-center">`);
  right.append(`<h3>Raw Text</h3>`);
  right.append(`<hr />`);
  right.append(`<pre>${deck.raw}</pre>`);


  /*
  // Combine them.
  */

  /* Create a ruler item */
  var ruler_12 = $(`<div class="row"><div class="col-sm-12 text-center"><hr /></div></div>`); /* A wide line for display */
  
  /* Combine left and right into mid */
  var mid = $(`<div class="row"></div>`);
  mid.append(left);
  mid.append(right);

  /* Add the rules and the mid content */
  var top = $(`<div class="container"></div>`); /* Topmost container */
  top.append(`<div class="row"><div class="col-sm-12 text-center"><hr /></div></div>`);
  top.append(mid);
  top.append(`<div class="row"><div class="col-sm-12 text-center"><hr /></div></div>`);

  return top.html();
  
}

function GenerateOutline(name, cards, id)
  {
    // Generate the commander links
    var outline = ``;

    if(cards.length > 0)
    {
      outline += `<div class="row"><div class="col-12 py-0"><b>${name} (${cards.length})</b><hr /></div></div>`;
      
      let half_a = ``;
      let half_b = ``;

      cards.forEach(function (card, i){
        let s = `${card.count} <a  href="${card.details.scryfall_uri}" data-deck-name="${id}" data-image-url="${card.details.image_uris.normal}" target="_blank" rel="noopener noreferrer">${card.details.name}</a><br />`;
        if(i > (cards.length / 2)) half_b += s;
        else half_a += s;
      });

      outline += `<div class="row"><div class="col-6 text-start">${half_a}</div><div class="col-6 text-start">${half_b}</div></div>`;
    }

    return outline;
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