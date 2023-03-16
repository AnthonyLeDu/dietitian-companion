/* global userFeedback, BASE_URL, CoreObject, Dish, createChildElement, createDeleteElement */

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
    this.id = data.id;
    this.childrenClass = Dish;

    const headerElem = createChildElement(this.mainElem, 'div', 'meal-header');
    // Delete button
    createDeleteElement(headerElem, () => this.handleDelete());
    // Title
    const titleElem = createChildElement(headerElem, 'h5', 'meal__title');
    titleElem.textContent = 'Repas de';
    // Time
    this.timeElem = createChildElement(headerElem, 'input');
    this.timeElem.type = 'time';
    this.timeElem.required = true;
    this.timeElem.onkeydown = 'return false';
    this.timeElem.name = `day${this.parent.index}-meal${this.index}__time`;
    this.timeElem.addEventListener('change', () => this.self.handleTimeChange());
    // Dishes
    this.childrenRowElem = createChildElement(this.mainElem, 'div', 'meal-row');
    this.childrenElem = createChildElement(this.childrenRowElem, 'div', 'dishes');
    const addDishElem = createChildElement(this.childrenRowElem, 'input', 'add-dish');
    addDishElem.type = 'button';
    addDishElem.value = 'Ajouter un aliment';
    addDishElem.addEventListener('click', () => this.self.postChild());

    this.loadData(data);
  }

  get time() {
    return this.timeElem.value;
  }

  set time(value) {
    this.timeElem.value = value;
  }

  /**
   * Load json data into the UI.
   */
  loadData(data) {
    this.time = data.time;
    // Load dishes
    data.dishes?.forEach((dishData) => this.addChild(dishData));
  }

  /**
   * Sort the Day's Meals and patch Meals in DB
   */
  handleTimeChange() {
    this.parent.updateChildren();
  }

  /**
   * Post a new Dish for this Meal in the DB.
   * @returns {Object} Created Dish data object.
   */
  async postChild() {
    try {
      const formData = new FormData();
      formData.append('meal_id', this.id);
      // POST fetch
      const response = await fetch(`${BASE_URL}/api/dish`, {
        method: 'POST',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw json;
      this.addChild(json);
    }
    catch (error) {
      return userFeedback.error(error);
    }
  }

  /**
   * Patch in DB.
   */
  async patchInDatabase() {
    // TODO : each component should store what's meant to be patched in DB so we can use a generic patchInDatabase method (in CoreObject).
    try {
      const formData = new FormData();
      formData.append('time', this.time);
      // PATCH fetch
      const response = await fetch(`${BASE_URL}/api/meal/${this.id}`, {
        method: 'PATCH',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw json;
      userFeedback.success('Repas mis à jour.');
    }
    catch (error) {
      return userFeedback.error(error);
    }
  }

  /**
   * Delete in DB and UI.
   */
  async handleDelete() {
    try {
      // DELETE fetch
      const response = await fetch(`${BASE_URL}/api/meal/${this.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(response.statusText);
      userFeedback.success('Repas supprimé.');
      this.destroy();
    }
    catch (error) {
      return userFeedback.error(error);
    }
  }

}
