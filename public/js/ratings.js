// Get references to page elements
var $rating = $('input[name=rating]:checked', '#ratingForm').val();
var $comment = $("#comment");
var $submitBtn = $("#submit");
var $ratings;
// var $ratings = $('#str3').val();




// $(document).ready(function(){
    // Check Radio-box
    $(".rating input:radio").attr("checked", false);

    $('.rating input').click(function () {
        $(".rating span").removeClass('checked');
        $(this).parent().addClass('checked');
    });

    $('input:radio').change(
      function(){
        var userRating = this.value;
   
    }); 
// });


// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function(example, id) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "/api/add_ratings/" + id,
      data: JSON.stringify(example)
    });
  },
  getExamples: function() {
    return $.ajax({
      url: "api/add_rating",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/add_rating/" + id,
      type: "DELETE"
    });
  }
};

// refreshExamples gets new examples from the db and repopulates the list
var refreshGameExamples = function() {
  API.getExamples().then(function(data) {
    var $games = data.map(function(example) {
      var $tr = $("<tr>");
      var $td = $("<td>");
      var $p = $("<p>");
      $p.text(example.title);
      $td.append($p);
      $tr.append($td);
      return $tr;


    });

    $gameTable.empty();
    $gameTable.append($games);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();
  for(i=0;i<6;i++){
    var value = document.getElementById("str" + i);
    if($(value).is(':checked')){
      $ratings = value.value;
    }
  }
  console.log($ratings)
  var example = {
    rating: $ratings
  };

  if (!(example.rating)) {
    alert("You must enter a rating");
    return;
  }
  var id = $("#submit")
    .attr("data-id");
 console.log(id)
  API.saveExample(example, id).then(function() {
    refreshGameExamples();
  });

//   $ratings.v("");
//   $comment.val("");
};


// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
// $exampleList.on("click", ".delete", handleDeleteBtnClick);
