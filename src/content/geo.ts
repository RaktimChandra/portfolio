/** Places in the record (each one appears in profile.ts or experience.ts), plus country centroids for visitor dots. */
export const places = [
  { name: "Chennai", note: "SRM, B.Tech 2023 – 2027. Home base now.", lat: 13.08, lon: 80.27 },
  { name: "Kolkata", note: "Shristi Infrastructure, on-site. West Bengal is home.", lat: 22.57, lon: 88.36 },
  { name: "Noida", note: "TechCorp, on-site.", lat: 28.54, lon: 77.39 },
];

export const CENTROID: Record<string, [number, number, string]> = {
  IN: [21, 78, "India"], US: [39, -98, "United States"], GB: [54, -2, "United Kingdom"], DE: [51, 10, "Germany"], FR: [46, 2, "France"],
  NL: [52, 5, "Netherlands"], IE: [53, -8, "Ireland"], ES: [40, -4, "Spain"], IT: [42, 12, "Italy"], PT: [39, -8, "Portugal"],
  SE: [62, 15, "Sweden"], NO: [61, 9, "Norway"], FI: [64, 26, "Finland"], DK: [56, 10, "Denmark"], PL: [52, 19, "Poland"],
  CH: [47, 8, "Switzerland"], AT: [47, 14, "Austria"], BE: [50.5, 4.5, "Belgium"], CZ: [50, 15, "Czechia"], RO: [46, 25, "Romania"],
  UA: [49, 32, "Ukraine"], TR: [39, 35, "Türkiye"], RU: [60, 90, "Russia"], CA: [56, -106, "Canada"], MX: [23, -102, "Mexico"],
  BR: [-10, -52, "Brazil"], AR: [-34, -64, "Argentina"], CL: [-33, -71, "Chile"], CO: [4, -73, "Colombia"], PE: [-10, -76, "Peru"],
  AU: [-25, 134, "Australia"], NZ: [-41, 174, "New Zealand"], JP: [36, 138, "Japan"], KR: [36, 128, "South Korea"], CN: [35, 103, "China"],
  HK: [22.3, 114.2, "Hong Kong"], TW: [23.7, 121, "Taiwan"], SG: [1.35, 103.8, "Singapore"], MY: [4, 102, "Malaysia"], ID: [-2, 118, "Indonesia"],
  TH: [15, 101, "Thailand"], VN: [16, 107, "Vietnam"], PH: [12, 122, "Philippines"], BD: [24, 90, "Bangladesh"], PK: [30, 70, "Pakistan"],
  LK: [7.9, 80.8, "Sri Lanka"], NP: [28, 84, "Nepal"], AE: [24, 54, "UAE"], SA: [24, 45, "Saudi Arabia"], QA: [25.3, 51.2, "Qatar"],
  IL: [31.5, 34.8, "Israel"], EG: [27, 30, "Egypt"], NG: [9, 8, "Nigeria"], KE: [0, 38, "Kenya"], ZA: [-29, 24, "South Africa"],
  MA: [32, -6, "Morocco"], GR: [39, 22, "Greece"], HU: [47, 19, "Hungary"], EE: [59, 26, "Estonia"], LT: [55, 24, "Lithuania"],
};
