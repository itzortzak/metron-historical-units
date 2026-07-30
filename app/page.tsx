"use client";

import { useMemo, useState } from "react";
import { parseLocalizedNumber } from "./parse-number.mjs";

type UnitKind = "modern" | "historical";

type Unit = {
  id: string;
  name: string;
  symbol: string;
  system: string;
  toBase: number;
  kind: UnitKind;
  note: string;
  relation?: string;
};

type Example = {
  label: string;
  value: string;
  from: string;
  to: string;
};

type Category = {
  id: string;
  short: string;
  name: string;
  catalogTitle: string;
  description: string;
  baseName: string;
  baseSymbol: string;
  defaults: [string, string];
  examples: Example[];
  units: Unit[];
};

const SOURCES = {
  agora:
    "https://www.ascsa.edu.gr/uploads/media/oa_ebooks/oa_agora/Agora_X.pdf",
  treccani:
    "https://www.treccani.it/enciclopedia/gli-strumenti-dello-scambio-i-sistemi-di-misura_%28Il-Mondo-dell%27Archeologia%29/",
  stelai: "https://www.ascsa.edu.gr/uploads/media/hesperia/147037.pdf",
  dyas:
    "https://humanitiesthesaurus.academyofathens.gr/HUMANITIES-THESAURUS/en/page/?uri=https%3A%2F%2Fhumanitiesthesaurus.academyofathens.gr%2Fdyas-resource%2FConcept%2F2363",
  bipm: "https://www.bipm.org/en/publications/si-brochure",
  nist:
    "https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors",
};

const categories: Category[] = [
  {
    id: "length",
    short: "ΜΗΚ",
    name: "Μήκος",
    catalogTitle: "Οι μονάδες του μήκους.",
    description: "Από τον δάκτυλο και τον αττικό πόδα έως το μίλι.",
    baseName: "μέτρο",
    baseSymbol: "m",
    defaults: ["stadion-attic", "m"],
    examples: [
      { label: "1 στάδιον → m", value: "1", from: "stadion-attic", to: "m" },
      { label: "6 πόδες → m", value: "6", from: "pous-attic", to: "m" },
      { label: "1 μίλι → km", value: "1", from: "mile", to: "km" },
    ],
    units: [
      { id: "mm", name: "Χιλιοστόμετρο", symbol: "mm", system: "SI", toBase: 0.001, kind: "modern", note: "Ακριβής δεκαδική υποδιαίρεση του μέτρου." },
      { id: "cm", name: "Εκατοστόμετρο", symbol: "cm", system: "SI", toBase: 0.01, kind: "modern", note: "Ακριβής δεκαδική υποδιαίρεση του μέτρου." },
      { id: "m", name: "Μέτρο", symbol: "m", system: "SI", toBase: 1, kind: "modern", note: "Βασική μονάδα μήκους στο SI." },
      { id: "km", name: "Χιλιόμετρο", symbol: "km", system: "SI", toBase: 1000, kind: "modern", note: "1.000 μέτρα ακριβώς." },
      { id: "inch", name: "Ίντσα", symbol: "in", system: "Διεθνές", toBase: 0.0254, kind: "modern", note: "Ορίζεται ακριβώς ως 25,4 mm." },
      { id: "foot", name: "Πόδι", symbol: "ft", system: "Διεθνές", toBase: 0.3048, kind: "modern", note: "Ορίζεται ακριβώς ως 0,3048 m." },
      { id: "yard", name: "Γιάρδα", symbol: "yd", system: "Διεθνές", toBase: 0.9144, kind: "modern", note: "Τρία διεθνή πόδια, ακριβώς." },
      { id: "mile", name: "Μίλι", symbol: "mi", system: "Διεθνές", toBase: 1609.344, kind: "modern", note: "1.760 γιάρδες, ακριβώς." },
      { id: "daktylos-attic", name: "Δάκτυλος", symbol: "δάκτ.", system: "Αττικό · βραχύς πούς", toBase: 0.296 / 16, kind: "historical", relation: "1/16 αττικού ποδός", note: "Συμβατική ανακατασκευή με αττικό πόδα 0,296 m." },
      { id: "palaiste-attic", name: "Παλαιστή", symbol: "παλ.", system: "Αττικό · βραχύς πούς", toBase: 0.296 / 4, kind: "historical", relation: "4 δάκτυλοι · 1/4 ποδός", note: "Η απόλυτη τιμή εξαρτάται από το επιλεγμένο πρότυπο ποδός." },
      { id: "pous-attic", name: "Πούς", symbol: "ποῦς", system: "Αττικό · βραχύ πρότυπο", toBase: 0.296, kind: "historical", relation: "16 δάκτυλοι", note: "Συμβατική τιμή 0,296 m. Η βιβλιογραφία δεν χρησιμοποιεί πάντα σταθερά την ονομασία «αττικός»." },
      { id: "pous-long", name: "Πούς αρχιτεκτονικός", symbol: "ποῦς μ.", system: "Μακρό πρότυπο", toBase: 0.327, kind: "historical", relation: "τυπική τιμή του εύρους 0,326–0,328 m", note: "Ξεχωριστή αρχιτεκτονική σύμβαση· δεν αναμειγνύεται με τον βραχύ πόδα." },
      { id: "pechys-attic", name: "Πῆχυς", symbol: "πῆχυς", system: "Αττικό · βραχύς πούς", toBase: 0.296 * 1.5, kind: "historical", relation: "1½ πόδες · 24 δάκτυλοι", note: "Παράγωγη τιμή από το συμβατικό αττικό πρότυπο." },
      { id: "orgyia-attic", name: "Ὀργυιά", symbol: "ὀργ.", system: "Αττικό · βραχύς πούς", toBase: 0.296 * 6, kind: "historical", relation: "6 πόδες", note: "Απόσταση περίπου ίση με το άνοιγμα των χεριών." },
      { id: "plethron-linear", name: "Πλέθρον (μήκος)", symbol: "πλέθρ.", system: "Αττικό · βραχύς πούς", toBase: 0.296 * 100, kind: "historical", relation: "100 πόδες", note: "Γραμμικό πλέθρον· διακρίνεται από το τετραγωνικό πλέθρον." },
      { id: "stadion-attic", name: "Στάδιον", symbol: "στάδ.", system: "Αττικό · βραχύς πούς", toBase: 0.296 * 600, kind: "historical", relation: "600 πόδες", note: "Με βραχύ πόδα αποδίδεται περίπου 177,6 m· με μακρό πόδα θα ήταν αισθητά μεγαλύτερο." },
      { id: "pes-roman", name: "Pes (ρωμαϊκός πούς)", symbol: "pes", system: "Ρωμαϊκό", toBase: 0.296, kind: "historical", relation: "16 digiti", note: "Συμβατική τιμή κοντά στα 296 mm· τα υλικά πρότυπα εμφανίζουν αποκλίσεις." },
      { id: "passus-roman", name: "Passus", symbol: "passus", system: "Ρωμαϊκό", toBase: 1.48, kind: "historical", relation: "5 ρωμαϊκοί πόδες", note: "Το διπλό βήμα του ρωμαϊκού συστήματος." },
      { id: "mille-roman", name: "Mille passuum", symbol: "m.p.", system: "Ρωμαϊκό", toBase: 1480, kind: "historical", relation: "1.000 passus", note: "Συμβατική απόδοση του ρωμαϊκού μιλίου." },
    ],
  },
  {
    id: "area",
    short: "ΕΠΙ",
    name: "Επιφάνεια",
    catalogTitle: "Οι μονάδες της επιφάνειας.",
    description: "Σύγχρονες εκτάσεις και αττικές γεωμετρικές μονάδες.",
    baseName: "τετραγωνικό μέτρο",
    baseSymbol: "m²",
    defaults: ["plethron-square", "m2"],
    examples: [
      { label: "1 τετρ. πλέθρον → m²", value: "1", from: "plethron-square", to: "m2" },
      { label: "10 στρέμματα → ha", value: "10", from: "stremma", to: "hectare" },
      { label: "1 acre → m²", value: "1", from: "acre", to: "m2" },
    ],
    units: [
      { id: "cm2", name: "Τετραγωνικό εκατοστό", symbol: "cm²", system: "SI", toBase: 0.0001, kind: "modern", note: "Ακριβής μονάδα επιφάνειας." },
      { id: "m2", name: "Τετραγωνικό μέτρο", symbol: "m²", system: "SI", toBase: 1, kind: "modern", note: "Βασική μονάδα αναφοράς του μετατροπέα." },
      { id: "stremma", name: "Στρέμμα", symbol: "στρ.", system: "Σύγχρονο ελληνικό", toBase: 1000, kind: "modern", note: "1.000 m² ακριβώς." },
      { id: "hectare", name: "Εκτάριο", symbol: "ha", system: "SI αποδεκτή", toBase: 10000, kind: "modern", note: "10.000 m² ακριβώς." },
      { id: "km2", name: "Τετραγωνικό χιλιόμετρο", symbol: "km²", system: "SI", toBase: 1000000, kind: "modern", note: "1.000.000 m² ακριβώς." },
      { id: "sqft", name: "Τετραγωνικό πόδι", symbol: "ft²", system: "Διεθνές", toBase: 0.09290304, kind: "modern", note: "Παράγεται ακριβώς από το διεθνές πόδι." },
      { id: "sqyard", name: "Τετραγωνική γιάρδα", symbol: "yd²", system: "Διεθνές", toBase: 0.83612736, kind: "modern", note: "Παράγεται ακριβώς από τη διεθνή γιάρδα." },
      { id: "acre", name: "Acre", symbol: "ac", system: "Διεθνές", toBase: 4046.8564224, kind: "modern", note: "4.840 τετραγωνικές γιάρδες, ακριβώς." },
      { id: "pous-square", name: "Τετραγωνικός πούς", symbol: "ποῦς²", system: "Αττικό · βραχύς πούς", toBase: 0.296 ** 2, kind: "historical", relation: "1 × 1 αττικός πούς", note: "Παράγωγη επιφάνεια με βάση πόδα 0,296 m." },
      { id: "akaina-square", name: "Τετραγωνική ἄκαινα", symbol: "ἄκαινα²", system: "Αττικό · βραχύς πούς", toBase: (0.296 * 10) ** 2, kind: "historical", relation: "10 × 10 πόδες", note: "Παράγωγη γεωμετρική τιμή του αττικού προτύπου." },
      { id: "plethron-square", name: "Τετραγωνικό πλέθρον", symbol: "πλέθρ.²", system: "Αττικό · βραχύς πούς", toBase: (0.296 * 100) ** 2, kind: "historical", relation: "100 × 100 πόδες · 10.000 πόδες²", note: "Συμβατικά περίπου 876 m² με πόδα 0,296 m." },
    ],
  },
  {
    id: "mass",
    short: "ΜΑΖ",
    name: "Μάζα",
    catalogTitle: "Οι μονάδες της μάζας.",
    description: "Από τον οβολό και τη μνᾶ έως το κιλό και τη λίβρα.",
    baseName: "γραμμάριο",
    baseSymbol: "g",
    defaults: ["talent-attic", "kg"],
    examples: [
      { label: "1 τάλαντον → kg", value: "1", from: "talent-attic", to: "kg" },
      { label: "100 δραχμές → g", value: "100", from: "drachma-attic", to: "g" },
      { label: "1 αιγιν. στατήρας → g", value: "1", from: "stater-aeginetan", to: "g" },
    ],
    units: [
      { id: "mg", name: "Χιλιοστόγραμμο", symbol: "mg", system: "SI", toBase: 0.001, kind: "modern", note: "Ακριβής δεκαδική υποδιαίρεση του γραμμαρίου." },
      { id: "g", name: "Γραμμάριο", symbol: "g", system: "SI", toBase: 1, kind: "modern", note: "1/1.000 του χιλιογράμμου ακριβώς." },
      { id: "kg", name: "Χιλιόγραμμο", symbol: "kg", system: "SI", toBase: 1000, kind: "modern", note: "Βασική μονάδα μάζας στο SI." },
      { id: "tonne", name: "Μετρικός τόνος", symbol: "t", system: "SI αποδεκτή", toBase: 1000000, kind: "modern", note: "1.000 kg ακριβώς." },
      { id: "ounce", name: "Ουγγιά", symbol: "oz", system: "Avoirdupois", toBase: 28.349523125, kind: "modern", note: "1/16 της διεθνούς λίβρας, ακριβώς." },
      { id: "pound", name: "Λίβρα", symbol: "lb", system: "Avoirdupois", toBase: 453.59237, kind: "modern", note: "Ορίζεται ακριβώς ως 0,45359237 kg." },
      { id: "obol-attic", name: "Ὀβολός", symbol: "ὀβ.", system: "Αττικό νομισματικό", toBase: 4.36 / 6, kind: "historical", relation: "1/6 δραχμής", note: "Συμβατική ονομαστική τιμή· πραγματικά νομίσματα και σταθμά αποκλίνουν." },
      { id: "drachma-attic", name: "Δραχμή", symbol: "δρ.", system: "Αττικό νομισματικό", toBase: 4.36, kind: "historical", relation: "6 οβολοί", note: "Χρησιμοποιείται η συμβατική ονομαστική τιμή 4,36 g· δημοσιευμένο εύρος περίπου 4,2–4,4 g." },
      { id: "mina-attic", name: "Μνᾶ (νομισματική)", symbol: "μνᾶ", system: "Αττικό νομισματικό", toBase: 436, kind: "historical", relation: "100 δραχμές", note: "Η ονομασία μνᾶ δεν είναι αυτάρκης χωρίς πρότυπο και χρήση." },
      { id: "mina-solonian", name: "Μνᾶ (Σολώνεια σταθμητική)", symbol: "μνᾶ Σ.", system: "Αττικό σταθμητικό", toBase: 457.8, kind: "historical", relation: "105 νομισματικές δραχμές", note: "Διακριτό εμπορικό/σταθμητικό πρότυπο από τη νομισματική μνᾶ." },
      { id: "mina-commercial", name: "Μνᾶ (εμπορική, 138 δρ.)", symbol: "μνᾶ ἐμ.", system: "Αττικό εμπορικό", toBase: 601.68, kind: "historical", relation: "138 νομισματικές δραχμές", note: "Μία από τις εμπορικές ανακατασκευές που τεκμηριώνονται στα αθηναϊκά ευρήματα." },
      { id: "talent-attic", name: "Τάλαντον", symbol: "τάλ.", system: "Αττικό νομισματικό", toBase: 4.36 * 6000, kind: "historical", relation: "60 μναῖ · 6.000 δραχμές", note: "Συμβατικά περίπου 26,2 kg. Άλλα ελληνικά τάλαντα είχαν διαφορετικό βάρος." },
      { id: "obol-aeginetan", name: "Ὀβολός (αιγινητικός)", symbol: "ὀβ. Αἰγ.", system: "Αιγινητικό", toBase: 6.2 / 6, kind: "historical", relation: "1/6 αιγινητικής δραχμής", note: "Ξεχωριστό, βαρύτερο πρότυπο· δεν ταυτίζεται με το αττικό." },
      { id: "drachma-aeginetan", name: "Δραχμή (αιγινητική)", symbol: "δρ. Αἰγ.", system: "Αιγινητικό", toBase: 6.2, kind: "historical", relation: "1/2 στατήρα", note: "Συμβατική απόδοση περίπου 6,2 g." },
      { id: "stater-aeginetan", name: "Στατήρας (αιγινητικός)", symbol: "στατ. Αἰγ.", system: "Αιγινητικό", toBase: 12.4, kind: "historical", relation: "2 αιγινητικές δραχμές", note: "Συμβατική απόδοση περίπου 12,4 g." },
      { id: "uncia-roman", name: "Uncia", symbol: "uncia", system: "Ρωμαϊκό", toBase: 327.45 / 12, kind: "historical", relation: "1/12 libra", note: "Συμβατική απόδοση από ρωμαϊκή libra περίπου 327,45 g." },
      { id: "libra-roman", name: "Libra", symbol: "libra", system: "Ρωμαϊκό", toBase: 327.45, kind: "historical", relation: "12 unciae", note: "Ιστορική εκτίμηση· τα σωζόμενα πρότυπα δεν είναι απολύτως ομοιόμορφα." },
    ],
  },
  {
    id: "capacity",
    short: "ΧΩΡ",
    name: "Χωρητικότητα",
    catalogTitle: "Οι μονάδες της χωρητικότητας.",
    description: "Υγρά, ξηρά και σύγχρονοι όγκοι σε κοινή βάση λίτρου.",
    baseName: "λίτρο",
    baseSymbol: "L",
    defaults: ["metretes-attic", "l"],
    examples: [
      { label: "1 μετρητής → L", value: "1", from: "metretes-attic", to: "l" },
      { label: "1 μέδιμνος → L", value: "1", from: "medimnos-attic", to: "l" },
      { label: "1 amphora → L", value: "1", from: "amphora-roman", to: "l" },
    ],
    units: [
      { id: "ml", name: "Χιλιοστόλιτρο", symbol: "mL", system: "SI", toBase: 0.001, kind: "modern", note: "1 cm³ ακριβώς." },
      { id: "l", name: "Λίτρο", symbol: "L", system: "SI αποδεκτή", toBase: 1, kind: "modern", note: "1 dm³ ή 10⁻³ m³ ακριβώς." },
      { id: "m3", name: "Κυβικό μέτρο", symbol: "m³", system: "SI", toBase: 1000, kind: "modern", note: "1.000 L ακριβώς." },
      { id: "tsp-us", name: "Κουταλάκι ΗΠΑ", symbol: "tsp", system: "US customary", toBase: 0.00492892159375, kind: "modern", note: "1/768 αμερικανικού υγρού γαλονιού, ακριβώς." },
      { id: "cup-us", name: "Φλιτζάνι ΗΠΑ", symbol: "cup", system: "US customary", toBase: 0.2365882365, kind: "modern", note: "8 αμερικανικές υγρές ουγγιές, ακριβώς." },
      { id: "pint-us", name: "Υγρή πίντα ΗΠΑ", symbol: "pt US", system: "US customary", toBase: 0.473176473, kind: "modern", note: "1/8 αμερικανικού υγρού γαλονιού, ακριβώς." },
      { id: "gallon-us", name: "Υγρό γαλόνι ΗΠΑ", symbol: "gal US", system: "US customary", toBase: 3.785411784, kind: "modern", note: "231 κυβικές ίντσες, ακριβώς." },
      { id: "pint-imperial", name: "Αυτοκρατορική πίντα", symbol: "pt imp", system: "Imperial", toBase: 0.56826125, kind: "modern", note: "1/8 αυτοκρατορικού γαλονιού, ακριβώς." },
      { id: "gallon-imperial", name: "Αυτοκρατορικό γαλόνι", symbol: "gal imp", system: "Imperial", toBase: 4.54609, kind: "modern", note: "4,54609 L ακριβώς." },
      { id: "kochliarion-attic", name: "Κοχλιάριον", symbol: "κοχλ.", system: "Αττικό · υγρά", toBase: 0.273 / 60, kind: "historical", relation: "1/60 κοτύλης", note: "Η σχέση διατηρείται από τον πίνακα του project· η αγκύρωση σε SI είναι σύγχρονη ανακατασκευή." },
      { id: "kyathos-attic", name: "Κύαθος", symbol: "κύαθ.", system: "Αττικό · υγρά", toBase: 0.273 / 6, kind: "historical", relation: "1/6 κοτύλης", note: "Περίπου 45,5 mL με κοτύλη 0,273 L." },
      { id: "oxybaphon-attic", name: "Ὀξύβαφον", symbol: "ὀξύβ.", system: "Αττικό · υγρά", toBase: 0.273 / 4, kind: "historical", relation: "1/4 κοτύλης", note: "Η εσωτερική αναλογία είναι σταθερή στο επιλεγμένο ανακατασκευασμένο σύστημα." },
      { id: "kotyle-attic", name: "Κοτύλη", symbol: "κοτ.", system: "Αττικό · υγρά", toBase: 0.273, kind: "historical", relation: "6 κύαθοι · 4 ὀξύβαφα", note: "Συμβατική αγκύρωση 0,273 L· σωζόμενα αγγεία υποδεικνύουν περίπου 267–300 mL." },
      { id: "xestes-attic", name: "Ξέστης", symbol: "ξέστ.", system: "Αττικό · υγρά", toBase: 0.273 * 2, kind: "historical", relation: "2 κοτύλαι", note: "Στο αρχείο του project απαντά και η γραφή «ξέσης»." },
      { id: "chous-attic", name: "Χοῦς", symbol: "χοῦς", system: "Αττικό · υγρά", toBase: 0.273 * 12, kind: "historical", relation: "12 κοτύλαι · 6 ξέσται", note: "Συμβατικά περίπου 3,28 L." },
      { id: "metretes-attic", name: "Μετρητής", symbol: "μετρ.", system: "Αττικό · υγρά", toBase: 0.273 * 144, kind: "historical", relation: "12 χόες · 144 κοτύλαι", note: "Συμβατικά περίπου 39,3 L." },
      { id: "choinix-attic", name: "Χοῖνιξ", symbol: "χοῖν.", system: "Αττικό · ξηρά", toBase: 0.273 * 4, kind: "historical", relation: "4 κοτύλαι · 1/48 μεδίμνου", note: "Σύγχρονη ανακατασκευή περίπου 1,09 L. Ο ιστορικός πίνακας του project καταγράφει διαφορετική υποδιαίρεση." },
      { id: "hemiekton-attic", name: "Ἡμίεκτον", symbol: "ἡμίεκτ.", system: "Αττικό · ξηρά", toBase: 0.273 * 16, kind: "historical", relation: "16 κοτύλαι · 1/12 μεδίμνου", note: "Παράγωγη τιμή του συνεκτικού συστήματος κοτύλης 0,273 L." },
      { id: "hekteus-attic", name: "Ἑκτεύς", symbol: "ἑκτ.", system: "Αττικό · ξηρά", toBase: 0.273 * 32, kind: "historical", relation: "32 κοτύλαι · 1/6 μεδίμνου", note: "Συμβατικά περίπου 8,74 L." },
      { id: "medimnos-attic", name: "Μέδιμνος", symbol: "μέδ.", system: "Αττικό · ξηρά", toBase: 0.273 * 192, kind: "historical", relation: "48 χοίνικες · 192 κοτύλαι", note: "Συμβατικά περίπου 52,4 L· δημοσιευμένες ανακατασκευές κυμαίνονται περίπου 51,8–52,5 L." },
      { id: "cyathus-roman", name: "Cyathus", symbol: "cyath.", system: "Ρωμαϊκό · υγρά", toBase: 0.273 / 6, kind: "historical", relation: "1/12 sextarius", note: "Συμβατική ρωμαϊκή απόδοση, κοντά στον ελληνικό κύαθο." },
      { id: "hemina-roman", name: "Hemina", symbol: "hemina", system: "Ρωμαϊκό · υγρά", toBase: 0.273, kind: "historical", relation: "1/2 sextarius", note: "Συμβατική απόδοση περίπου 0,273 L." },
      { id: "sextarius-roman", name: "Sextarius", symbol: "sext.", system: "Ρωμαϊκό · υγρά", toBase: 0.546, kind: "historical", relation: "2 heminae · 12 cyathi", note: "Συμβατική απόδοση περίπου 0,546 L." },
      { id: "congius-roman", name: "Congius", symbol: "cong.", system: "Ρωμαϊκό · υγρά", toBase: 3.276, kind: "historical", relation: "6 sextarii", note: "Συμβατική απόδοση περίπου 3,28 L." },
      { id: "amphora-roman", name: "Amphora / quadrantal", symbol: "amph.", system: "Ρωμαϊκό · υγρά", toBase: 26.208, kind: "historical", relation: "8 congii · 48 sextarii", note: "Συμβατική απόδοση περίπου 26,2 L." },
      { id: "modius-roman", name: "Modius", symbol: "modius", system: "Ρωμαϊκό · ξηρά", toBase: 8.736, kind: "historical", relation: "16 sextarii", note: "Συμβατική απόδοση περίπου 8,74 L." },
    ],
  },
];

const numberFormatter = new Intl.NumberFormat("el-GR", {
  maximumSignificantDigits: 9,
});

const compactFormatter = new Intl.NumberFormat("el-GR", {
  maximumSignificantDigits: 4,
});

function formatValue(value: number) {
  const absolute = Math.abs(value);
  if ((absolute > 0 && absolute < 0.000001) || absolute >= 1_000_000_000) {
    return value.toExponential(6).replace(".", ",");
  }
  return numberFormatter.format(value);
}

function groupedOptions(units: Unit[]) {
  return {
    modern: units.filter((unit) => unit.kind === "modern"),
    historical: units.filter((unit) => unit.kind === "historical"),
  };
}

function UnitSelect({
  id,
  label,
  value,
  units,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  units: Unit[];
  onChange: (next: string) => void;
}) {
  const groups = groupedOptions(units);

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
        <optgroup label="Σύγχρονες μονάδες">
          {groups.modern.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} ({unit.symbol})
            </option>
          ))}
        </optgroup>
        <optgroup label="Ιστορικές μονάδες">
          {groups.historical.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.name} · {unit.system}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}

export default function Home() {
  const [categoryId, setCategoryId] = useState(categories[0].id);
  const [rawValue, setRawValue] = useState("1");
  const [fromId, setFromId] = useState(categories[0].defaults[0]);
  const [toId, setToId] = useState(categories[0].defaults[1]);
  const [catalogQuery, setCatalogQuery] = useState("");

  const category = categories.find((item) => item.id === categoryId) ?? categories[0];
  const fromUnit = category.units.find((unit) => unit.id === fromId) ?? category.units[0];
  const toUnit = category.units.find((unit) => unit.id === toId) ?? category.units[1];
  const inputValue = parseLocalizedNumber(rawValue);
  const convertedValue =
    inputValue === null ? null : (inputValue * fromUnit.toBase) / toUnit.toBase;
  const isApproximate =
    fromId !== toId && (fromUnit.kind === "historical" || toUnit.kind === "historical");

  const filteredUnits = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase("el");
    if (!query) return category.units;
    return category.units.filter((unit) =>
      [unit.name, unit.symbol, unit.system, unit.note, unit.relation ?? ""]
        .join(" ")
        .toLocaleLowerCase("el")
        .includes(query),
    );
  }, [catalogQuery, category]);

  function changeCategory(nextId: string) {
    const nextCategory = categories.find((item) => item.id === nextId);
    if (!nextCategory) return;
    setCategoryId(nextId);
    setFromId(nextCategory.defaults[0]);
    setToId(nextCategory.defaults[1]);
    setCatalogQuery("");
  }

  function swapUnits() {
    setFromId(toId);
    setToId(fromId);
  }

  function applyExample(example: Example) {
    setRawValue(example.value);
    setFromId(example.from);
    setToId(example.to);
    document.getElementById("converter")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Μέτρον — αρχική">
          <span>ΜΕΤΡΟΝ</span>
          <small>Ιστορικές μονάδες</small>
        </a>
        <nav aria-label="Κύρια πλοήγηση">
          <a href="#converter">Μετατροπέας</a>
          <a href="#catalog">Κατάλογος</a>
          <a href="#method">Μεθοδολογία</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>01</span> Από την αρχαιότητα στο SI</p>
          <h1>Από τον δάκτυλο<br />στο χιλιόμετρο.</h1>
          <p className="hero-intro">
            Ένας μετατροπέας που κρατά τις ιστορικές αναλογίες ορατές — και την
            αβεβαιότητα τίμια.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#converter">Ξεκίνα μετατροπή</a>
            <a className="text-action" href="#method">Πώς διαβάζονται οι τιμές</a>
          </div>
        </div>
        <div className="hero-object" aria-hidden="true">
          <div className="measure-arc">
            <span className="arc-value">600</span>
            <span className="arc-label">πόδες</span>
          </div>
          <div className="measure-ruler">
            {Array.from({ length: 13 }).map((_, index) => <i key={index} />)}
          </div>
          <p><strong>1 στάδιον</strong><span>≈ 177,6 m</span></p>
        </div>
      </section>

      <section className="converter-section" id="converter" aria-labelledby="converter-title">
        <div className="section-heading">
          <p className="eyebrow"><span>02</span> Μετατροπέας</p>
          <div>
            <h2 id="converter-title">Διάλεξε μέγεθος.</h2>
            <p>Οι σύγχρονες μονάδες είναι ακριβείς· οι αρχαίες επισημαίνονται ως εκτιμήσεις.</p>
          </div>
        </div>

        <div className="category-tabs" role="group" aria-label="Κατηγορία μεγέθους">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category.id === item.id}
              className={category.id === item.id ? "active" : ""}
              onClick={() => changeCategory(item.id)}
            >
              <span>{item.short}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="converter-grid">
          <div className="converter-form">
            <div className="category-context">
              <p>{category.description}</p>
              <span>Βάση: {category.baseName} ({category.baseSymbol})</span>
            </div>

            <label className="field value-field" htmlFor="quantity-value">
              <span>Ποσότητα</span>
              <input
                id="quantity-value"
                inputMode="decimal"
                autoComplete="off"
                value={rawValue}
                onChange={(event) => setRawValue(event.target.value)}
                aria-invalid={inputValue === null}
                aria-describedby={inputValue === null ? "value-error" : undefined}
              />
              {inputValue === null && (
                <small id="value-error" className="field-error">Γράψε έναν έγκυρο αριθμό.</small>
              )}
            </label>

            <div className="unit-row">
              <UnitSelect id="from-unit" label="Από" value={fromId} units={category.units} onChange={setFromId} />
              <button className="swap-button" type="button" onClick={swapUnits} aria-label="Αντιμετάθεση μονάδων">
                <span aria-hidden="true">⇄</span>
              </button>
              <UnitSelect id="to-unit" label="Προς" value={toId} units={category.units} onChange={setToId} />
            </div>

            <div className="quick-examples" aria-label="Γρήγορα παραδείγματα">
              <span>Δοκίμασε</span>
              {category.examples.map((example) => (
                <button key={example.label} type="button" onClick={() => applyExample(example)}>{example.label}</button>
              ))}
            </div>
          </div>

          <aside className="result-card" aria-live="polite">
            <div className="result-topline">
              <span>Αποτέλεσμα</span>
              <span className={isApproximate ? "status approximate" : "status exact"}>
                {isApproximate ? "Εκτίμηση" : "Ακριβές"}
              </span>
            </div>
            <div className="result-value">
              <span>{isApproximate ? "≈" : "="}</span>
              <strong>{convertedValue === null ? "—" : formatValue(convertedValue)}</strong>
              <em>{toUnit.symbol}</em>
            </div>
            <p className="conversion-line">
              1 {fromUnit.symbol} {isApproximate ? "≈" : "="} {formatValue(fromUnit.toBase / toUnit.toBase)} {toUnit.symbol}
            </p>
            <div className="selected-unit-note">
              <span>{fromUnit.system}</span>
              <h3>{fromUnit.name}</h3>
              {fromUnit.relation && <p className="unit-relation">{fromUnit.relation}</p>}
              <p>{fromUnit.note}</p>
            </div>
            {isApproximate && (
              <p className="uncertainty-note">
                Το «≈» είναι ουσιώδες: η αρχαία μονάδα μεταβάλλεται ανά πρότυπο,
                τόπο, εποχή και σωζόμενο αντικείμενο.
              </p>
            )}
          </aside>
        </div>
      </section>

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading compact">
          <p className="eyebrow"><span>03</span> Κατάλογος</p>
          <div>
            <h2 id="catalog-title">{category.catalogTitle}</h2>
            <p>{category.units.length} σύγχρονες και ιστορικές εγγραφές, σε ένα συγκρίσιμο σύστημα.</p>
          </div>
        </div>
        <label className="catalog-search" htmlFor="catalog-query">
          <span>Αναζήτηση μονάδας</span>
          <input
            id="catalog-query"
            type="search"
            value={catalogQuery}
            onChange={(event) => setCatalogQuery(event.target.value)}
            placeholder="π.χ. στάδιον, SI, ρωμαϊκό…"
          />
        </label>
        <div className="unit-catalog">
          {filteredUnits.map((unit, index) => (
            <article className="unit-card" key={unit.id}>
              <div className="unit-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="unit-card-main">
                <div className="unit-card-heading">
                  <div>
                    <span>{unit.system}</span>
                    <h3>{unit.name}</h3>
                  </div>
                  <strong>{unit.symbol}</strong>
                </div>
                <p>{unit.note}</p>
                <div className="unit-equivalent">
                  <span>{unit.kind === "historical" ? "≈" : "="}</span>
                  <strong>{compactFormatter.format(unit.toBase)}</strong>
                  <em>{category.baseSymbol}</em>
                </div>
              </div>
            </article>
          ))}
          {filteredUnits.length === 0 && <p className="empty-state">Δεν βρέθηκε μονάδα με αυτόν τον όρο.</p>}
        </div>
      </section>

      <section className="method-section" id="method" aria-labelledby="method-title">
        <div className="method-intro">
          <p className="eyebrow"><span>04</span> Μεθοδολογία</p>
          <h2 id="method-title">Η ακρίβεια αρχίζει από την αμφιβολία.</h2>
          <p>
            Το αρχείο του project διατηρεί πολύτιμες αναλογίες ελληνικών και
            ρωμαϊκών μονάδων από τους πίνακες του Arbuthnot, όπως μεταφέρθηκαν
            στην <em>Encyclopédie</em>. Οι απόλυτες τιμές SI εδώ αγκυρώνονται σε
            νεότερη αρχαιολογική και μετρολογική βιβλιογραφία.
          </p>
        </div>
        <div className="method-grid">
          <article>
            <span className="method-number">I</span>
            <h3>Αναλογία</h3>
            <p>Κρατάμε πρώτα την εσωτερική αλυσίδα: 1 τάλαντον = 60 μναῖ = 6.000 δραχμές.</p>
          </article>
          <article>
            <span className="method-number">II</span>
            <h3>Αγκύρωση</h3>
            <p>Εφαρμόζουμε μία δηλωμένη συμβατική τιμή, όπως δραχμή ≈ 4,36 g ή κοτύλη ≈ 0,273 L.</p>
          </article>
          <article>
            <span className="method-number">III</span>
            <h3>Επισήμανση</h3>
            <p>Κάθε ιστορική αναγωγή παίρνει «≈». Διαφορετικά πρότυπα παραμένουν ξεχωριστές μονάδες.</p>
          </article>
        </div>
        <div className="source-panel">
          <div>
            <span className="source-kicker">Πηγές αναφοράς</span>
            <h3>Από το εύρημα στον αριθμό.</h3>
            <p>Οι σύνδεσμοι ανοίγουν τις βασικές επιστημονικές και θεσμικές πηγές που χρησιμοποιήθηκαν.</p>
          </div>
          <ul>
            <li><a href={SOURCES.agora} target="_blank" rel="noreferrer">Athenian Agora X <span>↗</span></a></li>
            <li><a href={SOURCES.stelai} target="_blank" rel="noreferrer">The Attic Stelai <span>↗</span></a></li>
            <li><a href={SOURCES.treccani} target="_blank" rel="noreferrer">Treccani — συστήματα μέτρησης <span>↗</span></a></li>
            <li><a href={SOURCES.dyas} target="_blank" rel="noreferrer">Ακαδημία Αθηνών — ΔΥΑΣ <span>↗</span></a></li>
            <li><a href={SOURCES.bipm} target="_blank" rel="noreferrer">BIPM — SI Brochure <span>↗</span></a></li>
            <li><a href={SOURCES.nist} target="_blank" rel="noreferrer">NIST — συντελεστές μετατροπής <span>↗</span></a></li>
          </ul>
        </div>
        <div className="source-caveat">
          <strong>Σημείωση πηγής.</strong>
          <p>
            Ο πίνακας ξηρών του αρχείου του project δίνει 1 μέδιμνο = 144 κοτύλες,
            ενώ η συνεκτική νεότερη αττική ανακατασκευή χρησιμοποιεί 192. Ο μετατροπέας
            υιοθετεί τη δεύτερη και διατηρεί τη διαφορά ορατή — δεν τη διορθώνει σιωπηρά.
          </p>
        </div>
      </section>

      <footer>
        <a className="wordmark footer-wordmark" href="#top"><span>ΜΕΤΡΟΝ</span><small>Ιστορικές μονάδες</small></a>
        <p>Ερευνητικό βοήθημα · οι ιστορικές τιμές δεν είναι πρότυπα πιστοποίησης.</p>
        <a href="#top">Επιστροφή επάνω ↑</a>
      </footer>
    </main>
  );
}
