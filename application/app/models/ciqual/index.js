const Food = require("./food");
const FoodGroup = require("./food_grp");
const FoodSubGroup = require("./food_ssgrp");
const FoodSubSubGroup = require("./food_ssssgrp");

// Food-FoodGroup association

FoodGroup.hasMany(Food, {
  as: 'foods',
  foreignKey: 'food_grp_code'
});

Food.belongsTo(FoodGroup, {
  as: 'food_grp',
  foreignKey: 'food_grp_code'
});

// Food-FoodSubGroup association

FoodSubGroup.hasMany(Food, {
  as: 'foods',
  foreignKey: 'food_ssgrp_code'
});

Food.belongsTo(FoodSubGroup, {
  as: 'food_ssgrp',
  foreignKey: 'food_ssgrp_code'
});


// Food-FoodSubSubGroup association

FoodSubSubGroup.hasMany(Food, {
  as: 'foods',
  foreignKey: 'food_ssssgrp_code'
});

Food.belongsTo(FoodSubSubGroup, {
  as: 'food_ssssgrp',
  foreignKey: 'food_ssssgrp_code'
});


module.exports = { Food, FoodGroup, FoodSubGroup, FoodSubSubGroup };
