eleventyConfig.addPairedLiquidShortcode("deck", async function(content, deckName){

  /* Grab any lines with content on them */
  var lines = content.match(/.+/g);

  return await BuildDeckFromLines(lines, deckName);
});

async function BuildDeckFromLines(lines, deckName)
{
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

  return await BuildDeckFromParts(cardText, deckText, deckName);
}

async function BuildDeckFromParts(cardText, deckText, deckName)
{
  // Use cheerio
  const $ = cheerio.load('', null, false);

  // const response = await fetch('https://api.scryfall.com/cards/named?exact=shock&unique=cards');
  // const body = await response.text();

  // console.log(JSON.parse(body));

  /*
  // Build the left deck view
  */
  var left = $(`<div class="col-sm-8 text-center" style="padding-right:20px; border-right: 1px solid #ccc;"></div>`);
  var autocard = $(`<auto-card-list preview name="${deckName}">${deckText}</auto-card-list>`);
  //var autocard = BuildDeckCode(content);
  left.append(autocard);

  /*
  // Build the right raw view
  */
  var right = $(`<div class="col-sm-4 text-center">`);
  right.append(`<u><h5>Raw Text</h5></u>`);
  right.append(`<hr />`);
  right.append(`<pre>${cardText}</pre>`);


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
  top.append(ruler_12);
  top.append(mid);
  top.append(ruler_12);

  return top.html();
}