// TODO: Ré-organisation des repas quand heure changée, suppression des éléments, récupération dynamique des dish et patients

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
  index;
  mainElem;
  children; // Array of children CoreObjects
  childrenRowElem;
  childrenElem;

  /**
   * @param {HTMLElement} mainElem Corresponding DOM Element
   * @param {CoreObject} parent Parent CoreObject
   * @param {Number} index Index in the siblings array
  */
  constructor(parent = null, index = null, mainElem = null) {
    this.parent = parent;
    this.index = index;
    this.mainElem = mainElem;
    this.children = [];
    // Needed for eventListeners definition because 'this' corresponds
    // to the clicked element in addEventListener handlers.
    this.self = this;
  }

  addChild(mainElem = null) {
    this.children.push(
      new this.childrenClass(this, this.children.length, mainElem));
  }

  getChildAt(index) {
    return this.children.find(child => child.index === index);
  }

  /**
   * Switch to children in the children array and update the DOM acccordingly.
   * @param {Integer} firstChildIndex First child's index property value
   * @param {Integer} secondChildIndex Second child's index property value
   */
  switchChildren(firstChildIndex, secondChildIndex) {
    if (firstChildIndex === secondChildIndex) return;

    const firstChild = this.getChildAt(firstChildIndex);
    if (!firstChild) throw new Error(`Child index '${firstChildIndex}' not found in ${this.constructor.name} children.`);
    const secondChild = this.getChildAt(secondChildIndex);
    if (!secondChild) throw new Error(`Child index '${secondChildIndex}' not found in ${this.constructor.name} children.`);

    firstChild.index = secondChildIndex;
    secondChild.index = firstChildIndex;
    this.sortChildren();
  }

  sortChildren() {
    this.children.sort((childA, childB) => childA.index - childB.index);
    this.children.forEach((child, index) => {
      const htmlElem = this.self.childrenElem.children[index];
      if (htmlElem !== child.mainElem) { // Element is not at expected position, insert it
        this.self.childrenElem.insertBefore(child.mainElem, htmlElem);
      }
    });
    this.children.forEach(child => child.updateArrows());
  }
}

class Dish extends CoreObject {
  static childrenClass; // undefined

  /**
   * Create the Dish DOM Element
   * @param {Meal} parent 
   * @param {Number} index Index in the Meal parent's Dish instances array
   */
  constructor(parent, index, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'dish');
    super(parent, index, mainElem);
    const dishCodeName = `day${this.parent.parent.index}-meal${this.parent.index}-dish${this.index}`;
    // Delete button
    const deleteElem = createChildElement(this.mainElem, 'div', 'img-trash');
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

  /**
   * Create the Meal DOM Element
   * @param {Day} parent 
   * @param {Number} index Index in the Day parent's Meal instances array
   */
  constructor(parent, index, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'meal');
    super(parent, index, mainElem);
    this.childrenClass = Dish;

    const headerElem = createChildElement(this.mainElem, 'div', 'meal-header');
    // Delete button
    const deleteElem = createChildElement(headerElem, 'div', 'img-trash');
    // Title
    const titleElem = createChildElement(headerElem, 'h5', 'meal__title');
    titleElem.textContent = 'Repas de';
    // Time
    const timeElem = createChildElement(headerElem, 'input');
    timeElem.type = 'time';
    timeElem.required = true;
    timeElem.name = `day${this.parent.index}-meal${this.index}__time`;
    // Dishes
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meal-row');
    this.childrenElem = createChildElement(this.childrenRowElem, 'div', 'dishes');
    const addDishElem = createChildElement(this.childrenRowElem, 'input', 'add-dish');
    addDishElem.type = 'button';
    addDishElem.value = 'Ajouter un aliment';
    addDishElem.addEventListener('click', () => this.self.addChild());
    // Auto-add one dish
    this.addChild();
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
   * @param {Number} index Index in the Journal parent's Day instances array
   */
  constructor(parent, index, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'day');
    super(parent, index, mainElem);
    this.childrenClass = Meal;
    // Header
    const headerElem = createChildElement(this.mainElem, 'div', 'day-header');
    const deleteElem = createChildElement(headerElem, 'div', 'img-trash');
    this.titleElem = createChildElement(headerElem, 'h4', 'day__title');
    this.updateTitle();
    // Arrows
    const arrowsElem = createChildElement(headerElem, 'div');
    this.arrowLeftElem = createChildElement(arrowsElem, 'div', 'img-arrow-left');
    this.arrowLeftElem.addEventListener('click', (event) => {
      callIfEnabled(() => this.self.move(-1), event.target);
    });
    this.arrowRightElem = createChildElement(arrowsElem, 'img', 'img-arrow-right');
    this.arrowRightElem.addEventListener('click', (event) => {
      callIfEnabled(() => this.self.move(1), event.target);
    });
    // Image sources set will be triggered by the parent.updateDaysArrows

    // Meals
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meals-row');
    this.childrenElem = createChildElement(this.mainElem, 'div', 'meals');
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
   * In the parent's children array, move this instance nth time in the direction
   * given by the positive/negative nature of increment.
   * @param {Integer} increment Positive increment = to the right ; negative increment = to the left.
   */
  move(increment) {
    this.parent.switchChildren(this.index, this.index + increment);
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
    super(null, null, mainElem);
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
    this.updateDaysArrows();
    // Move scrollbar to the right (if visible)
    if (isScrollbarVisible(this.childrenRowElem)) {
      this.childrenRowElem.scrollLeft += this.childrenRowElem.scrollWidth;
    }
  }

  updateDaysArrows() {
    this.children.forEach(day => day.updateArrows());
  }

}

const app = {
  init: function () {
    app.journal = new Journal(document.getElementById('journal'));
  }
}


app.init();