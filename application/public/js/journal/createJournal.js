/* global BASE_URL, userFeedback */
const app = {

  init() {
    app.setupEventListeners();
  },
  
  setupEventListeners() {
    document.getElementById('new-journal').addEventListener(
      'click', app.handleCreateJournal);
  },

  async handleCreateJournal(event) {
    event.preventDefault();
    try {
      // POST fetch
      const response = await fetch(`${BASE_URL}/api/journal`, {
        method: 'POST'
      });
      const json = await response.json();
      if (!response.ok) throw json;
      // Update URL
      document.location = `/journal/edit/${json.id}`; // Reloads the page
    } catch (error) {
      return userFeedback.error(error);
    }
  }
};

app.init();