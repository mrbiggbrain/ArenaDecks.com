async function FetchCardFromScryfall(name)
{
  const response = await fetch(`https://api.scryfall.com/cards/named?exact=${name}&unique=cards`);
      const body = await response.text();
      return JSON.parse(body);
}

function bIsCardItem(line)
{
  return /^\d+\s.+$/.test(line);
}

function SplitCardLine(l)
{
    var split_location = l.indexOf(' ')
    var count = l.substring(0,split_location);
    var card = l.substring(split_location + 1);

    return {count: count, card: card};
}