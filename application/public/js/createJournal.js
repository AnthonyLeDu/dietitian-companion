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
    // this.childrenClass = Dish;

    // Header
    const headerElem = createChildElement(this.mainElem, 'div', 'meal-header');
    const clockElem = createChildElement(headerElem, 'img', 'img-clock');
    clockElem.src = '../../public/images/clock.svg';
    const timeElem = createChildElement(headerElem, 'input');
    timeElem.type = 'time';
    timeElem.required = true;
    timeElem.name = `day${this.parent.index}-meal${this.index}__time`;
    const deleteElem = createChildElement(headerElem, 'span');
    deleteElem.textContent = 'X';
  }

}

class Day extends CoreObject {
  static childrenClass;
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

    const dayHeaderElem = createChildElement(this.mainElem, 'div', 'day-header');
    this.titleElem = createChildElement(dayHeaderElem, 'h4', 'day__title');
    this.updateTitle();
    // Header-Arrows
    const dayArrowsElem = createChildElement(dayHeaderElem, 'div');
    this.arrowLeftElem = createChildElement(dayArrowsElem, 'img', 'move-arrow');
    this.arrowLeftElem.alt = 'Move day to the left';
    this.arrowRightElem = createChildElement(dayArrowsElem, 'img', 'move-arrow');
    this.arrowRightElem.alt = 'Move day to the right';
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
      this.arrowLeftElem.src = '../../public/images/arrow_left_off.svg';
      this.arrowLeftElem.classList.add('--off');
    } else {
      this.arrowLeftElem.src = '../../public/images/arrow_left.svg';
      this.arrowLeftElem.classList.remove('--off');
    }
    // If last day, disable the 'right' move arrow
    if ((this.index + 1) === this.parent.children.length) {
      this.arrowRightElem.src = '../../public/images/arrow_right_off.svg';
      this.arrowRightElem.classList.add('--off');
    } else {
      this.arrowRightElem.src = '../../public/images/arrow_right.svg';
      this.arrowRightElem.classList.remove('--off');
    }
  }

  // addChild() {
  //   super();
  // }

}

class Journal extends CoreObject {
  static childrenClass;
  patientAge;
  patientWeight;
  #startDate;

  /**
   * @param {HTMLElement} mainElem Form div
   */
  constructor(mainElem) {
    super(null, null, mainElem);
    this.childrenClass = Day;
    this.childrenRowElem = document.getElementById('days-row');
    this.childrenElem = document.getElementById('days');

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