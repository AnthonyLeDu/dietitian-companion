BEGIN;

SET client_encoding to UTF8;

DROP TABLE IF EXISTS
  "dish",
  "meal",
  "day",
  "journal",
  "patient"
;

CREATE TABLE "patient"
(
    "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "last_name"	VARCHAR(128) NOT NULL,
    "first_name" VARCHAR(128) NOT NULL,
    "gender" VARCHAR(32) NOT NULL,
    "birth_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ,
    UNIQUE ("last_name", "first_name", "gender", "birth_date")
);

CREATE TABLE "journal"
(
    "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "patient_age" INT,
    "patient_weight" INT,
    "patient_pregnant" BOOLEAN,
    "patient_nursing" BOOLEAN,
    "patient_menopausal" BOOLEAN,
    "patient_heavy_menses" BOOLEAN,
    "start_day" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ,
    "patient_id" INT REFERENCES "patient"("id") ON DELETE CASCADE
);

CREATE TABLE "day"
(
    "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "position" INT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ,
    "journal_id" INT  REFERENCES "journal"("id") ON DELETE CASCADE NOT NULL
);

CREATE TABLE "meal"
(
    "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "time" TIME WITHOUT TIME ZONE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ,
    "day_id" INT REFERENCES "day"("id") ON DELETE CASCADE NOT NULL
);

CREATE TABLE "dish"
(
    "id" INT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    "position" INT,
    "amount" INT,
    "food_code" INT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ,
    "meal_id" INT REFERENCES "meal"("id") ON DELETE CASCADE NOT NULL
);

COMMIT;