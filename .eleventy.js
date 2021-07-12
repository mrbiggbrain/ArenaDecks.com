const cheerio = require('cheerio');
const fetch = require('node-fetch');
const md5 = require('md5');
const fs = require('fs');
const liquid = require('liquidjs');

var engine = new Liquid();

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

  return `<a href="${card.scryfall_uri}" data-bs-toggle="tooltip" data-bs-html="true" title="<img  src='${card.image_uris.small}' />">${content}</a>`;

}

// ## Rendering HTML ## //

/* Render the Deck to HTML */
function RenderDeckHTML(deckName, deck)
{
  // Use cheerio
  const $ = cheerio.load('', null, false)

  let commander_outline = GenerateOutline("Commander", deck.zones.commander, deck.id);
  let companion_outline = GenerateOutline("Companion", deck.zones.companion, deck.id);
  let deck_outline = GenerateOutline("Deck", deck.zones.deck, deck.id)
  let sideboard_outline = GenerateOutline("Sideboard", deck.zones.sideboard, deck.id);
  let wildcard_outline = GenerateWildcardOutline(deck);

  let links_col = `<div class="container">${commander_outline} ${companion_outline} ${deck_outline} ${sideboard_outline} ${wildcard_outline}</div>`;

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
  var outline = ``;

  if(cards.length > 0)
  {
    outline += `<div class="row"><div class="col-12 py-0"><b>${name} (${CardsToCount(cards)})</b><hr /></div></div>`;
    
    let half_a = ``;
    let half_b = ``;

    cards.forEach(function (card, i){
      let s = `${card.count} <a  href="${card.details.scryfall_uri}" data-deck-name="${id}" data-card-rarity=${card.details.rarity} data-image-url="${card.details.image_uris.normal}" target="_blank" rel="noopener noreferrer">${card.details.name}</a><br />`;
      if(i > (cards.length / 2)) half_b += s;
      else half_a += s;
    });

    outline += `<div class="row"><div class="col-6 text-start">${half_a}</div><div class="col-6 text-start">${half_b}</div></div>`;
  }

  return outline;
}

function GenerateWildcardOutline(deck)
{
  let wildcards = GetWildcards(deck);

  let mythic = GenerateWildcardData(wildcards.mythic, "orange", "Mythic", deck.id);
  let rare = GenerateWildcardData(wildcards.rare, "gold", "Rare", deck.id);
  let uncommon = GenerateWildcardData(wildcards.uncommon, "silver", "Uncommon", deck.id);
  let common = GenerateWildcardData(wildcards.common, "black", "Common", deck.id);

  let outline = `<div class="row"><div class="col-12 py-0"><hr /></div></div>`;
  outline += `<div class="row">`;
  outline += `<div class="col-3">${mythic}</div>`;
  outline += `<div class="col-3">${rare}</div>`;
  outline += `<div class="col-3">${uncommon}</div>`;
  outline += `<div class="col-3">${common}</div>`;
  outline += `</div>`

  return outline;
}

function GenerateWildcardData(count, color, alt, deckId)
{
  return `<div data-bs-toggle="tooltip" title="${alt}" data-card-rarity="${alt.toLowerCase()}" data-deck-name="${deckId}"> ${WildcardIcon(color)}</div> <b>${count}</b>`
}

function WildcardIcon(color, alt)
{
  return`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="${color}" class="bi bi-heptagon-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M7.779.052a.5.5 0 0 1 .442 0l6.015 2.97a.5.5 0 0 1 .267.34l1.485 6.676a.5.5 0 0 1-.093.415l-4.162 5.354a.5.5 0 0 1-.395.193H4.662a.5.5 0 0 1-.395-.193L.105 10.453a.5.5 0 0 1-.093-.415l1.485-6.676a.5.5 0 0 1 .267-.34L7.779.053z"/></svg>`;
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
  var companion = slots.filter(slot => slot.zone == 'Companion');
  var raw = GetRawText(commander, deck, sideboard, companion);

  // Create a deck id based on the hash.
  var id = `deck-${md5(content)}`;

  // generate a list of cards from the lines.
  return {id: id, zones: {commander: commander, deck: deck, sideboard: sideboard, companion: companion}, raw: raw};
}

function GetRawText(commander, deck, sideboard, companion)
{
  let commander_size = commander.length;
  let deck_size = deck.length;
  let sideboard_size = sideboard.length;
  let companion_size = companion.length;

  var output = ``;

  if(commander_size > 0)
  {
    output += `Commander`;

    for(var card of commander)
    {
      output += `${card.count} ${card.details.name}\n`;
    }

    if(deck_size >0 || sideboard_size > 0 || companion_size > 0)
    {
      output += `<br />`;
    }
  }

  if(companion_size > 0)
  {
    output += `Companion\n`;

    for(var card of companion)
    {
      output += `${card.count} ${card.details.name}\n`;
    }

    if(deck_size >0 || sideboard_size > 0)
    {
      output += `</br>`;
    }
  }

  if(deck_size > 0)
  {
    output += `Deck\n`;

    for(var card of deck)
    {
      output += `${card.count} ${card.details.name}\n`;
    }

    if(sideboard_size > 0)
    {
      output += `<br />`;
    }
  }

  if(sideboard_size > 0)
  {
    output += `Sideboard\n`;

    for(var card of sideboard)
    {
      output += `${card.count} ${card.details.name}\n`;
    }
  }

  return output;
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

/* Get wildcard details */
function GetWildcards(deck)
{
  let commander = GetWildcardHelper(deck.zones.commander);
  let main = GetWildcardHelper(deck.zones.deck);
  let sideboard = GetWildcardHelper(deck.zones.sideboard);

  common = commander.common + main.common + sideboard.common;
  uncommon = commander.uncommon + main.uncommon + sideboard.uncommon;
  rare = commander.rare + main.rare + sideboard.rare;
  mythic = commander.mythic + main.mythic + sideboard.mythic;

  return {common: common, uncommon: uncommon, rare: rare, mythic: mythic};
}

function GetWildcardHelper(zone)
{
  let common = zone.filter(x => x.details.rarity == "common");
  let uncommon = zone.filter(x => x.details.rarity == "uncommon");
  let rare = zone.filter(x => x.details.rarity == "rare");
  let mythic = zone.filter(x => x.details.rarity == "mythic");

  return {common: CardsToCount(common), uncommon: CardsToCount(uncommon), rare: CardsToCount(rare), mythic: CardsToCount(mythic)};
}

function CardsToCount(cards)
{
  let total = 0;

  for(var card of cards)
  {
    total += Number(card.count);
  }

  return total;
}

// ## Data Fetching ##//

/* Fetches data from scryfall */
async function FetchCardFromScryfall(name)
{
  const response = await fetch(`https://api.scryfall.com/cards/named?exact=${name}&unique=cards&game=arena`);
      var body = await response.text();

      //console.log(body);

      var details = JSON.parse(body);

      var overrides = JSON.parse(fs.readFileSync('_data/card_override.json'));

      let override = overrides.find(x => x.name === name);

      if(override)
      {
        details.rarity = override.rarity;
      }

      let _name =  null;
      let _image_uris = null;
      if(details.hasOwnProperty('card_faces')) // Double Sided
      {
        _name = details.card_faces[0].name;
        _image_uris = details.card_faces[0].image_uris;
      }
      else
      {
        _name = details.name;
        _image_uris = details.image_uris;
      }

      return {name: _name, image_uris: _image_uris, rarity: details.rarity, scryfall_uri: details.scryfall_uri}
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