/* global app, BASE_URL, FOODS_DATALIST, CoreObject, createChildElement, createDeleteElement */

// eslint-disable-next-line no-unused-vars
class Dish extends CoreObject {
  static childrenClass; // undefined

  /**
   * Create the Dish DOM Element
   * @param {Meal} parent 
   * @param {Object} data Dish data to load
   * @param {HTMLElement} mainElem The DOM Element (optional)
   */
  constructor(parent, data, mainElem = null) {
    mainElem = mainElem || createChildElement(parent.childrenElem, 'div', 'dish');
    super(parent, mainElem);
    this.id = data.id;
    // Delete button
    createDeleteElement(this.mainElem, () => this.destroy());
    // Food selection
    this.foodElem = createChildElement(this.mainElem, 'input', 'dish__food');
    this.foodElem.setAttribute('list', FOODS_DATALIST);
    this.foodElem.required = true;
    this.foodElem.addEventListener('change', () => this.self.patchInDatabase());
    // Amount input
    this.amountElem = createChildElement(this.mainElem, 'input', 'dish__amount');
    this.amountElem.type = 'number';
    this.amountElem.step = '10';
    this.amountElem.min = '0';
    this.amountElem.addEventListener('change', () => this.self.patchInDatabase());

    createChildElement(this.mainElem, 'span').textContent = 'g';

    this.loadData(data);
  }

  set food(value) {
    this.foodElem.value = (value !== undefined) ? String(value) : '';
  }

  get food() {
    return this.foodElem.value === '' ? undefined : this.foodElem.value;
  }

  get foodCode() {
    if (!this.foodElem) return undefined;
    const food = app.dbFoods.find(food => food.name_fr === this.foodElem.value);
    if (!food) return undefined;
    return food.code;
  }

  set amount(value) {
    this.amountElem.value = (value !== undefined) ? String(value) : '';
  }

  get amount() {
    return this.amountElem.value ? Number(this.amountElem.value) : undefined;
  }

  /**
   * Load json data into the UI.
   */
  loadData(data) {
    if (data.food_code) {
      this.food = app.dbFoods.find(food => food.code === data.food_code)?.name_fr;
    }
    this.amount = data.amount;
  }

  /**
   * Patch in DB.
   */
  async patchInDatabase() {
    try {
      const formData = new FormData();
      formData.append('position', this.index);
      formData.append('food_code', this.foodCode || '');
      formData.append('amount', this.amount || '');

      // PATCH fetch
      const response = await fetch(`${BASE_URL}/api/dish/${this.id}`, {
        method: 'PATCH',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw json;
      app.successFeedback('Plat mis à jour.');
    }
    catch (error) {
      console.error(error);
      return app.errorFeedback(error.message);
    }
  }

}
