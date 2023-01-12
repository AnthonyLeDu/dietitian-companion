require('dotenv').config({ path: __dirname + '/../.env' });
console.log(process.env.DB_ENV);

const {
  Food,
  FoodGroup,
  FoodSubGroup,
  FoodSubSubGroup
} = require('../app/models/ciqual');

const {
  Day,
  Dish,
  Journal,
  Meal,
  Patient
} = require('../app/models/food_journal');

async function logAllFoods() {
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
}

async function createPatient(first_name, last_name, gender) {
  const patient = await Patient.create({
    first_name,
    last_name,
    gender
  });
  console.log(patient);
  return patient;
}

async function createJournal(patient) {
  const journal = await Journal.create({
    patient_id: patient.id,
    patient_age: 25,
    patient_weight: 58,
  });
  console.log(journal);
}

async function test() {
  const [patient, created] = await Patient.findOrCreate({
    where: {
      first_name: 'Jeanine',
      last_name: 'Dupont',
      gender: 'Female',
      birth_date: new Date(1985, 07, 15)
    }
  });
  if (created) {
    console.log('New patient created!');
  }
  await createJournal(patient);

  process.exit(1);
}

test();