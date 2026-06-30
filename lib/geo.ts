/**
 * Built-in geo data for the pricing location pickers.
 * The backend has no countries/states endpoint and stores `fromWhere`/`toWhere`
 * as free strings, so these lists drive the dropdowns only. Extend as needed.
 */

export const COUNTRIES: string[] = [
  "Nigeria",
  "Ghana",
  "South Africa",
  "Kenya",
  "Egypt",
  "Morocco",
  "Ivory Coast",
  "Senegal",
  "Cameroon",
  "Tanzania",
  "Uganda",
  "Rwanda",
  "Ethiopia",
  "United Kingdom",
  "United States",
  "Canada",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Belgium",
  "Ireland",
  "Portugal",
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Turkey",
  "India",
  "China",
  "Hong Kong",
  "Singapore",
  "Malaysia",
  "Japan",
  "South Korea",
  "Australia",
  "Brazil",
];

/** States / regions per country (domestic shipping). Nigeria is primary. */
export const STATES_BY_COUNTRY: Record<string, string[]> = {
  Nigeria: [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ],
  Ghana: [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Volta",
    "Northern",
    "Upper East",
    "Upper West",
    "Bono",
    "Ahafo",
    "Oti",
    "Savannah",
    "North East",
    "Bono East",
    "Western North",
  ],
};

/** Countries we have state data for (selectable for domestic pricing). */
export const DOMESTIC_COUNTRIES = Object.keys(STATES_BY_COUNTRY);

/** Find which domestic country a saved state belongs to (for edit prefill). */
export function countryForState(state?: string): string | undefined {
  if (!state) return undefined;
  return DOMESTIC_COUNTRIES.find((c) => STATES_BY_COUNTRY[c].includes(state));
}
