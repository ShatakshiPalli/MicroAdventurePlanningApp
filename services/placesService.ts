// Mock Places API search service for Expo Go
// In production, you would use Google Places API with proper API key

const MOCK_PLACES = [
  {
    id: 'place_1',
    name: 'Victoria Memorial',
    address: 'Queens Way, Maidan, Kolkata, West Bengal 700071, India',
    coordinates: { latitude: 22.5448, longitude: 88.3426 }
  },
  {
    id: 'place_2',
    name: 'Howrah Bridge',
    address: 'Jagannath Ghat, Strand Rd, Kolkata, West Bengal 700001, India',
    coordinates: { latitude: 22.5851, longitude: 88.3468 }
  },
  {
    id: 'place_3',
    name: 'Indian Museum',
    address: '27, Jawaharlal Nehru Rd, Park Street area, Kolkata, West Bengal 700016, India',
    coordinates: { latitude: 22.5579, longitude: 88.3511 }
  },
  {
    id: 'place_4',
    name: 'Science City Kolkata',
    address: 'JBS Haldane Ave, East Kolkata Twp, Kolkata, West Bengal 700046, India',
    coordinates: { latitude: 22.5354, longitude: 88.3947 }
  },
  {
    id: 'place_5',
    name: 'Park Street',
    address: 'Park Street, Kolkata, West Bengal, India',
    coordinates: { latitude: 22.5549, longitude: 88.3515 }
  },
  {
    id: 'place_6',
    name: 'Dakshineswar Kali Temple',
    address: 'Dakshineswar, Kolkata, West Bengal 700076, India',
    coordinates: { latitude: 22.6553, longitude: 88.3578 }
  },
  {
    id: 'place_7',
    name: 'Eden Gardens',
    address: 'BBD Bagh, Kolkata, West Bengal 700021, India',
    coordinates: { latitude: 22.5645, longitude: 88.3433 }
  },
  {
    id: 'place_8',
    name: 'Kalighat Kali Temple',
    address: 'Anami Sangha, Kalighat, Kolkata, West Bengal 700026, India',
    coordinates: { latitude: 22.5186, longitude: 88.3426 }
  },
  {
    id: 'place_9',
    name: 'Birla Planetarium',
    address: '96, Jawaharlal Nehru Rd, Maidan, Kolkata, West Bengal 700071, India',
    coordinates: { latitude: 22.5454, longitude: 88.3505 }
  },
  {
    id: 'place_10',
    name: 'St. Paul\'s Cathedral',
    address: 'Cathedral Rd, Maidan, Kolkata, West Bengal 700071, India',
    coordinates: { latitude: 22.5441, longitude: 88.3516 }
  },
  {
    id: 'place_11',
    name: 'Millennium Park',
    address: 'Strand Rd, BBD Bagh, Kolkata, West Bengal 700001, India',
    coordinates: { latitude: 22.5726, longitude: 88.3422 }
  },
  {
    id: 'place_12',
    name: 'New Market',
    address: 'Lindsay St, New Market, Dharmatala, Taltala, Kolkata, West Bengal 700087, India',
    coordinates: { latitude: 22.5561, longitude: 88.3533 }
  },
  // Hyderabad places
  {
    id: 'place_13',
    name: 'Charminar',
    address: 'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002, India',
    coordinates: { latitude: 17.3616, longitude: 78.4747 }
  },
  {
    id: 'place_14',
    name: 'Golconda Fort',
    address: 'Khair Complex, Ibrahim Bagh, Hyderabad, Telangana 500008, India',
    coordinates: { latitude: 17.3833, longitude: 78.4011 }
  },
  {
    id: 'place_15',
    name: 'Hussain Sagar Lake',
    address: 'Tank Bund Rd, Hyderabad, Telangana 500003, India',
    coordinates: { latitude: 17.4239, longitude: 78.4738 }
  },
  {
    id: 'place_16',
    name: 'Ramoji Film City',
    address: 'Anaspur Village, Hayathnagar Mandal, Hyderabad, Telangana 501512, India',
    coordinates: { latitude: 17.2543, longitude: 78.6808 }
  },
  {
    id: 'place_17',
    name: 'Salar Jung Museum',
    address: 'Salar Jung Rd, Near Minar Function Hall, Darushifa, Hyderabad, Telangana 500002, India',
    coordinates: { latitude: 17.3713, longitude: 78.4803 }
  },
  {
    id: 'place_18',
    name: 'Birla Mandir Hyderabad',
    address: 'Hill Fort Rd, Ambedkar Colony, Hyderabad, Telangana 500004, India',
    coordinates: { latitude: 17.4062, longitude: 78.4691 }
  },
  // Mumbai Places
  {
    id: 'place_19',
    name: 'Gateway of India',
    address: 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001, India',
    coordinates: { latitude: 18.9220, longitude: 72.8347 }
  },
  {
    id: 'place_20',
    name: 'Marine Drive',
    address: 'Marine Dr, Mumbai, Maharashtra, India',
    coordinates: { latitude: 18.9432, longitude: 72.8234 }
  },
  {
    id: 'place_21',
    name: 'Chhatrapati Shivaji Terminus',
    address: 'Chhatrapati Shivaji Terminus Area, Fort, Mumbai, Maharashtra 400001, India',
    coordinates: { latitude: 18.9398, longitude: 72.8355 }
  },
  {
    id: 'place_22',
    name: 'Elephanta Caves',
    address: 'Elephanta Island, Mumbai, Maharashtra 400094, India',
    coordinates: { latitude: 18.9633, longitude: 72.9345 }
  },
  {
    id: 'place_23',
    name: 'Juhu Beach',
    address: 'Juhu Tara Rd, Juhu, Mumbai, Maharashtra 400049, India',
    coordinates: { latitude: 19.0968, longitude: 72.8267 }
  },
  // Delhi Places
  {
    id: 'place_24',
    name: 'Red Fort',
    address: 'Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006, India',
    coordinates: { latitude: 28.6562, longitude: 77.2410 }
  },
  {
    id: 'place_25',
    name: 'India Gate',
    address: 'Rajpath, India Gate, New Delhi, Delhi 110001, India',
    coordinates: { latitude: 28.6129, longitude: 77.2295 }
  },
  {
    id: 'place_26',
    name: 'Qutub Minar',
    address: 'Seth Sarai, Mehrauli, New Delhi, Delhi 110030, India',
    coordinates: { latitude: 28.5245, longitude: 77.1855 }
  },
  {
    id: 'place_27',
    name: 'Lotus Temple',
    address: 'Lotus Temple Rd, Bahapur, Shambhu Dayal Bag, Kalkaji, New Delhi, Delhi 110019, India',
    coordinates: { latitude: 28.5535, longitude: 77.2588 }
  },
  {
    id: 'place_28',
    name: 'Humayuns Tomb',
    address: 'Mathura Rd, Nizamuddin, New Delhi, Delhi 110013, India',
    coordinates: { latitude: 28.5933, longitude: 77.2507 }
  },
  // Bangalore Places
  {
    id: 'place_29',
    name: 'Lalbagh Botanical Garden',
    address: 'Lalbagh Rd, Mavalli, Bengaluru, Karnataka 560004, India',
    coordinates: { latitude: 12.9507, longitude: 77.5848 }
  },
  {
    id: 'place_30',
    name: 'Bangalore Palace',
    address: 'Vasanth Nagar, Bengaluru, Karnataka 560052, India',
    coordinates: { latitude: 12.9982, longitude: 77.5923 }
  },
  {
    id: 'place_31',
    name: 'Cubbon Park',
    address: 'Kasturba Rd, Sampangi Rama Nagar, Bengaluru, Karnataka 560001, India',
    coordinates: { latitude: 12.9762, longitude: 77.5993 }
  },
  {
    id: 'place_32',
    name: 'ISKCON Temple Bangalore',
    address: 'Hare Krishna Hill, Chord Rd, Rajajinagar, Bengaluru, Karnataka 560010, India',
    coordinates: { latitude: 12.9716, longitude: 77.5475 }
  },
  // Chennai Places
  {
    id: 'place_33',
    name: 'Marina Beach',
    address: 'Marina Beach, Chennai, Tamil Nadu, India',
    coordinates: { latitude: 13.0475, longitude: 80.2824 }
  },
  {
    id: 'place_34',
    name: 'Kapaleeshwarar Temple',
    address: 'Mylapore, Chennai, Tamil Nadu 600004, India',
    coordinates: { latitude: 13.0339, longitude: 80.2619 }
  },
  {
    id: 'place_35',
    name: 'Fort St. George',
    address: 'Fort St George, Chennai, Tamil Nadu 600009, India',
    coordinates: { latitude: 13.0836, longitude: 80.2839 }
  },
  // Jaipur Places
  {
    id: 'place_36',
    name: 'Hawa Mahal',
    address: 'Hawa Mahal Rd, Badi Choupad, Jaipur, Rajasthan 302002, India',
    coordinates: { latitude: 26.9239, longitude: 75.8267 }
  },
  {
    id: 'place_37',
    name: 'Amber Fort',
    address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001, India',
    coordinates: { latitude: 26.9855, longitude: 75.8513 }
  },
  {
    id: 'place_38',
    name: 'City Palace Jaipur',
    address: 'Tulsi Marg, Gangori Bazaar, J.D.A. Market, Pink City, Jaipur, Rajasthan 302002, India',
    coordinates: { latitude: 26.9260, longitude: 75.8235 }
  },
  // Goa Places
  {
    id: 'place_39',
    name: 'Baga Beach',
    address: 'Baga, Goa 403516, India',
    coordinates: { latitude: 15.5560, longitude: 73.7516 }
  },
  {
    id: 'place_40',
    name: 'Basilica of Bom Jesus',
    address: 'Old Goa, Goa 403402, India',
    coordinates: { latitude: 15.5007, longitude: 73.9115 }
  },
  {
    id: 'place_41',
    name: 'Calangute Beach',
    address: 'Calangute, Goa 403516, India',
    coordinates: { latitude: 15.5394, longitude: 73.7553 }
  },
  // Pune Places
  {
    id: 'place_42',
    name: 'Shaniwar Wada',
    address: 'Shaniwar Peth, Pune, Maharashtra 411030, India',
    coordinates: { latitude: 18.5196, longitude: 73.8553 }
  },
  {
    id: 'place_43',
    name: 'Aga Khan Palace',
    address: 'Nagar Rd, Kalyani Nagar, Pune, Maharashtra 411006, India',
    coordinates: { latitude: 18.5679, longitude: 73.8984 }
  },
  // Kochi Places
  {
    id: 'place_44',
    name: 'Chinese Fishing Nets',
    address: 'Fort Kochi Beach Rd, Fort Kochi, Kochi, Kerala 682001, India',
    coordinates: { latitude: 9.9654, longitude: 76.2424 }
  },
  {
    id: 'place_45',
    name: 'Mattancherry Palace',
    address: 'Palace Rd, Mattancherry, Kochi, Kerala 682002, India',
    coordinates: { latitude: 9.9576, longitude: 76.2615 }
  }
];

export async function searchPlaces(query: string, apiKey?: string, location?: { latitude: number; longitude: number }) {
  console.log('searchPlaces called with query:', query);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter places based on search query
  const filteredPlaces = MOCK_PLACES.filter(place => 
    place.name.toLowerCase().includes(query.toLowerCase()) ||
    place.address.toLowerCase().includes(query.toLowerCase())
  );
  
  console.log('Filtered places:', filteredPlaces);
  
  // Return filtered results only - don't fall back to all places
  return filteredPlaces;
}
