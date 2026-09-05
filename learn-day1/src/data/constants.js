export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "YOUR_YOUTUBE_DATA_API_KEY";
export const SPOTIFY_ACCESS_TOKEN = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN || "";
export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";

export const COUNTRY = {
  US: "us", UK: "gb", AU: "au", CA: "ca", DE: "de", JP: "jp", PH: "ph", MX: "mx", AR: "ar",
};

export const GENRE_MATCH = {
  pop: /^pop$/i,
  rnb: /r&b|soul/i,
  edm: /dance|electronic/i,
};

export const PLACEHOLDER_COVER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23141414'/%3E%3Ccircle cx='300' cy='300' r='150' fill='none' stroke='%23555555' stroke-width='10'/%3E%3Ccircle cx='300' cy='300' r='35' fill='%23ffffff'/%3E%3C/svg%3E";

export const FALLBACK_SEEDS = [
  ["Blinding Lights", "The Weeknd", "Pop", "US"], ["As It Was", "Harry Styles", "Pop", "UK"], ["Espresso", "Sabrina Carpenter", "Pop", "US"], ["Cruel Summer", "Taylor Swift", "Pop", "US"], ["Flowers", "Miley Cyrus", "Pop", "US"], ["Houdini", "Dua Lipa", "Pop", "UK"], ["Good 4 U", "Olivia Rodrigo", "Pop", "US"], ["greedy", "Tate McRae", "Pop", "CA"], ["Watermelon Sugar", "Harry Styles", "Pop", "UK"], ["Anti-Hero", "Taylor Swift", "Pop", "US"], ["I Had Some Help", "Post Malone", "Pop", "US"], ["Beautiful Things", "Benson Boone", "Pop", "US"],
  ["Snooze", "SZA", "R&B", "US"], ["Kill Bill", "SZA", "R&B", "US"], ["Saturn", "SZA", "R&B", "US"], ["One Of The Girls", "The Weeknd", "R&B", "US"], ["Pink + White", "Frank Ocean", "R&B", "US"], ["Made For Me", "Muni Long", "R&B", "US"], ["ICU", "Coco Jones", "R&B", "US"], ["No One", "Alicia Keys", "R&B", "US"], ["Adorn", "Miguel", "R&B", "US"], ["Damage", "H.E.R.", "R&B", "US"],
  ["Innerbloom", "RUFUS DU SOL", "EDM", "AU"], ["The Nights", "Avicii", "EDM", "SE"], ["Wake Me Up", "Avicii", "EDM", "SE"], ["Animals", "Martin Garrix", "EDM", "NL"], ["One Kiss", "Calvin Harris", "EDM", "UK"], ["Where You Are", "John Summit", "EDM", "US"], ["Ferrari", "James Hype", "EDM", "UK"], ["Levels", "Avicii", "EDM", "SE"], ["I Remember", "Kaskade", "EDM", "US"], ["Don't You Worry Child", "Swedish House Mafia", "EDM", "SE"],
  ["アイドル", "YOASOBI", "J-Pop", "JP"], ["夜に駆ける", "YOASOBI", "J-Pop", "JP"], ["青のすみか", "キタニタツヤ", "J-Pop", "JP"], ["唱", "Ado", "J-Pop", "JP"], ["Lemon", "Kenshi Yonezu", "J-Pop", "JP"], ["Magnetic", "ILLIT", "Pop", "JP"], ["Bling-Bang-Bang-Born", "Creepy Nuts", "J-Pop", "JP"], ["SPECIALZ", "King Gnu", "J-Pop", "JP"], ["Pretender", "Official HIGE DANdism", "J-Pop", "JP"], ["KICK BACK", "Kenshi Yonezu", "J-Pop", "JP"],
  ["Pantropiko", "BINI", "Pop", "PH"], ["Salamin, Salamin", "BINI", "Pop", "PH"], ["ERE", "juan karlos", "Pop", "PH"], ["Dilaw", "Maki", "Pop", "PH"], ["Araw-Araw", "Ben&Ben", "Pop", "PH"], ["Tadhana", "Up Dharma Down", "Pop", "PH"], ["Raining in Manila", "Lola Amour", "Pop", "PH"], ["Ikaw Lang", "NOBITA", "Pop", "PH"], ["Mundo", "IV of Spades", "Pop", "PH"], ["Mahika", "Adie", "Pop", "PH"],
  ["La Bebe", "Yng Lvcas", "Latin", "MX"], ["Ella Baila Sola", "Eslabon Armado", "Latin", "MX"], ["LALA", "Myke Towers", "Latin", "AR"], ["PROVENZA", "Karol G", "Latin", "CO"], ["DESPECHÁ", "ROSALÍA", "Latin", "ES"], ["Bailando", "Enrique Iglesias", "Latin", "ES"], ["TQG", "Karol G", "Latin", "CO"], ["La Falda", "Myke Towers", "Latin", "PR"], ["Un x100to", "Grupo Frontera", "Latin", "MX"], ["Qué Onda", "Calle 24", "Latin", "MX"],
].map(([title, artist, genre, country], index) => ({ id: `fallback-${index}`, title, artist, album: "Single", cover: PLACEHOLDER_COVER, duration: "3:30", durationSeconds: 210, genre, country, views: `${(2.4 + (index * 1.7) % 18).toFixed(1)}M monthly listeners`, previewUrl: null }));
