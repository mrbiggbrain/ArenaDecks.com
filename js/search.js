// Wait for the document to be ready
$( document ).ready(function() {
  // Attach
  AttachSearchEvent();
  AttachSubmitEvent();
});

// Attaches the event to the button press. 
function AttachSearchEvent()
{
  $("#search-button").click(Search);
}

function AttachSubmitEvent()
{
  $("#search-form").submit(Search);
}

// Perform the search function. 
function Search()
{
  // grab pre-generated data.
  jQuery.getJSON("/api/posts.json", function(data){

    var searchterm = $("#search-box").val();

    var index = elasticlunr(function () {
      this.addField('title');
      this.addField('description');
      this.setRef('url');
    });

    $.each(data, function (i, item) {
      index.addDoc(item)
    });

    var results = index.search(searchterm)


    // Clear the results. 
    var results_object = $("#search-results");

    if(results_object.length > 0)
    {
      // Clear Object
      $(results_object).html("");
    } 
    else 
    {
      $(results_object).html("No results, please ensure you entered a search term with at least 3 characters.");
    }

    

    // Loop through each item
    $.each(results, function (i, item) {
      var link = $(`<p><a href="${item.doc.url}">${item.doc.title}</a> <em>(${item.doc.timestamp})</em></p>`);
      $(results_object).append(link);
    });



    // Show the Modal
    $('#Search-Results-Modal').modal('show');

  });
}
