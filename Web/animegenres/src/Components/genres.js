import * as chroma from "chroma-js";
import _ from "lodash";

// All the genres with category from v1 
const allgenres = [
  {"category": "genres1", "genre": "Romance"},
  {"category": "genres1", "genre": "Shoujo"},
  {"category": "genres1", "genre": "Josei"},
  {"category": "genres1", "genre": "Slice of Life"},
  {"category": "genres1", "genre": "School"},
  {"category": "genres1", "genre": "Comedy"},
  {"category": "genres1", "genre": "Parody"},
  {"category": "genres1", "genre": "Music"},
  {"category": "genres2", "genre": "Drama"},
  {"category": "genres3", "genre": "Kids"},
  {"category": "genres4", "genre": 'Shounen'},
  {"category": "genres4", "genre": "Action"},
  {"category": "genres4", "genre": "Thriller"},
  {"category": "genres4", "genre": "Fantasy"},
  {"category": "genres4", "genre": "Adventure"},
  {"category": "genres4", "genre": "Supernatural"},
  {"category": "genres4", "genre": "Super Power"},
  {"category": "genres4", "genre": 'Magic'},
  {"category": "genres4", "genre": "Demons"},
  {"category": "genres4", "genre": "Historical"},
  {"category": "genres4", "genre": "Seinen"},
  {"category": "genres4", "genre": "Mystery"},
  {"category": "genres4", "genre": "Horror"},
  {"category": "genres4", "genre": "Sports"},
  {"category": "genres4", "genre": "Game"},
  {"category": "genres4", "genre": "Martial Arts"},
  {"category": "genres4", "genre": "Samurai"},
  {"category": "genres4", "genre": "Vampire"},
  {"category": "genres4", "genre": "Cars"},
  {"category": "genres5", "genre": 'Sci-Fi'},
  {"category": "genres5", "genre": "Mecha"},
  {"category": "genres5", "genre": "Space"},
  {"category": "genres5", "genre": "Psychological"},
  {"category": "genres5", "genre": "Dementia"},
  {"category": "genres5", "genre": "Police"},
  {"category": "genres5", "genre": "Military"},
  {"category": "genres6", "genre": 'Hentai'},
  {"category": "genres6", "genre": "Ecchi"},
  {"category": "genres6", "genre": "Harem"},
  {"category": "genres6", "genre": "Shounen Ai"},
  {"category": "genres6", "genre": "Shoujo Ai"},
  {"category": "genres6", "genre": "Yaoi"},
  {"category": "genres6", "genre": "Yuri"},
]

// Genres v1 
const genres_categories = [
  {category: "genres1", genres: ["Romance", "Shoujo", "Josei", "Slice of Life", "School", 'Comedy', "Parody", "Music"]},
  {category: "genres2", genres: ['Drama']},
  {category: "genres3", genres: ['Kids']},
  {category: "genres4", genres: ['Shounen','Action', "Thriller",'Fantasy', 'Adventure', 
  "Supernatural", "Super Power", "Magic", "Demons", "Historical", "Seinen", 
  "Mystery", "Horror", "Sports",  "Game", "Martial Arts",  "Samurai",  
  "Vampire","Cars"]},
  {category: "genres5", genres: ['Sci-Fi', "Mecha", "Space", "Psychological", "Dementia", "Police", "Military"]},
  {category: "genres6", genres: ['Hentai', "Ecchi", "Harem", "Shounen Ai", "Shoujo Ai", "Yaoi", "Yuri"]}
];

// Colour Scale per category of genres v1 
const colorScale1 = chroma.scale(["#f14f8a", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres1' }).genres.length)
const colorScale2 = chroma.scale(["#9e0059", "#9e0059"]).colors(_.find(genres_categories, { 'category': 'genres2' }).genres.length)
const colorScale3 = chroma.scale(["#21ABC0", "#21ABC0"]).colors(_.find(genres_categories, { 'category': 'genres3' }).genres.length)
const colorScale4 = chroma.scale(["#21ABC0", "#268ECF"]).colors(_.find(genres_categories, { 'category': 'genres4' }).genres.length)
const colorScale5 = chroma.scale(["#4a4e69", "#22223b"]).colors(_.find(genres_categories, { 'category': 'genres5' }).genres.length)
const colorScale6 = chroma.scale(["#f14f8a", "#f14f8a"]).colors(_.find(genres_categories, { 'category': 'genres6' }).genres.length)
const colorScales = {
        "genres1": colorScale1,
        "genres2": colorScale2,
        "genres3": colorScale3,
        "genres4": colorScale4,
        "genres5": colorScale5,
        "genres6": colorScale6
}

export { allgenres, genres_categories, colorScales }