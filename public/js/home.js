// Get references to page elements
var $title = $("#title");
var $description = $("#description");
var $URL = $("#URL");
var $imageURL = $("#imageURL");
var $submitBtn = $("#submit");
var $gameTable = $("#gameTable");

// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function(example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/add_game",
      data: JSON.stringify(example)
    });
  },
  getExamples: function() {
    return $.ajax({
      url: "/api/index",
      type: "GET"
    });
  },
  getAvgRating: function() {
    return $.ajax({
      url: "/api/get_average_rating:id",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/add_game/" + id,
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

  var example = {
    title: $title.val().trim(),
    description: $description.val().trim(),
    URL: $URL.val().trim(),
    imageURL: $imageURL.val().trim()
  };

  if (!(example.title && example.description && example.URL)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function() {
    refreshGameExamples();
  });

  $title.val("");
  $description.val("");
  $URL.val("");
  $imageURL.val("");
};


// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
// $exampleList.on("click", ".delete", handleDeleteBtnClick);
