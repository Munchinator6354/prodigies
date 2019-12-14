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
      url: "api/index",
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

      //     <tr>
      //     <td>
      //       <p align="center">{{this.title}}</p>
      //     </td>
      //     <td>
      //       <p align="center">{{this.description}}</p>
      //     </td>
      //     <td>
      //       <p align="center">{{this.URL}}</p>
      //     </td>
      //   </tr>
      //   var $a = $("<a>")
      //     .text(example.title)
      //     .attr("href", "/example/" + example.id);
      //   var $li = $("<li>")
      //     .attr({
      //       class: "list-group-item",
      //       "data-id": example.id
      //     })
      //     .append($a);
      //   var $button = $("<button>")
      //     .addClass("btn btn-danger float-right delete")
      //     .text("ｘ");
      //   $li.append($button);
      //   return $li;
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

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
// var handleDeleteBtnClick = function() {
//   var idToDelete = $(this)
//     .parent()
//     .attr("data-id");

//   API.deleteExample(idToDelete).then(function() {
//     refreshExamples();
//   });
// };

// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
// $exampleList.on("click", ".delete", handleDeleteBtnClick);
