function searchUser() {
  var input = document.getElementById("searchInput").value.toLowerCase();
  var table = document.getElementById("userTable");
  var rows = table.getElementsByTagName("tr");
  var notFoundMessage = document.getElementById("notFoundMessage");

  var foundUsers = false;

  for (var i = 0; i < rows.length; i++) {
    var username = rows[i].getElementsByTagName("td")[1];

    if (username) {
      var usernameValue = username.textContent || username.innerText;
      if (usernameValue.toLowerCase().indexOf(input) > -1) {
        rows[i].style.display = "";
        foundUsers = true;
      } else {
        rows[i].style.display = "none";
      }
    }
  }

  if (foundUsers) {
    notFoundMessage.classList.add("hidden");
  } else {
    notFoundMessage.classList.remove("hidden");
  }
}

var searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", searchUser);

function openEditPopup(userId) {
  var editPopup = document.getElementById('editPopup_' + userId);
  editPopup.classList.remove('hidden');
}

function closeEditPopup(userId) {
  if (confirm("Are you sure you want to cancel editing? Any unsaved changes will be lost.")) {
    var editPopup = document.getElementById('editPopup_' + userId);
    editPopup.classList.add('hidden');
  }
}

var editButtons = document.querySelectorAll('.edit-button');
editButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    var userId = this.getAttribute('data-user-id');
    openEditPopup(userId);
  });
});

function confirmDelete(event, username) {
  event.preventDefault();
  const isConfirmed = confirm(`Are you sure you want to delete user ${username}?`);
  if (isConfirmed) {
    event.target.closest('form').submit();
  }
}

window.addEventListener('beforeunload', () => {
  localStorage.setItem('scrollPosition', window.scrollY.toString());
});

window.addEventListener('load', () => {
  const scrollPosition = localStorage.getItem('scrollPosition');
  if (scrollPosition) {
    window.scrollTo(0, parseInt(scrollPosition));
  }
});