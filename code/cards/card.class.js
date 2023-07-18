module.exports = class Card
{
    Name;
    ImageURIs;
    Rarity;
    ScryfallUri;
    Colors;
    TypeLine;

    static FromScryfall(cardDetails)
    {
        const card = new Card()

        card.Name = Card.GetCardName(cardDetails)
        card.ImageURIs = Card.GetCardImage(cardDetails)
        card.Colors = Card.GetCardColors(cardDetails)
        card.Rarity = cardDetails.rarity
        card.ScryfallUri = cardDetails.scryfall_uri
        card.TypeLine = cardDetails.type_line

        return card
    }

    // Check if a card is double faced. 
    static bIsDoubleFaced(cardDetails)
    {
        if(cardDetails.layout == "modal_dfc" || cardDetails.layout == "transform" || cardDetails.layout == "split" || cardDetails.layout == "adventure" || cardDetails.layout == "battle")
        {
            return true
        }
        else
        {
            return false
        }
    }

    // Get the card name. 
    static GetCardName(cardDetails)
    {
        if(Card.bIsDoubleFaced(cardDetails)) return cardDetails.card_faces[0].name
        else return cardDetails.name
    }

    // Get the Image URLs
    static GetCardImage(cardDetails)
    {
        if(cardDetails.layout == "modal_dfc" || cardDetails.layout == "transform" || cardDetails.layout == "battle")
        {
            return cardDetails.card_faces[0].image_uris
        }
        else
        {
            return cardDetails.image_uris
        }
    }

    // Get colors
    static GetCardColors(cardDetails)
    {
        if(Card.bIsDoubleFaced(cardDetails))
        {
            if(cardDetails.card_faces[0].hasOwnProperty('colors'))
            {
                return cardDetails.card_faces[0].colors.concat(cardDetails.card_faces[1])
            }
        }
        
        return cardDetails.colors
    }
}