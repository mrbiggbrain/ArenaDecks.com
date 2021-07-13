// Wait for the document to be ready
$( document ).ready(function() {
  // Attach
  AttachImageEvents();
  AttachTooltipEvents();
  AttachWildcardEvents();
});

function AttachImageEvents()
{
  $("a[data-deck-name").on("mouseover", function () {  
    let deck_id = $(this).attr("data-deck-name");
    let deck_image = $(this).attr("data-image-url");

    $(`img[data-deck-name="${deck_id}"]`).attr("src", deck_image);
  });
}

function AttachTooltipEvents()
{
  $('[data-bs-toggle="tooltip"]').tooltip({
    animated: 'fade',
    html: true
  });
}

function AttachWildcardEvents()
{

  /* Hover Effects */
  $('div[data-card-rarity]').hover(
  function(){ // Hover On

    console.log("Fires");

    let name = $(this).attr("data-deck-name");
    let rarity = $(this).attr("data-card-rarity");
    var color = "Gray";

    if(rarity == "mythic") color = "Orange";
    if(rarity == "rare") color = "Gold";
    if(rarity == "uncommon") color = "Silver";

    // get all the marching links
    $(`A[data-deck-name='${name}'][data-card-rarity='${rarity}']`).css({"background-color": color});


  },
  function(){ // Hover Off
    let name = $(this).attr("data-deck-name");
    let rarity = $(this).attr("data-card-rarity");

    $(`A[data-deck-name='${name}'][data-card-rarity='${rarity}']`).css({"background-color": ""});
  });


}