```
FOOD (_id_, name_fr, energy_kj, energy_kcal, water, protein, carbohydrate, ...)
DAY (_id_, week_day, #WEEK(id))
PATIENT (_id_, last_name, first_name, gender)
DISH (_id_, position, amount, #FOOD(id), #MEAL(id))
DIET_RECORD (id, patient_age, patient_weight, #PATIENT(id))
MEAL (id, time, #DAY(id))
SEMAINE (_code semaine_, position dans le relevé, #code ration)
```