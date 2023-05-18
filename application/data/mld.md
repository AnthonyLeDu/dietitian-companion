```
PATIENT (id, last_name, first_name, gender, birth_date)
JOURNAL (id, start_day, patient_age, patient_weight, patient_pregnant, patient_nursing, patient_menopausal, patient_heavy_menses, #PATIENT(id))
DAY (id, position, #JOURNAL(id))
MEAL (id, time, #DAY(id))
DISH (id, food_code, position, amount, #MEAL(id))
```