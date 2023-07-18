const Deck = require("./deck.class")
var {Liquid} = require('liquidjs');
const fs = require('fs');

// We are going to use Liquid templates! yay!
var engine = new Liquid();

module.exports = async function(content, deckname)
{
    // Show Message
    console.log(`Processing Deck: ${deckname}`)

    // Parse the Deck
    const deck = await Deck.Parse(content)
    deck.name = deckname

    var template = fs.readFileSync("./_includes/deck.html").toString('utf-8');
    //var html = await engine.parseAndRender(template, {deck: deck, wildcards: wildcards, name: deckname, gates: gates, cardcount: cardcount });
    const html = await engine.parseAndRender(template, {deck: deck})
    return Outdent(html)
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