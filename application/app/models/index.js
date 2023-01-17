// Ciqual models
const { FoodGroup, FoodSubGroup, FoodSubSubGroup, Food } = require("./ciqual");
// Food journal models
const { Day, Dish, Journal, Meal, Patient } = require("./food_journal");

module.exports = {
  Food,
  FoodGroup,
  FoodSubGroup,
  FoodSubSubGroup,
  Day,
  Dish,
  Journal,
  Meal,
  Patient
};