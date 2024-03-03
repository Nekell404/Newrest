function searchData() {
  var input = document.getElementById("searchInput").value.toLowerCase();
  var table = document.getElementById("dataTable");
  var rows = table.getElementsByTagName("tr");
  var notFoundMessage = document.getElementById("notFoundMessage");

  var foundData = false;

  for (var i = 0; i < rows.length; i++) {
    var name = rows[i].getElementsByTagName("td")[0];

    if (name) {
      var nameValue = name.textContent || name.innerText;
      if (nameValue.toLowerCase().indexOf(input) > -1) {
        rows[i].style.display = "";
        foundData = true;
      } else {
        rows[i].style.display = "none";
      }
    }
  }

  if (foundData) {
    notFoundMessage.style.display = "none";
  } else {
    notFoundMessage.style.display = "block";
  }
}