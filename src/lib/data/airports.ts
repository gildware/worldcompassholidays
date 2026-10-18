export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
};

export const airports: Airport[] = [
  { code: "DEL", name: "Indira Gandhi International", city: "Delhi", country: "India", countryCode: "in" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", country: "India", countryCode: "in" },
  { code: "BLR", name: "Kempegowda International", city: "Bengaluru", country: "India", countryCode: "in" },
  { code: "MAA", name: "Chennai International", city: "Chennai", country: "India", countryCode: "in" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose", city: "Kolkata", country: "India", countryCode: "in" },
  { code: "HYD", name: "Rajiv Gandhi International", city: "Hyderabad", country: "India", countryCode: "in" },
  { code: "COK", name: "Cochin International", city: "Kochi", country: "India", countryCode: "in" },
  { code: "GOI", name: "Manohar International", city: "Goa", country: "India", countryCode: "in" },
  { code: "AMD", name: "Sardar Vallabhbhai Patel", city: "Ahmedabad", country: "India", countryCode: "in" },
  { code: "JAI", name: "Jaipur International", city: "Jaipur", country: "India", countryCode: "in" },
  { code: "ATQ", name: "Sri Guru Ram Dass Jee", city: "Amritsar", country: "India", countryCode: "in" },
  { code: "SXR", name: "Sheikh ul-Alam", city: "Srinagar", country: "India", countryCode: "in" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates", countryCode: "ae" },
  { code: "AUH", name: "Zayed International", city: "Abu Dhabi", country: "United Arab Emirates", countryCode: "ae" },
  { code: "DOH", name: "Hamad International", city: "Doha", country: "Qatar", countryCode: "qa" },
  { code: "BAH", name: "Bahrain International", city: "Bahrain", country: "Bahrain", countryCode: "bh" },
  { code: "MCT", name: "Muscat International", city: "Muscat", country: "Oman", countryCode: "om" },
  { code: "RUH", name: "King Khalid International", city: "Riyadh", country: "Saudi Arabia", countryCode: "sa" },
  { code: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia", countryCode: "sa" },
  { code: "SIN", name: "Changi", city: "Singapore", country: "Singapore", countryCode: "sg" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", countryCode: "th" },
  { code: "HKT", name: "Phuket International", city: "Phuket", country: "Thailand", countryCode: "th" },
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia", countryCode: "my" },
  { code: "HAN", name: "Noi Bai", city: "Hanoi", country: "Vietnam", countryCode: "vn" },
  { code: "SGN", name: "Tan Son Nhat", city: "Ho Chi Minh City", country: "Vietnam", countryCode: "vn" },
  { code: "CGK", name: "Soekarno-Hatta", city: "Jakarta", country: "Indonesia", countryCode: "id" },
  { code: "DPS", name: "Ngurah Rai", city: "Bali", country: "Indonesia", countryCode: "id" },
  { code: "MLE", name: "Velana International", city: "Malé", country: "Maldives", countryCode: "mv" },
  { code: "CMB", name: "Bandaranaike", city: "Colombo", country: "Sri Lanka", countryCode: "lk" },
  { code: "KTM", name: "Tribhuvan", city: "Kathmandu", country: "Nepal", countryCode: "np" },
  { code: "SEZ", name: "Seychelles International", city: "Mahé", country: "Seychelles", countryCode: "sc" },
  { code: "LHR", name: "Heathrow", city: "London", country: "United Kingdom", countryCode: "gb" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", countryCode: "fr" },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", countryCode: "de" },
  { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", countryCode: "nl" },
  { code: "FCO", name: "Fiumicino", city: "Rome", country: "Italy", countryCode: "it" },
  { code: "BCN", name: "El Prat", city: "Barcelona", country: "Spain", countryCode: "es" },
  { code: "ZRH", name: "Zurich", city: "Zurich", country: "Switzerland", countryCode: "ch" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey", countryCode: "tr" },
  { code: "NRT", name: "Narita", city: "Tokyo", country: "Japan", countryCode: "jp" },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "Japan", countryCode: "jp" },
  { code: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia", countryCode: "au" },
  { code: "MEL", name: "Tullamarine", city: "Melbourne", country: "Australia", countryCode: "au" },
];

export function findAirport(code: string) {
  const needle = code.trim().toUpperCase();
  return airports.find((airport) => airport.code === needle);
}

export function airportLabel(airport: Airport) {
  return `${airport.city} (${airport.code})`;
}
