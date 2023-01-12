```
PATIENT (_id_, last_name, first_name, gender)
JOURNAL (id, patient_age, patient_weight, #PATIENT(id))
DAY (_id_, position, #JOURNAL(id))
MEAL (id, time, #DAY(id))
DISH (_id_, position, amount, #CIQUAL_FOOD(id), #MEAL(id))
```