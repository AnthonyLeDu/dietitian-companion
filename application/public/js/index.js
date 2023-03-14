/* global dayjs, Journal */
dayjs.locale('fr');

const PATIENTS_DATALIST = 'patients-datalist';
const FOODS_DATALIST = 'foods-datalist';
const BASE_URL = 'http://localhost:3000';

function createChildElement(parentElement, elementTag, elementClass = null, elementId = null) {
  const newElem = document.createElement(elementTag);
  parentElement.appendChild(newElem);
  if (elementClass) newElem.className = elementClass;
  if (elementId) newElem.id = elementId;
  return newElem;
}

/**
 * Shorthand to create a delete button, calling a function when clicked.
 * @param {HTMLElement} parentElement The parent element
 * @param {Function} deleteFunction The function to call when the deleteElem is clicked
 * @returns {HTMLElement} The created element
 */
// eslint-disable-next-line no-unused-vars
function createDeleteElement(parentElement, deleteFunction) {
  const deleteElem = createChildElement(parentElement, 'div', 'img-trash');
  deleteElem.addEventListener('click', () => deleteFunction());
  return deleteElem;
}

/**
 * Wrapper to call a function (e.g. eventListener handler) only if
 * a given HTMLElement has not the '--disabled' class.
 * @param {Function} fn The function to call.
 * @param {HTMLElement} element The element whose classList we want to check.
 */
// eslint-disable-next-line no-unused-vars
function callIfEnabled(fn, element) {
  if (!element.classList.contains('--disabled')) {
    fn();
  }
}

const app = {
  feedbackElem: undefined,
  dbPatients: undefined,
  dbFoods: undefined,
  journal: undefined,
  
  init: async function () {
    app.findDOMElements();   
    app.setupEventListeners(); 
    // Init datalists
    app.fetchFoods();
    await app.fetchPatients();
    app.loadJournalIfQueried();
  },

  findDOMElements() {
    app.feedbackElem = document.getElementById('feedback');
  },

  setupEventListeners() {
    app.feedbackElem.addEventListener('click', app.clearFeedback);
    document.getElementById('new-journal').addEventListener(
      'click', app.handleCreateJournal);
  },

  /**
   * Load journal if searched for in URL
   */
  loadJournalIfQueried() {
    const match = document.location.search.match(/journal=(\d+)(&|$)/);
    if (match && match[1]) {
      document.getElementById('new-journal').style.display = 'none';
      app.loadJournal(Number(match[1])); // Journal ID
    }
  },

  /**
   * Fetch Journal from API and load it in the App.
   */
  async loadJournal(id) {
    try {
      const response = await fetch(`${BASE_URL}/api/journal/${id}`);
      const json = await response.json();
      if (!response.ok) throw json;
      app.journal = new Journal(json, document.getElementById('journal'));
    } catch (error) {
      console.error(error.message);
      return app.errorFeedback(error.message);
    }
  },

  successFeedback(message) {
    app.feedbackElem.className = '';
    app.feedbackElem.textContent = message;
    app.feedbackElem.classList.add('--is-success');
  },
  
  errorFeedback(message) {
    app.feedbackElem.className = '';
    app.feedbackElem.textContent = message;
    app.feedbackElem.classList.add('--is-danger');
  },

  clearFeedback() {
    app.feedbackElem.textContent = '';
    app.feedbackElem.className = '';
  },

  /**
  * Fetch Patients from API and fill the related DOM datalist
  */
  async fetchPatients() {
    try {
      // Fetching using API
      const response = await fetch(`${BASE_URL}/api/patients`);
      const json = await response.json();
      if (!response.ok) throw json;
      // Add the fullname-and-gender
      app.dbPatients = json.map(patient => {
        patient.fullNameAndGender = `${patient.last_name} ${patient.first_name} (${patient.gender.charAt(0)})`;
        return patient;
      });
    } catch (error) {
      console.error(error.message);
      return;
    }
    // Fill the datalist
    const patientsDataListElem = document.getElementById(PATIENTS_DATALIST);
    for (const patient of app.dbPatients) {
      const option = createChildElement(patientsDataListElem, 'option');
      option.value = patient.fullNameAndGender;
      option.dataset.patientId = patient.id;
    }
  },

  /**
   * Fetch Foods from API and fill the related DOM datalist
   */
  async fetchFoods() {
    try {
      // Fetching using API
      const response = await fetch(`${BASE_URL}/api/foods`);
      const json = await response.json();
      if (!response.ok) throw json;
      app.dbFoods = json;
    } catch (error) {
      console.error(error.stack);
      return;
    }
    // Fill the datalist
    const foodsDataListElem = document.getElementById(FOODS_DATALIST);
    for (const food of app.dbFoods) {
      const option = createChildElement(foodsDataListElem, 'option');
      option.value = food.name_fr;
      option.dataset.code = food.code;
    }
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
      document.location.search = `?journal=${json.id}`; // Reloads the page
    } catch (error) {
      console.error(error);
      return app.errorFeedback(error.message);
    }
  },

};


app.init();