// Wait for the document to be ready
$( document ).ready(function() {
  // Attach
  AttachImageEvents();
  AttachTooltipEvents();
  AttachWildcardEvents();
  AttachColorEvents();
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

function AttachColorEvents()
{
  $(`i[data-search-color]`).hover(
    function(){ // Hover On
      let color = $(this).attr(`data-search-color`);
      let id = $(this).attr(`data-deck-name`);

      let highlight = "";

      if(color == "W") highlight = "#FFEBCD";
      if(color == "U") highlight = "#00BFFF";
      if(color == "B") highlight = "#A9A9A9";
      if(color == "R") highlight = "#DC143C";
      if(color == "G") highlight = "#8FBC8F";

      //$(`a[data-card-colors="*${color}*"]`).css({"background-color": highlight});
      $(`a[data-card-colors][data-deck-name="${id}"]`).each(function(){

        console.log(`yes`);
        let cardcolors = $(this).attr(`data-card-colors`);
        if(cardcolors.includes(color)) $(this).css({"background-color": highlight});
      });
    },
    function(){ // Hover Off

      let color = $(this).attr(`data-search-color`);
      let id = $(this).attr(`data-deck-name`);
      $(`a[data-card-colors][data-deck-name="${id}"]`).css({"background-color": ''});
    }
  )
}