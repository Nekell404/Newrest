function pollDataAndDisplay(endpoint, elementId) {
  setInterval(function() {
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        document.getElementById(elementId).textContent = data.count;
      })
      .catch(error => {
        console.error('Error polling data:', error);
      });
  }, 5000);
}

window.addEventListener('DOMContentLoaded', function() {
  pollDataAndDisplay('/total-users-count', 'totalUsersCount');
  pollDataAndDisplay('/total-visits-count', 'totalVisitsCount');
  pollDataAndDisplay('/total-daily-requests-count', 'totalDailyRequestsCount');
  pollDataAndDisplay('/total-requests-count', 'totalRequestsCount');
});

/*function pollDataAndDisplay2(endpoint, elementId, apiKey) {
  setInterval(function() {
    fetch(`${endpoint}${apiKey}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById(elementId).textContent = data.count;
      })
      .catch(error => {
        console.error('Error polling data:', error);
      });
  }, 10000);
}

window.addEventListener('DOMContentLoaded', function() {
  const apiKey = document.getElementById('totalDailyRequestCount').dataset.apiKey;
  
  pollDataAndDisplay2('/total-daily-request-count', 'totalDailyRequestCount', `?api_key=${apiKey}`);
  pollDataAndDisplay2('/total-request-count', 'totalRequestCount', `?api_key=${apiKey}`);
});*/