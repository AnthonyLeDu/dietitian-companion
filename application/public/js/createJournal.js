dayjs.locale('fr');

const PATIENTS_DATALIST = 'patients-datalist';
const FOODS_DATALIST = 'foods-datalist';
const BASE_URL = 'http://localhost:3000';


function isScrollbarVisible(element) {
  return element.scrollWidth > element.clientWidth;
}

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
function callIfEnabled(fn, element) {
  if (!element.classList.contains('--disabled')) {
    fn();
  }
}

class CoreObject {
  static childrenClass;
  parent;
  mainElem;
  children; // Ordered array of children CoreObjects
  childrenRowElem;
  childrenElem;
  id;

  /**
   * @param {CoreObject} parent Parent CoreObject
   * @param {HTMLElement} mainElem Corresponding DOM Element
  */
  constructor(parent = null, mainElem = null) {
    this.parent = parent;
    this.mainElem = mainElem;
    this.children = [];
    // Needed for eventListeners definition because 'this' corresponds
    // to the clicked element in addEventListener handlers.
    this.self = this;
  }

  /**
   * Remove an instance from the children and from the DOM.
   * @param {CoreObject} child Instance to remove.
   */
  removeChild(child) {
    this.children.splice(child.index, 1);
    child.mainElem.remove();
    this.updateChildren();
  }

  /**
   * Ask the parent to remove the instance
   */
  destroy() {
    this.parent.removeChild(this);
  }


  /**
   * Getter returning the index of the instance in its parent's children array.
   * @returns {Integer} The index.
   */
  get index() {
    const index = this.parent.children.indexOf(this);
    return (index !== -1) ? index : undefined;
  }

  /**
   * Setter moving the instance to the given index in its parent's children array.
   */
  set index(value) {
    this.parent.moveChild(this, value - this.index);
  }

  addChild(mainElem = null) {
    this.children.push(
      new this.childrenClass(this, mainElem));
    this.updateChildren();
  }

  /**
   * Move a child in the children array and update the DOM acccordingly.
   * @param {CoreObject} child Child instance
   * @param {Integer} increment Positive increment = to the end ; negative increment = to the start.
   */
  moveChild(child, increment) {
    if (child.index === undefined) throw new Error(`Child not found in ${this.constructor.name} children.`);
    if (increment === 0) return; // No move needed

    const targetIndex = child.index + increment
    // Check that child can be moved in the array
    if (targetIndex < 0 || (this.children.length <= targetIndex)) {
      throw new Error(`
        Child cannot be moved to index '${targetIndex}' as it falls outside of the ${this.constructor.name} 
        children array range (i.e. it is below '0' or above '${this.children.length - 1}').
      `);
    }
    // Moving the child in the array and update the DOM
    this.children.splice(targetIndex, 0, this.children.splice(child.index, 1)[0]);
    this.updateChildren();
  }

  sortChildrenElem() {
    this.children.forEach((child, index) => {
      const htmlElem = this.self.childrenElem.children[index];
      if (htmlElem !== child.mainElem) { // Element is not at expected position, insert it
        this.self.childrenElem.insertBefore(child.mainElem, htmlElem);
      }
    });
  }

  updateChildren() {
    this.sortChildrenElem();
  }

}

class Dish extends CoreObject {
  static childrenClass; // undefined

  /**
   * Create the Dish DOM Element
   * @param {Meal} parent 
   * @param {HTMLElement} mainElem The DOM Element (optional)
   */
  constructor(parent, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'dish');
    super(parent, mainElem);
    const dishCodeName = `day${this.parent.parent.index}-meal${this.parent.index}-dish${this.index}`;
    // Delete button
    createDeleteElement(this.mainElem, () => this.destroy());
    // Food selection
    const foodElem = createChildElement(this.mainElem, 'input', 'dish__food');
    foodElem.setAttribute('list', FOODS_DATALIST);
    foodElem.required = true;
    foodElem.name = `${dishCodeName}__name`;
    // Amount input
    const amountElem = createChildElement(this.mainElem, 'input', 'dish__amount');
    amountElem.type = 'number';
    amountElem.step = '10';
    amountElem.name = `${dishCodeName}__amount`;

    createChildElement(this.mainElem, 'span').textContent = 'g';
  }
}

class Meal extends CoreObject {
  static childrenClass; // Dish
  timeElem;

  /**
   * Create the Meal DOM Element
   * @param {Day} parent 
   * @param {HTMLElement} mainElem The DOM Element (optional)
   */
  constructor(parent, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'meal');
    super(parent, mainElem);
    this.childrenClass = Dish;

    const headerElem = createChildElement(this.mainElem, 'div', 'meal-header');
    // Delete button
    createDeleteElement(headerElem, () => this.destroy());
    // Title
    const titleElem = createChildElement(headerElem, 'h5', 'meal__title');
    titleElem.textContent = 'Repas de';
    // Time
    this.timeElem = createChildElement(headerElem, 'input');
    this.timeElem.type = 'time';
    this.timeElem.required = true;
    this.timeElem.onkeydown = "return false";
    this.timeElem.name = `day${this.parent.index}-meal${this.index}__time`;
    this.timeElem.addEventListener('change', () => this.self.parent.sortChildren());
    // Dishes
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meal-row');
    this.childrenElem = createChildElement(this.childrenRowElem, 'div', 'dishes');
    const addDishElem = createChildElement(this.childrenRowElem, 'input', 'add-dish');
    addDishElem.type = 'button';
    addDishElem.value = 'Ajouter un aliment';
    addDishElem.addEventListener('click', () => this.self.addChild());
  }

}

class Day extends CoreObject {
  static childrenClass; // Meal
  titleElem;
  arrowLeftElem;
  arrowRightElem;

  /**
   * Create the Day DOM Element
   * @param {Journal} parent 
   * @param {HTMLElement} mainElem The DOM Element (optional)
   */
  constructor(parent, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'day');
    super(parent, mainElem);
    this.childrenClass = Meal;
    // Header
    const headerElem = createChildElement(this.mainElem, 'div', 'day-header');
    // Delete button
    createDeleteElement(headerElem, () => this.destroy());
    // Title
    this.titleElem = createChildElement(headerElem, 'h4', 'day__title');
    setTimeout(() => this.updateTitle(), 0); // this needs to be pushed in parent's children array first to have an index
    // Arrows
    const arrowsElem = createChildElement(headerElem, 'div');
    this.arrowLeftElem = createChildElement(arrowsElem, 'div', 'img-arrow-left');
    this.arrowLeftElem.addEventListener('click', (event) => {
      callIfEnabled(() => this.self.index -= 1, event.target);
    });
    this.arrowRightElem = createChildElement(arrowsElem, 'img', 'img-arrow-right');
    this.arrowRightElem.addEventListener('click', (event) => {
      callIfEnabled(() => this.self.index += 1, event.target);
    });
    // Image sources set will be triggered by the parent.updateChildrenLook

    // Meals
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meals-row');
    this.childrenElem = createChildElement(this.childrenRowElem, 'div', 'meals');
    const addMealElem = createChildElement(this.childrenRowElem, 'input', 'add-meal');
    addMealElem.type = 'button';
    addMealElem.value = 'Ajouter un repas';
    addMealElem.addEventListener('click', () => this.self.addChild());
  }

  updateTitle() {
    this.titleElem.textContent = `Jour ${this.index + 1}`;
    // Get the day name if user selected the date already
    let dayName;
    if (this.parent.startDay) {
      dayName = dayjs(this.parent.startDay).add(this.index, 'days').format('dddd');
      this.titleElem.textContent += ` (${dayName})`;
    }
  }

  updateArrows() {
    // Is first day, disable the 'left' move arrow
    if (this.index === 0) {
      this.arrowLeftElem.classList.add('--disabled');
    } else {
      this.arrowLeftElem.classList.remove('--disabled');
    }
    // If last day, disable the 'right' move arrow
    if ((this.index + 1) === this.parent.children.length) {
      this.arrowRightElem.classList.add('--disabled');
    } else {
      this.arrowRightElem.classList.remove('--disabled');
    }
  }

  /**
   * Sorting children based on their timeElem.value.
   */
  sortChildren() {
    this.children.sort((childA, childB) => {
      // Empty times will be put at the end
      const valueA = childA.timeElem.value || '23:59:59';
      const valueB = childB.timeElem.value || '23:59:59';
      return dayjs(`2000-01-01 ${valueA}`) - dayjs(`2000-01-01 ${valueB}`);
    });
    this.sortChildrenElem();
  }

  updateChildren() {
    this.sortChildren();
    super.updateChildren();
  }

}

class Journal extends CoreObject {
  static childrenClass;
  dbPatients;
  dbFoods;

  /**
   * @param {HTMLElement} mainElem Form div
   */
  constructor(mainElem) {
    super(null, mainElem);
    this.childrenClass = Day;
    this.childrenRowElem = this.mainElem.querySelector('.days-row');
    this.childrenElem = this.mainElem.querySelector('.days');

    // Init datalists
    this.fetchPatients();
    this.fetchFoods();

    // Event listeners
    document.getElementById('new-journal').addEventListener(
      'click', event => this.self.handleCreateJournal(event));
    this.mainElem.querySelector('input[name=patient_fullname]').addEventListener(
      'change', event => this.self.handlePatientNameChange(event));
    this.mainElem.querySelector('input[name=patient_age]').addEventListener(
      'change', event => this.self.handlePatientAgeChange(event));
    this.mainElem.querySelector('input[name=patient_weight]').addEventListener(
      'change', event => this.self.handlePatientWeightChange(event));
    this.mainElem.querySelector('input[name=start_day]').addEventListener(
      'change', event => this.self.handleStartDayChange(event))
    
    document.getElementById('add-day').addEventListener(
      'click', () => this.self.addChild());
  }

  get form() {
    return this.mainElem.querySelector('#journal-form');
  }

  get patientId() {
    const id = this.mainElem.querySelector('input[name=patient_id]').value;
    return (id !== '') ? Number(id) : undefined;
  }

  /**
   * @param {Integer} id
   */
  set patientId(id) {
    this.mainElem.querySelector('input[name=patient_id]').value = (id !== undefined) ? String(id) : '';
  }

  get patient() {
    if (!this.patientId) return undefined;
    return this.dbPatients.find(patient => patient.id === this.patientId);
  }

  get patientAge() {
    const age = this.mainElem.querySelector('input[name=patient_age]').value;
    return (age !== '') ? Number(age) : undefined;
  }
  
  /**
   * @param {Integer} age
   */
  set patientAge(age) {
    this.mainElem.querySelector('input[name=patient_age]').value = age;
  }

  get patientWeight() {
    const weight = this.mainElem.querySelector('input[name=patient_weight]').value;
    return (weight !== '') ? Number(weight) : undefined;
  }

  get startDay() {
    return this.mainElem.querySelector('input[name=start_day]').value;
  }

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
      this.dbPatients = json.map(patient => {
        patient.fullNameAndGender = `${patient.last_name} ${patient.first_name} (${patient.gender.charAt(0)})`;
        return patient;
      });
    } catch (error) {
      console.error(error.message);
      return;
    }
    // Fill the datalist
    const patientsDataListElem = document.getElementById(PATIENTS_DATALIST);
    for (const patient of this.dbPatients) {
      const option = createChildElement(patientsDataListElem, 'option');
      option.value = patient.fullNameAndGender;
      option.dataset.patientId = patient.id;
    }
  }

  /**
   * Fetch Foods from API and fill the related DOM datalist
   */
  async fetchFoods() {
    try {
      // Fetching using API
      const response = await fetch(`${BASE_URL}/api/foods`);
      const json = await response.json();
      if (!response.ok) throw json;
      this.dbFoods = json;
    } catch (error) {
      console.error(error.stack);
      return;
    }
    // Fill the datalist
    const foodsDataListElem = document.getElementById(FOODS_DATALIST);
    for (const food of this.dbFoods) {
      createChildElement(foodsDataListElem, 'option').value = food.name_fr;
    }
  }

  async handleCreateJournal(event) {
    event.preventDefault();
    try {
      // POST fetch
      const response = await fetch(`${BASE_URL}/api/journal`, {
        method: 'POST'
      });
      const json = await response.json();
      if (!response.ok) throw json;
      this.id = json.id;
      event.target.style.display = 'none'; // Hide button
      this.mainElem.style.display = 'block'; // Show journal form
      app.successFeedback('Journal créé.');
    } catch (error) {
      console.log(error);
      app.errorFeedback(error.message);
      return;
    }
  }

  handlePatientNameChange(event) {
    const patientNameInputElem = event.target;
    patientNameInputElem.classList.remove('--is-danger');
    console.log('Name changed');
    // Check if name matches a Patient
    const patient = this.dbPatients.find(patient => patient.fullNameAndGender === patientNameInputElem.value);
    if(!patient) {
      this.patientId = undefined;
      if (patientNameInputElem.value !== '') {
        patientNameInputElem.classList.add('--is-danger');
      }
    } else {
      this.patientId = patient.id;
    }
    this.updatePatientAge();
    this.patchInDatabase();
  }
  
  handlePatientAgeChange(event) {
    this.patchInDatabase();
  }
  
  handlePatientWeightChange(event) {
    this.patchInDatabase();
  }
  
  handleStartDayChange(event) {
    this.updatePatientAge();
    this.patchInDatabase();
    this.updateChildrenLook();
  }
  
  addChild() {
    super.addChild();
    // Move scrollbar to the right (if visible)
    if (isScrollbarVisible(this.childrenRowElem)) {
      this.childrenRowElem.scrollLeft += this.childrenRowElem.scrollWidth;
    }
  }
  
  updatePatientAge() {
    // Enable age input only if patient or date is not specified
    const patientAgeInputElem = this.mainElem.querySelector('input[name=patient_age]');
    if (!this.patientId || !this.startDay) {
      patientAgeInputElem.readOnly = false;
      patientAgeInputElem.classList.remove('--is-readonly');
      return;
    }
    patientAgeInputElem.readOnly = true;
    patientAgeInputElem.classList.add('--is-readonly');
    // Calculate age
    this.patientAge = dayjs(this.startDay).diff(dayjs(this.patient.birth_date), 'years');
  }
  
  /**
   * Updates the children arrows and titles
  */
 updateChildrenLook() {
   this.children.forEach(child => {
     child.updateArrows();
     child.updateTitle();
    });
  }

  updateChildren() {
    this.sortChildrenElem();
    this.updateChildrenLook();
  }

  async patchInDatabase() {
    const formData = new FormData(this.form);
    try {
      const response = await fetch(`${BASE_URL}/api/journal/${this.id}`, {
        method: 'PATCH',
        body: formData
      });
      const json = await response.json();
      if (!response.ok) throw json;
      app.successFeedback('Journal mis à jour.');
    } catch (error) {
      console.log(error);
      app.errorFeedback(error.message);
      return;
    }
  }

}

const app = {
  feedbackElem: undefined,
  
  init: function () {
    app.journal = new Journal(document.getElementById('journal'));
    app.feedbackElem = document.getElementById('feedback');
    app.feedbackElem.addEventListener('click', app.clearFeedback);
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
}


app.init();