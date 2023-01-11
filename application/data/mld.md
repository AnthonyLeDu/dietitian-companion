```
PATIENT (_id_, last_name, first_name, gender)
FOOD_JOURNAL (id, patient_age, patient_weight, #PATIENT(id))
FOOD (_id_, name_fr, energy_kj, energy_kcal, water, protein, carbohydrate, ...)
DAY (_id_, position, #FOOD_JOURNAL(id))
MEAL (id, time, #DAY(id))
DISH (_id_, position, amount, #FOOD(id), #MEAL(id))
```