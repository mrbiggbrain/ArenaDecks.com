const Scryfall = require("../scryfall/scryfall.class");
const md5 = require('md5');

module.exports = class Deck
{

    id;
    zones;
    wildcards;
    colors;
    name;
    raw;

    static async Parse(content) 
    {
        const deck = new Deck()
        deck.zones = await GenerateZones(content)
        deck.id = `deck-${md5(content)}`
        //deck.wildcards = {common: 0, uncommon: 0, rare: 0, mythic: 0}

        deck.wildcards = GetWildcards(deck.zones.Commander.Cards, deck.zones.Deck.Cards, deck.zones.Sideboard.Cards, deck.zones.Companion.Cards)
        //deck.colors = {white: true, blue: true, black: true, red: true, green: true}
        deck.colors = GetColors(deck.zones.Commander.Cards, deck.zones.Deck.Cards, deck.zones.Sideboard.Cards, deck.zones.Companion.Cards)

        deck.raw = GetRawText(deck.zones.Commander.Cards, deck.zones.Deck.Cards, deck.zones.Sideboard.Cards, deck.zones.Companion.Cards)

        return deck
    }

    
}

function ParseLines(content)
{
    /* Grab any lines with content on them */
    return content.match(/.+/g);
}

async function GenerateCardSlotList(content)
{
    const lines = ParseLines(content)

    var zone = 'Deck'
    var exportcards = []

    for(const line of lines)
    {
        if(bIsCardItem(line))
        {
            const item = SplitCardLine(line)
            const card = await Scryfall.FetchCard(item.card)
            exportcards.push({count: item.count, card: card, zone: zone})
        }
        else
        {
            zone = line
        }
    }

    let land = exportcards.filter(card => card.card.TypeLine.toLowerCase().includes("land") == true)
    let nonland = exportcards.filter(card => card.card.TypeLine.toLowerCase().includes("land") == false)

    return nonland.concat(land)

}

function bIsCardItem(line)
{
    return /^\d+\s.+$/.test(line);
}

/* Split up any card lines you find. */
function SplitCardLine(l)
{
    // Extract the count
    var split_location = l.indexOf(' ')
    var count = Number(l.substring(0,split_location));

    // Extract out the card and set details.
    var card_detail = l.substring(split_location + 1);
    var set_location = card_detail.indexOf(' (');

    var card = null;

    if(set_location > 0) card = card_detail.substring(0, set_location);
    else card = card_detail;

    return {count: count, card: card};
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

async function GenerateZones(content)
{
    
    const slots = await GenerateCardSlotList(content)

    //console.log(slots)

    const Commander = GetSlotByName(slots, "Commander")
    const Companion = GetSlotByName(slots, "Companion")
    const Deck = GetSlotByName(slots, "Deck")
    const Sideboard = GetSlotByName(slots, "Sideboard")

    //console.log(Deck)

    return {Commander, Companion, Deck, Sideboard}
}

function GetCardsBySlot(slots, slotsName)
{
    return slots.filter(slot => slot.zone == slotsName);
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

function GetSlotByName(slots, slotsName)
{
    const cards = GetCardsBySlot(slots, slotsName)
    const size = CardsToCount(cards)
    const gate = size > 0

    return {Cards: cards, Used: gate, Size: size}
}

function GetRawText(commander, deck, sideboard, companion)
{

  let commander_size = commander.length;
  let deck_size = deck.length;
  let sideboard_size = sideboard.length;
  let companion_size = companion.length;

  var output = ``;
  var zonecount = 0;

  if(commander_size > 0)
  {
    zonecount++;

    output += `Commander\n`;

    for(var card of commander)
    {
      output += `${card.count} ${card.card.Name}\n`;
    }

    // if(deck_size >0 || sideboard_size > 0 || companion_size > 0)
    // {
    //   output += `<br />`;
    // }
  }

  if(companion_size > 0)
  {
    if(zonecount) output += `<br />`;
    zonecount++;

    output += `Companion\n`;

    for(var card of companion)
    {
      output += `${card.count} ${card.card.Name}\n`;
    }

    // if(deck_size >0 || sideboard_size > 0)
    // {
    //   output += `</br>`;
    // }
  }

  if(deck_size > 0)
  {
    if(zonecount) output += `<br />`;
    zonecount++;

    output += `Deck\n`;

    for(var card of deck)
    {
      output += `${card.count} ${card.card.Name}\n`;
    }

    // if(sideboard_size > 0)
    // {
    //   output += `<br />`;
    // }
  }

  if(sideboard_size > 0)
  {
    if(zonecount) output += `<br />`;
    zonecount++;

    output += `Sideboard\n`;

    for(var card of sideboard)
    {
      output += `${card.count} ${card.card.Name}\n`;
    }
  }

  return output;
}

function GetColors(commander, deck, sideboard, companion)
{

    const colors = {white: false, blue: false, black: false, red: false, green: false}

    const allcards = commander.concat(deck).concat(sideboard).concat(companion)

    for(card of allcards)
    {
        if(card.card.Colors.includes("W")) colors.white = true;
        if(card.card.Colors.includes("U")) colors.blue = true;
        if(card.card.Colors.includes("B")) colors.black = true;
        if(card.card.Colors.includes("R")) colors.red = true;
        if(card.card.Colors.includes("G")) colors.green = true;
    }

    return colors
}

function GetWildcards(commander, deck, sideboard, companion)
{
    const rarity = {common: 0, uncommon: 0, rare: 0, mythic: 0}
    const allcards = commander.concat(deck).concat(sideboard).concat(companion)

    for(card of allcards)
    {
      //console.log(card)

      if(card.card.Rarity == "common") rarity.common += card.count
      if(card.card.Rarity == "uncommon") rarity.uncommon += card.count
      if(card.card.Rarity == "rare") rarity.rare += card.count
      if(card.card.Rarity == "mythic") rarity.mythic += card.count
      
    }

    return rarity
}