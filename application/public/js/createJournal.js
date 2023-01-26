// TODO: Récupération dynamique des dish et patients

const PATIENTS_DATALIST = 'patients-datalist'
const DISHES_DATALIST = 'dishes-datalist'

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
  console.log('ouep');
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
    console.log('toto');
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
    foodElem.setAttribute('list', DISHES_DATALIST);
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
    if (this.parent.startDate !== undefined) {
      const dayDate = new Date(this.parent.startDate.valueOf())
      dayDate.setDate(dayDate.getDate() + this.index)
      dayName = dayDate.toLocaleString('fr-FR', { weekday: 'long' });
    }
    if (dayName) {
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
      return Date.parse(`01/01/2000 ${valueA}`) - Date.parse(`01/01/2000 ${valueB}`);
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
  patientAge;
  patientWeight;
  #startDate;
  patientsDataListElem;
  dishesDataListElem;

  /**
   * @param {HTMLElement} mainElem Form div
   */
  constructor(mainElem) {
    super(null, mainElem);
    this.childrenClass = Day;
    this.childrenRowElem = document.getElementById('days-row');
    this.childrenElem = document.getElementById('days');

    // Init datalists
    this.patientsDataListElem = createChildElement(this.mainElem, 'datalist', null, PATIENTS_DATALIST);
    for (const val of ['M. Robert Dujardin (12/01/1980)', 'Mme Jacqueline Marin (25/12/1952)']) {
      createChildElement(this.patientsDataListElem, 'option').value = val;
    }
    this.dishesDataListElem = createChildElement(this.mainElem, 'datalist', null, DISHES_DATALIST);
    for (const val of ['Poulet', 'Frites', 'Boeuf']) {
      createChildElement(this.dishesDataListElem, 'option').value = val;
    }

    // Init event listeners
    document.getElementById('add-day').addEventListener('click', () => this.self.addChild());
  }

  get startDate() {
    if (!this.#startDate) {
      this.#startDate = document.getElementById('start-date').value;
      this.#startDate = this.#startDate !== '' ? new Date(this.#startDate) : undefined;
    }
  }

  addChild() {
    super.addChild();
    // Move scrollbar to the right (if visible)
    if (isScrollbarVisible(this.childrenRowElem)) {
      this.childrenRowElem.scrollLeft += this.childrenRowElem.scrollWidth;
    }
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

}

const app = {
  init: function () {
    app.journal = new Journal(document.getElementById('journal'));
  }
}


app.init();