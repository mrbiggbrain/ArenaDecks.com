const fetch = require('node-fetch')
const fs = require('fs');

// Import Card Class
const Card = require("../cards/card.class")

module.exports = class Scryfall
{
    // The in memory scryfall caching database. 
    static DB = null

    // Fetches a card from Scryfall
    static async FetchCard(cardName)
    {
        // Ensure the database is propogated. 
        Scryfall.LoadDatabase();

        // Get the first name for cards with multiple names.
        let name = Scryfall.ChopCardName(cardName).trim().toLowerCase()

        // If the in memory database has the name
        if(Scryfall.DB.has(name))
        {
            // Log that we do not have the card in memory.
            // console.log(`Fetched ${name} from cache`);

            // get the card from the database
            const card = Scryfall.DB.get(name)

            // Return a card object. 
            return Card.FromScryfall(card)
        }
        else
        {
            // Log that we do not have the card in memory.
            console.log(`Fetched ${name} from scryfall (No local cache)`);

            // Query Scryfall about the card.
            const card = await Scryfall.QueryScryfall(cardName)

            // Write out the newly cached card. 
            Scryfall.WriteScryfallCache(card)

            // Return a Card object. 
            return Card.FromScryfall(card)
        }
    }

    // Loads the Database
    static LoadDatabase()
    {
        // We should only do this once. Check if the DB has some value. 
        if(Scryfall.DB != null) return;

        Scryfall.DB = new Map();

        var files = fs.readdirSync('_data/fetchdb/');

        for(let file of files)
        {
            let data = JSON.parse(fs.readFileSync(`_data/fetchdb/${file}`));
            let _name_ = null;

            // if(data.hasOwnProperty('card_faces')) // Double Sided
            if(data.layout == "modal_dfc" || data.layout == "transform" || data.layout == "split" || data.layout == "adventure")
            {
            _name_ = data.card_faces[0].name;
            }
            else
            {
            _name_ = data.name;
            }
            
            Scryfall.DB.set(this.ChopCardName(_name_.toLowerCase()), data);
        }
    }

    // Chops Double Cards
    static ChopCardName(cardName)
    {
        // Get position of double card marker
        let position = cardName.indexOf(' // ');

        if(position > 0)
        {
            return cardName.substring(0, position);
        }
        else
        {
            return cardName;
        }
    }

    // Query Scryfall API for card details
    static async QueryScryfall(cardName)
    {
        // Fetch details from scryfall.
        const response = await fetch(`https://api.scryfall.com/cards/named?exact=${cardName}&unique=cards&game=arena`);
        var body = await response.text();

        // Parse the JSON returned from Scryfall
        return JSON.parse(body);
    }

    // Writes out the scryfall cache
    static async WriteScryfallCache(details)
    {
        fs.writeFile(`_data/fetchdb/${details.id}.json`, JSON.stringify(details), function (err, result){

        });
    }
}