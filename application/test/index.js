require('dotenv').config({ path: __dirname + '/../.env' });

const {
  Food,
  FoodGroup,
  FoodSubGroup,
  FoodSubSubGroup,
  Day,
  Dish,
  Journal,
  Meal,
  Patient
} = require('../app/models');

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

async function createPatientAndJournal() {

  async function createJournal(patient) {
    const journal = await Journal.create({
      patient_id: patient.id,
      start_day: new Date(2023, 01, 01),
      patient_age: 68,
      patient_weight: 75,
    });
    // console.log(journal);
    return journal;
  }

  const [patient, created] = await Patient.findOrCreate({
    where: {
      first_name: 'Gégé',
      last_name: 'Rardrard',
      gender: 'Homme',
      birth_date: new Date(1950, 12, 25)
    }
  });
  if (created) {
    console.log('New patient created!');
  }
  const journal = await createJournal(patient);
  return journal;
}

async function fillJournal() {
  const journal = await createPatientAndJournal();
  console.log(journal.toJSON());
  // Days
  for (let d = 7; d > 0; d--) {
    const day = await Day.create({
      position: d,
      journal_id: journal.id
    });
    day.save();
    // Meals
    for (let m = 0; m <= 4; m++) {
      const meal = await Meal.create({
        time: `${Math.round(Math.random() * 24)}:${Math.round(Math.random() * 60)}`,
        day_id: day.id
      })
      meal.save();
      // Dishes
      for (let m = 6; m > 0; m--) {
        const dish = await Dish.create({
          meal_id: meal.id,
          position: m,
          amount: Math.round(Math.random() * 1000),
          food_code: [25626, 25200, 9874][Math.round(Math.random() * 2)]
        });
        dish.save();
      }
    }
  }
}

/**
 * Générateur de promesse
 * @param {Integer} delay Délai en ms avant la résolution de la promesse
 * @param {*} val Valeur du résultat de la promesse
 * @returns La promesse
 */
function makePromise(delay, val) {
  return new Promise(resolve => {
    setTimeout(() => resolve(val), delay);
  });
}

/**
 * Retourne le jour de la semaine en fonction de son index (0-6)
 * @param {Integer} dayId Index du jour de la semaine (0 = Lundi)
 * @returns {String} Le jour de la semaine en français
 */
async function dayName(dayId) {
  const value = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'][dayId];
  return makePromise(1000, value);
}

async function getYearData() {
  // Définition en dur de l'année
  const year = {
    id: 2023,
    weeks: [
      {
        id: 0,
        days: [{ id: 0 }, { id: 1 }, { id: 2 }]
      },
      {
        id: 1,
        days: [{ id: 0 }, { id: 1 }, { id: 2 }]
      }
      // ...
    ]
  };
  
  // Début des embrouilles
  // year.weeks.forEach(async week => {
  //   await week.days.forEach(async day => {
  //     day.name = await dayName(day.id); // Récupère le nom du jour (promesse, donc await)
  //     console.log(day.name);
  //   })
  // })

  for (const week of year.weeks) {
    for (const day of week.days) {
      day.name = await dayName(day.id);
    }
  }

  return year;
}

async function test() {
  await fillJournal();
  // const year = await getYearData();
  // console.table(await year.weeks[0]);

  process.exit(1);
}

test();