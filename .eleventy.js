const cheerio = require('cheerio');
const fetch = require('node-fetch');
const md5 = require('md5');
const fs = require('fs');
var {Liquid} = require('liquidjs');

var FetchDB = LoadFetchDB();

// We are going to use Liquid templates! yay!
var engine = new Liquid();

module.exports = function(eleventyConfig) {

  /* 
   * Shortcodes
   */
  eleventyConfig.addPairedLiquidShortcode("deck", shortcode_deck);

  eleventyConfig.addPairedLiquidShortcode("card", shortcode_card);

  eleventyConfig.addPairedLiquidShortcode("cardlist", shortcode_cardlist);

  /* Passthrough Files */
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("css");
}

async function shortcode_card(content)
{
  let card = await FetchCardFromScryfall(content);

  return `<a href="${card.scryfall_uri}" target="_blank" data-bs-toggle="tooltip" data-bs-html="true" title="<img  src='${card.image_uris.small}' />">${content}</a>`;

}

async function shortcode_deck(content, deckname)
{
  console.log(`Processing Deck: ${deckname}`);

  // Parse the content of the tag to get a functioning deck.
  var deck = await ParseDeck(content);
  var wildcards = GetWildcards(deck);

  var template = fs.readFileSync("./_includes/deck.html").toString('utf-8');

  var gates = { 
    commander: deck.zones.commander.length > 0, 
    companion: deck.zones.companion.length > 0,
    deck: deck.zones.deck.length > 0,
    sideboard: deck.zones.sideboard.length > 0
  };

  var cardcount = {
    commander: CardsToCount(deck.zones.commander),
    companion: CardsToCount(deck.zones.companion),
    deck: CardsToCount(deck.zones.deck),
    sideboard: CardsToCount(deck.zones.sideboard)
  }

  var html = await engine.parseAndRender(template, {deck: deck, wildcards: wildcards, name: deckname, gates: gates, cardcount: cardcount });

  return Outdent(html);
}

async function shortcode_cardlist(content)
{
  // Parse the content of the tag to get a functioning deck.
  var deck = await ParseDeck(content);
  var template = fs.readFileSync("./_includes/list.html").toString('utf-8');
  var html = await engine.parseAndRender(template, {deck: deck});

  return Outdent(html);
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
  var colors = ParseColors(slots);

  // Create a deck id based on the hash.
  var id = `deck-${md5(content)}`;

  // generate a list of cards from the lines.
  return {id: id, zones: {commander: commander, deck: deck, sideboard: sideboard, companion: companion}, raw: raw, colors: colors};
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
    output += `Commander\n`;

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

  // Put the lands at the bottom of the list.
  let land = exportcards.filter(card => card.details.type_line.toLowerCase().includes("land") == true);
  let nonland = exportcards.filter(card => card.details.type_line.toLowerCase().includes("land") == false);

  return nonland.concat(land);
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

function ParseColors(slots)
{
  
  let colors = {white: false, blue: false, black: false, red: false, green: false}

  for(slot of slots)
  {
    colors = {
      white: colors.white || slot.details.colors.includes("W"),
      blue: colors.blue || slot.details.colors.includes("U"),
      black: colors.black || slot.details.colors.includes("B"),
      red: colors.red || slot.details.colors.includes("R"),
      green: colors.green || slot.details.colors.includes("G")
    };
  }

  return colors;
}

// ## Data Fetching ##//

// Sets up a simple map for search optimization.
function LoadFetchDB()
{
  let db = new Map();

  var files = fs.readdirSync('_data/fetchdb/');

  for(let file of files)
  {
    let data = JSON.parse(fs.readFileSync(`_data/fetchdb/${file}`));
    let _name_ = null;

    if(data.hasOwnProperty('card_faces')) // Double Sided
    {
      _name_ = data.card_faces[0].name;
    }
    else
    {
      _name_ = data.name;
    }
    
    db.set(_name_.toLowerCase(), data);
  }

  return db;
}

/* Fetches data from scryfall */
async function FetchCardFromScryfall(card_name)
{

  var details = null;

  let name = ChopDoubleCards(card_name);

  if(FetchDB.has(name.trim().toLowerCase()))
  {
    details = FetchDB.get(name.trim().toLowerCase());
  }
  else
  {
    console.log(`Fetched ${name} from scryfall (No local cache)`);
    const response = await fetch(`https://api.scryfall.com/cards/named?exact=${name}&unique=cards&game=arena`);
    var body = await response.text();

    details = JSON.parse(body);

    if(details.hasOwnProperty('card_faces')) // Double Sided
    {
      _name_ = details.card_faces[0].name;
    }
    else
    {
      _name_ = details.name;
    }

    FetchDB.set(_name_.toLowerCase(), details)

    fs.writeFile(`_data/fetchdb/${details.id}.json`, JSON.stringify(details), function (err, result){

    });
  }

  var overrides = JSON.parse(fs.readFileSync('_data/card_override.json'));

  let override = overrides.find(x => x.name === name);

  if(override)
  {
    details.rarity = override.rarity;
  }

  let _name =  null;
  let _image_uris = null;
  let _colors = null;

  if(details.hasOwnProperty('card_faces') && details.card_faces[0].hasOwnProperty('image_uris')) // Double Sided
  {
    _name = details.card_faces[0].name;
    _image_uris = details.card_faces[0].image_uris;

    // For some reason the API does not have a colors attribute for the sides
    // if both sides are the same colors. This compensates.
    if(details.card_faces[0].hasOwnProperty('colors'))
    {
      _colors = details.card_faces[0].colors.concat(details.card_faces[1]);
    }
    else 
    {
      _colors = details.colors;
    }

  }
  else if(details.hasOwnProperty('card_faces')) // Non-Double Sided cards with multiple faces (Adventures, Split)
  {
    _name = details.card_faces[0].name;
    _image_uris = details.image_uris;

    // For some reason the API does not have a colors attribute for the sides
    // if both sides are the same colors. This compensates.
    if(details.card_faces[0].hasOwnProperty('colors'))
    {
      _colors = details.card_faces[0].colors.concat(details.card_faces[1]);
    }
    else 
    {
      _colors = details.colors;
    }
  }
  else
  {
    _name = details.name;
    _image_uris = details.image_uris;
    _colors = details.colors;
  }

  return {name: _name, image_uris: _image_uris, rarity: details.rarity, scryfall_uri: details.scryfall_uri, colors: _colors, type_line: details.type_line}
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
    // Extract the count
    var split_location = l.indexOf(' ')
    var count = l.substring(0,split_location);

    // Extract out the card and set details.
    var card_detail = l.substring(split_location + 1);
    var set_location = card_detail.indexOf(' (');

    var card = null;

    if(set_location > 0) card = card_detail.substring(0, set_location);
    else card = card_detail;

    return {count: count, card: card};
}

/* Parse out all the lines from the content. */
function ParseLines(content)
{
  /* Grab any lines with content on them */
  return content.match(/.+/g);
}

// Remove extra spaces in HTML
function Outdent(aString)
{
  let parts = aString.split('\n');

  let final = ``;

  for(var line of parts)
  {
    final += `${line.trim()}\n`
  }

  return final;

}

function ChopDoubleCards(card_name)
{
  let position = card_name.indexOf(' // ');
  if(position > 0)
  {
    return card_name.substring(0, position);
  }
  else
  {
    return card_name;
  }
}