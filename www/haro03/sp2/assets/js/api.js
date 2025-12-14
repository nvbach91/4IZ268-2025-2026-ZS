const API_URL = 'https://opentdb.com/api.php?amount=5&type=multiple';

function fetchQuestions() {
  return $.ajax({
    url: API_URL,
    method: 'GET',
    dataType: 'json'
  });
}
