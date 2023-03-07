/* global FOODS_DATALIST, CoreObject, createChildElement, createDeleteElement */

// eslint-disable-next-line no-unused-vars
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
