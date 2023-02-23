const { Model } = require('sequelize');

/**
 * Core class for all the journal elements (Journal, Day, Meal and Dish).
 */
class JournalElement extends Model {
  nutrients; // calculateNutrients MUST be called and resolved before getting this property otherwise it will be undefined.
  nutrientsSources;

  getClassName() {
    return "JournalElement";
  }

  /**
   * Calculate the total nutrients amount by additionning
   * the nutrientsSources nutrients, doing so recursively.
   */
  async calculateNutrients() {
    const sourcesNutrients = await Promise.all(this.nutrientsSources
      // Gathering sources nutrients  
      .map(async source => await source.getNutrients()));

    // Cumulating nutrients amounts
    if (sourcesNutrients.length === 0) return; // Early return, this.nutrients remain undefined
    this.nutrients = JSON.parse(JSON.stringify(sourcesNutrients[0])) // Deep copy using JSON
    for (let i = 1; i < sourcesNutrients.length; i++) { // Skipping index 0 as it's alreay been used to init this.nutrients
      sourcesNutrients[i].forEach((sourceNutrient, j) => {
        this.nutrients[j].minAmount += sourceNutrient.minAmount;
        this.nutrients[j].maxAmount += sourceNutrient.maxAmount;
        this.nutrients[j].traces = this.nutrients[j].traces || sourceNutrient.traces;
      })
    }

    // Calculating average amount and margin once at the end
    this.nutrients = this.nutrients.map(nutrient => {
      nutrient.avgAmount = ((nutrient.minAmount + nutrient.maxAmount) / 2.0).toFixed(2);
      nutrient.amountMargin = ((nutrient.maxAmount - nutrient.minAmount) / 2.0).toFixed(2);
      return nutrient;
    });
  }

  async getNutrients() {
    if (this.nutrients === undefined) {
      await this.calculateNutrients();
    }
    return this.nutrients;
  }

}

module.exports = JournalElement;
