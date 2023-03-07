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
