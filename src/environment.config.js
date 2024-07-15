const ENV = "local";

const ENVIRONMENT_LOCAL = {
  Base_API_URL: "http://192.168.1.27:5003/api",
  Base_IMAGE_URL: "https://192.168.1.27:5003/",
  Base_SITE_URL: "http://192.168.1.27:5003",
  Base_OCCASION: "26",
  Base_SEATING_PREFRENCE: "27",
  Base_DIETARY_RESTRICTION: "24",
  Base_PROFILE_TAGS: "32",
  Base_CALL_TAGS: "34",
  Base_MAIL_CHIMP_AUDIANCE_LIST: "33",
  Base_MATERIAL_TAGS: "37",
  Base_MARKETING_TAGS: "42",
  Base_MEAL_SESSION: "51",
  Base_STRIPE_KEY:
    "pk_test_51LND1mInhUzmZtb4aIy7Yv3f6n62GQHyRgkHVJioE33BxLHxTEiGTwMnb2NtxgRosDmQlaF8Tdw0ixENKlDOgLC200wSwF2s3R",
};

const ENVIRONMENT_DEVELOPMENT = {
  Base_API_URL: "https://dev.api.reservation.theadventus.com/api",
  Base_IMAGE_URL: "https://dev.api.reservation.theadventus.com/",
  Base_SITE_URL: "https://dev.reservation.theadventus.com",
  Base_OCCASION: "26",
  Base_SEATING_PREFRENCE: "27",
  Base_DIETARY_RESTRICTION: "24",
  Base_PROFILE_TAGS: "32",
  Base_CALL_TAGS: "34",
  Base_MAIL_CHIMP_AUDIANCE_LIST: "33",
  Base_MATERIAL_TAGS: "37",
  Base_MARKETING_TAGS: "42",
  Base_MEAL_SESSION: "51",
  Base_STRIPE_KEY:
    "pk_test_51LND1mInhUzmZtb4aIy7Yv3f6n62GQHyRgkHVJioE33BxLHxTEiGTwMnb2NtxgRosDmQlaF8Tdw0ixENKlDOgLC200wSwF2s3R",
};

const ENVIRONMENT_PRODUCTION = {
  Base_API_URL: "https://api.creat.sg/api",
  Base_IMAGE_URL: "https://api.creat.sg/",
  Base_SITE_URL: "https://api.creat.sg",
  Base_OCCASION: "26",
  Base_SEATING_PREFRENCE: "27",
  Base_DIETARY_RESTRICTION: "24",
  Base_PROFILE_TAGS: "32",
  Base_CALL_TAGS: "34",
  Base_MAIL_CHIMP_AUDIANCE_LIST: "33",
  Base_MATERIAL_TAGS: "37",
  Base_MARKETING_TAGS: "42",
  Base_MEAL_SESSION: "51",
  Base_STRIPE_KEY:
    "pk_live_51JhVWqLH6n6raFZu8UPbRQGT2Ba2jRQ3J4QFgHjZJQa5IxPbPcDYcMh4SpIGWr6AIlWVeljyuElLvMECZQv0NlZw00bptuQQHO",
};

let ENVIRONMENT_VARIABLES;

if (ENV === "local") {
  ENVIRONMENT_VARIABLES = ENVIRONMENT_LOCAL;
} else if (ENV === "development") {
  ENVIRONMENT_VARIABLES = ENVIRONMENT_DEVELOPMENT;
} else {
  ENVIRONMENT_VARIABLES = ENVIRONMENT_PRODUCTION;
}

export default ENVIRONMENT_VARIABLES;
