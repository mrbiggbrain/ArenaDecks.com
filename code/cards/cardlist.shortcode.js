const Deck = require("./deck.class")
var {Liquid} = require('liquidjs');
const fs = require('fs');

// We are going to use Liquid templates! yay!
var engine = new Liquid();

module.exports = async function(content)
{
    const deck = await Deck.Parse(content)
    const template = fs.readFileSync("./_includes/list.html").toString('utf-8');
    const html = await engine.parseAndRender(template, {deck: deck});
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