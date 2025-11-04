// Test script to analyze language counts
const EU_LABEL_POS = {
  FR: { x: 420, y: 450, lang: "fr", name: "France" },
  ES: { x: 350, y: 550, lang: "es", name: "Spain" },
  DE: { x: 520, y: 350, lang: "de", name: "Germany" },
  IT: { x: 520, y: 520, lang: "it", name: "Italy" },
  GB: { x: 350, y: 300, lang: "en-GB", name: "United Kingdom" },
  PT: { x: 280, y: 550, lang: "pt", name: "Portugal" },
  NL: { x: 450, y: 320, lang: "nl", name: "Netherlands" },
  BE: { x: 450, y: 380, lang: "nl", name: "Belgium" },
  SE: { x: 620, y: 200, lang: "sv", name: "Sweden" },
  NO: { x: 520, y: 150, lang: "no", name: "Norway" },
  PL: { x: 650, y: 350, lang: "pl", name: "Poland" },
  GR: { x: 700, y: 580, lang: "el", name: "Greece" },
  AT: { x: 580, y: 430, lang: "de", name: "Austria" },
  CH: { x: 480, y: 450, lang: "de", name: "Switzerland" },
  CZ: { x: 580, y: 400, lang: "cs", name: "Czech Republic" },
  DK: { x: 540, y: 280, lang: "da", name: "Denmark" },
  FI: { x: 680, y: 200, lang: "fi", name: "Finland" },
  HU: { x: 650, y: 450, lang: "hu", name: "Hungary" },
  IE: { x: 300, y: 350, lang: "en", name: "Ireland" },
  RO: { x: 750, y: 480, lang: "ro", name: "Romania" },
  SK: { x: 650, y: 420, lang: "sk", name: "Slovakia" },
  SI: { x: 580, y: 460, lang: "sl", name: "Slovenia" },
  HR: { x: 620, y: 480, lang: "hr", name: "Croatia" },
  BG: { x: 750, y: 520, lang: "bg", name: "Bulgaria" },
  RS: { x: 680, y: 500, lang: "sr", name: "Serbia" },
  BA: { x: 640, y: 500, lang: "bs", name: "Bosnia and Herzegovina" },
  LT: { x: 720, y: 320, lang: "lt", name: "Lithuania" },
  LV: { x: 720, y: 290, lang: "lv", name: "Latvia" },
  EE: { x: 720, y: 260, lang: "et", name: "Estonia" },
};

// Get unique language codes
const uniqueLanguages = new Set();
Object.values(EU_LABEL_POS).forEach(labelData => {
  // Handle language codes like "en-GB" by extracting the base language
  const baseLang = labelData.lang.split('-')[0];
  uniqueLanguages.add(baseLang);
});

const targetLanguages = Array.from(uniqueLanguages);

console.log("LANGS:", targetLanguages);
console.log(`Total countries in EU_LABEL_POS: ${Object.keys(EU_LABEL_POS).length}`);
console.log(`Unique languages found: ${targetLanguages.length}`);
console.log("Language breakdown:");
targetLanguages.forEach(lang => console.log(`  - ${lang}`));