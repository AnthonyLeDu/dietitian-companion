/* global CoreObject, Dish, createChildElement, createDeleteElement */

// eslint-disable-next-line no-unused-vars
class Meal extends CoreObject {
  static childrenClass; // Dish
  timeElem;

  /**
   * Create the Meal DOM Element
   * @param {Day} parent 
   * @param {Object} data Meal data to load
   * @param {HTMLElement} mainElem The DOM Element (optional)
   */
  constructor(parent, data, mainElem = null) {
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
    this.timeElem.onkeydown = 'return false';
    this.timeElem.name = `day${this.parent.index}-meal${this.index}__time`;
    this.timeElem.addEventListener('change', () => this.self.parent.sortChildren());
    // Dishes
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meal-row');
    this.childrenElem = createChildElement(this.childrenRowElem, 'div', 'dishes');
    const addDishElem = createChildElement(this.childrenRowElem, 'input', 'add-dish');
    addDishElem.type = 'button';
    addDishElem.value = 'Ajouter un aliment';
    addDishElem.addEventListener('click', () => this.self.createChild());
  }

}
