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

/**
 * Cities per state/region, driving the domestic-pricing City dropdowns. Covers
 * every state in `STATES_BY_COUNTRY`; any state without an entry falls back to a
 * free-text city input (see `citiesForState`). Extend with more towns as needed.
 */
export const CITIES_BY_STATE: Record<string, string[]> = {
  // --- Nigeria -------------------------------------------------------------
  Abia: ["Umuahia", "Aba", "Ohafia", "Arochukwu", "Bende", "Isuikwuato"],
  Adamawa: ["Yola", "Jimeta", "Mubi", "Numan", "Ganye", "Michika"],
  "Akwa Ibom": ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Ikot Abasi"],
  Anambra: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Ihiala", "Aguleri"],
  Bauchi: ["Bauchi", "Azare", "Misau", "Jama'are", "Katagum", "Tafawa Balewa"],
  Bayelsa: ["Yenagoa", "Brass", "Ogbia", "Sagbama", "Nembe", "Kaiama"],
  Benue: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala", "Vandeikya", "Adikpo"],
  Borno: ["Maiduguri", "Bama", "Biu", "Dikwa", "Gwoza", "Monguno"],
  "Cross River": ["Calabar", "Ugep", "Ikom", "Ogoja", "Obudu", "Obubra"],
  Delta: ["Asaba", "Warri", "Ughelli", "Sapele", "Agbor", "Effurun", "Oleh"],
  Ebonyi: ["Abakaliki", "Afikpo", "Onueke", "Ezza", "Ishielu"],
  Edo: ["Benin City", "Auchi", "Ekpoma", "Uromi", "Igarra", "Sabongida-Ora"],
  Ekiti: ["Ado-Ekiti", "Ikere", "Ikole", "Ijero", "Emure", "Ilawe"],
  Enugu: ["Enugu", "Nsukka", "Oji River", "Awgu", "Agbani", "Udi"],
  "FCT - Abuja": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa", "Lugbe", "Nyanya", "Gwagwalada", "Kuje"],
  Gombe: ["Gombe", "Kumo", "Billiri", "Dukku", "Kaltungo", "Bajoga"],
  Imo: ["Owerri", "Orlu", "Okigwe", "Mbaise", "Oguta", "Mbaitoli"],
  Jigawa: ["Dutse", "Hadejia", "Gumel", "Kazaure", "Birnin Kudu", "Ringim"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Sabon Gari", "Zonkwa", "Kagoro"],
  Kano: ["Kano", "Wudil", "Gwarzo", "Rano", "Bichi", "Gaya", "Dawakin Tofa"],
  Katsina: ["Katsina", "Daura", "Funtua", "Malumfashi", "Dutsin-Ma", "Kankia"],
  Kebbi: ["Birnin Kebbi", "Argungu", "Yauri", "Zuru", "Jega", "Bunza"],
  Kogi: ["Lokoja", "Okene", "Kabba", "Idah", "Ankpa", "Anyigba", "Dekina"],
  Kwara: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi", "Jebba", "Patigi"],
  Lagos: ["Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Ikorodu", "Badagry", "Epe", "Ajah", "Apapa", "Agege", "Oshodi", "Mushin", "Festac", "Alimosho"],
  Nasarawa: ["Lafia", "Keffi", "Akwanga", "Nasarawa", "Karu", "Doma"],
  Niger: ["Minna", "Bida", "Suleja", "Kontagora", "Lapai", "New Bussa"],
  Ogun: ["Abeokuta", "Ijebu Ode", "Sagamu", "Ota", "Ilaro", "Ijebu-Igbo", "Sango Ota"],
  Ondo: ["Akure", "Ondo", "Owo", "Ikare", "Okitipupa", "Ore", "Idanre"],
  Osun: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo", "Ikirun", "Ejigbo"],
  Oyo: ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki", "Eruwa", "Igboho"],
  Plateau: ["Jos", "Bukuru", "Pankshin", "Shendam", "Barkin Ladi", "Vom"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Okrika", "Oyigbo", "Ahoada"],
  Sokoto: ["Sokoto", "Tambuwal", "Wurno", "Illela", "Gwadabawa", "Bodinga"],
  Taraba: ["Jalingo", "Wukari", "Bali", "Gembu", "Mutum Biyu", "Ibi"],
  Yobe: ["Damaturu", "Potiskum", "Gashua", "Nguru", "Geidam", "Buni Yadi"],
  Zamfara: ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka", "Gummi", "Maru"],
  // --- Ghana ---------------------------------------------------------------
  "Greater Accra": ["Accra", "Tema", "Madina", "Ashaiman", "Teshie", "Dansoman", "Nungua"],
  Ashanti: ["Kumasi", "Obuasi", "Ejisu", "Konongo", "Mampong", "Bekwai", "Tafo"],
  Western: ["Sekondi-Takoradi", "Tarkwa", "Axim", "Prestea", "Half Assini", "Elubo"],
  Central: ["Cape Coast", "Kasoa", "Winneba", "Elmina", "Swedru", "Mankessim", "Saltpond"],
  Eastern: ["Koforidua", "Nkawkaw", "Akosombo", "Suhum", "Begoro", "Mpraeso", "Akim Oda"],
  Volta: ["Ho", "Keta", "Hohoe", "Aflao", "Kpando", "Anloga", "Denu"],
  Northern: ["Tamale", "Yendi", "Savelugu", "Bimbilla", "Gushegu", "Tolon"],
  "Upper East": ["Bolgatanga", "Bawku", "Navrongo", "Zebilla", "Paga", "Sandema"],
  "Upper West": ["Wa", "Lawra", "Jirapa", "Tumu", "Nadowli", "Nandom"],
  Bono: ["Sunyani", "Berekum", "Dormaa Ahenkro", "Wenchi", "Sampa"],
  Ahafo: ["Goaso", "Bechem", "Hwidiem", "Kenyasi", "Duayaw Nkwanta"],
  Oti: ["Dambai", "Jasikan", "Kadjebi", "Nkwanta", "Kete Krachi"],
  Savannah: ["Damongo", "Bole", "Salaga", "Sawla", "Buipe"],
  "North East": ["Nalerigu", "Walewale", "Gambaga", "Chereponi", "Bunkpurugu"],
  "Bono East": ["Techiman", "Kintampo", "Atebubu", "Nkoranza", "Yeji"],
  "Western North": ["Sefwi Wiawso", "Bibiani", "Enchi", "Juaboso", "Bodi"],
};

/** City options for a given state (empty array → callers use a free-text input). */
export function citiesForState(state?: string): string[] {
  if (!state) return [];
  return CITIES_BY_STATE[state] ?? [];
}
