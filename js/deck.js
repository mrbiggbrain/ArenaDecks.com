// Wait for the document to be ready
$( document ).ready(function() {
  // Attach
  AttachImageEvents();
  AttachTooltipEvents();
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
  $(function () {
    $('[data-bs-toggle="tooltip"]').tooltip({
      animated: 'fade',
      html: true
    });
  })
}