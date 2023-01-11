require('dotenv').config({path: __dirname + '/../.env'});
console.log(process.env.DB_ENV);

const {
  Food,
  FoodGroup,
  FoodSubGroup,
  FoodSubSubGroup
} = require('../app/models/ciqual');

async function test() {
  const foods = await Food.findAll({
    include: ['food_grp', 'food_ssgrp', 'food_ssssgrp'],
    limit: 2
  });

  const foodsDisplay = foods.map(food => {
    return {
      name_fr: food.name_fr,
      group: food.food_grp.name_fr,
      sub_group: food.food_ssgrp.name_fr,
      sub_sub_group: food.food_ssssgrp.name_fr,
    }
  })
  console.log(foodsDisplay);
  process.exit(1);
}

test();
