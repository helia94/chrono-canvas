export interface ArtEntry {
  name: string;
  description: string;
}

export interface ArtData {
  decade: string;
  region: string;
  artForm: string;
  popular: ArtEntry;
  timeless: ArtEntry;
}

export const regions = [
  "Western Europe",
  "Eastern Europe",
  "North America",
  "Latin America",
  "East Asia",
  "Africa & Middle East",
] as const;

export const artForms = [
  "Visual Arts",
  "Music",
  "Literature",
  "Performance",
  "Architecture",
  "Film",
] as const;

export const decades = [
  "1900", "1910", "1920", "1930", "1940", "1950",
  "1960", "1970", "1980", "1990", "2000", "2010", "2020"
] as const;

export type Region = typeof regions[number];
export type ArtForm = typeof artForms[number];
export type Decade = typeof decades[number];

// Mock data with various decade/region/artForm combinations
export const mockArtData: ArtData[] = [
  // 1920s
  {
    decade: "1920",
    region: "Western Europe",
    artForm: "Visual Arts",
    popular: {
      name: "Composition with Red, Blue and Yellow",
      description: "Piet Mondrian's defining work of the De Stijl movement, reducing painting to its essential elements of line, form, and primary color."
    },
    timeless: {
      name: "The Persistence of Memory",
      description: "Salvador Dalí's surrealist masterpiece exploring the fluid nature of time through melting clocks in a dreamlike landscape."
    }
  },
  {
    decade: "1920",
    region: "Western Europe",
    artForm: "Literature",
    popular: {
      name: "Ulysses",
      description: "James Joyce's monumental stream-of-consciousness novel, following Leopold Bloom through a single day in Dublin."
    },
    timeless: {
      name: "The Great Gatsby",
      description: "F. Scott Fitzgerald's meditation on the American Dream, wealth, and the impossibility of recapturing the past."
    }
  },
  {
    decade: "1920",
    region: "North America",
    artForm: "Music",
    popular: {
      name: "Rhapsody in Blue",
      description: "George Gershwin's groundbreaking fusion of classical and jazz, capturing the pulse of modern American life."
    },
    timeless: {
      name: "West End Blues",
      description: "Louis Armstrong's revolutionary recording that established jazz as a serious art form with virtuosic improvisation."
    }
  },
  {
    decade: "1920",
    region: "Eastern Europe",
    artForm: "Film",
    popular: {
      name: "Battleship Potemkin",
      description: "Sergei Eisenstein's revolutionary silent film, pioneering montage editing and becoming a landmark of world cinema."
    },
    timeless: {
      name: "The Man with a Movie Camera",
      description: "Dziga Vertov's experimental documentary, a poetic meditation on urban life and the possibilities of cinema."
    }
  },
  // 1930s
  {
    decade: "1930",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "American Gothic",
      description: "Grant Wood's iconic painting of rural American values, becoming one of the most parodied images in art history."
    },
    timeless: {
      name: "Nighthawks",
      description: "Edward Hopper's luminous depiction of urban isolation, capturing the loneliness beneath the surface of modern life."
    }
  },
  {
    decade: "1930",
    region: "Western Europe",
    artForm: "Architecture",
    popular: {
      name: "Villa Savoye",
      description: "Le Corbusier's purist masterpiece, embodying the five points of modern architecture on the outskirts of Paris."
    },
    timeless: {
      name: "Barcelona Pavilion",
      description: "Mies van der Rohe's flowing spatial composition, redefining architecture as the art of spatial experience."
    }
  },
  // 1950s
  {
    decade: "1950",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "No. 5, 1948",
      description: "Jackson Pollock's drip painting technique revolutionized art, making the act of creation as important as the result."
    },
    timeless: {
      name: "Flag",
      description: "Jasper Johns' iconic work blurring the line between object and representation, heralding Pop Art."
    }
  },
  {
    decade: "1950",
    region: "East Asia",
    artForm: "Film",
    popular: {
      name: "Rashomon",
      description: "Akira Kurosawa's groundbreaking film exploring subjective truth through multiple conflicting narratives."
    },
    timeless: {
      name: "Tokyo Story",
      description: "Yasujirō Ozu's quiet masterpiece on family, aging, and the passage of time in postwar Japan."
    }
  },
  // 1960s
  {
    decade: "1960",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "Campbell's Soup Cans",
      description: "Andy Warhol's iconic series transformed consumer products into high art, defining the Pop Art movement."
    },
    timeless: {
      name: "Who's Afraid of Red, Yellow and Blue",
      description: "Barnett Newman's monumental color field painting, exploring the sublime through pure chromatic experience."
    }
  },
  {
    decade: "1960",
    region: "Western Europe",
    artForm: "Music",
    popular: {
      name: "Sgt. Pepper's Lonely Hearts Club Band",
      description: "The Beatles' revolutionary concept album that elevated pop music to the realm of art."
    },
    timeless: {
      name: "Kind of Blue",
      description: "Miles Davis's modal jazz masterpiece, the best-selling jazz album of all time."
    }
  },
  {
    decade: "1960",
    region: "Latin America",
    artForm: "Literature",
    popular: {
      name: "One Hundred Years of Solitude",
      description: "Gabriel García Márquez's magical realist epic, tracing seven generations of the Buendía family."
    },
    timeless: {
      name: "Hopscotch",
      description: "Julio Cortázar's experimental novel that can be read in multiple orders, revolutionizing narrative structure."
    }
  },
  // 1970s
  {
    decade: "1970",
    region: "North America",
    artForm: "Film",
    popular: {
      name: "The Godfather",
      description: "Francis Ford Coppola's operatic crime saga, redefining the American gangster film."
    },
    timeless: {
      name: "Taxi Driver",
      description: "Martin Scorsese's descent into urban alienation, with Robert De Niro's unforgettable Travis Bickle."
    }
  },
  {
    decade: "1970",
    region: "Western Europe",
    artForm: "Performance",
    popular: {
      name: "Rhythm 0",
      description: "Marina Abramović's harrowing performance exploring vulnerability and human nature."
    },
    timeless: {
      name: "The Artist is Present",
      description: "Abramović's marathon of silent presence, creating profound connections through stillness."
    }
  },
  // 1980s
  {
    decade: "1980",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "Untitled (Skull)",
      description: "Jean-Michel Basquiat's raw, expressive work combining graffiti, neo-expressionism, and cultural commentary."
    },
    timeless: {
      name: "Radiant Baby",
      description: "Keith Haring's iconic symbol of hope and energy, bringing art to the streets and subways."
    }
  },
  {
    decade: "1980",
    region: "East Asia",
    artForm: "Film",
    popular: {
      name: "Ran",
      description: "Akira Kurosawa's epic reimagining of King Lear in feudal Japan, a visual masterpiece."
    },
    timeless: {
      name: "In the Mood for Love",
      description: "Wong Kar-wai's ravishing tale of unfulfilled desire in 1960s Hong Kong."
    }
  },
  // 1990s
  {
    decade: "1990",
    region: "Western Europe",
    artForm: "Visual Arts",
    popular: {
      name: "The Physical Impossibility of Death",
      description: "Damien Hirst's shark in formaldehyde, emblematic of the Young British Artists movement."
    },
    timeless: {
      name: "My Bed",
      description: "Tracey Emin's confessional installation, blurring art and autobiography."
    }
  },
  {
    decade: "1990",
    region: "Africa & Middle East",
    artForm: "Music",
    popular: {
      name: "Buena Vista Social Club",
      description: "The Grammy-winning album that introduced Cuban son music to a global audience."
    },
    timeless: {
      name: "Talking Timbuktu",
      description: "Ali Farka Touré and Ry Cooder's genre-defying collaboration bridging African and American blues."
    }
  },
  // 2000s
  {
    decade: "2000",
    region: "Western Europe",
    artForm: "Architecture",
    popular: {
      name: "30 St Mary Axe (The Gherkin)",
      description: "Norman Foster's distinctive London skyscraper, pioneering sustainable design in commercial architecture."
    },
    timeless: {
      name: "Tate Modern",
      description: "Herzog & de Meuron's transformation of a power station into one of the world's great modern art museums."
    }
  },
  {
    decade: "2000",
    region: "East Asia",
    artForm: "Visual Arts",
    popular: {
      name: "Infinity Mirror Rooms",
      description: "Yayoi Kusama's immersive installations creating endless reflections of light and space."
    },
    timeless: {
      name: "The Weather Project",
      description: "Olafur Eliasson's artificial sun in the Tate's Turbine Hall, blurring nature and artifice."
    }
  },
  // 2010s
  {
    decade: "2010",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "Rain Room",
      description: "Random International's immersive installation where visitors walk through rain without getting wet."
    },
    timeless: {
      name: "The Artist is Present (2010)",
      description: "Marina Abramović's three-month performance at MoMA, sitting silently with individual visitors."
    }
  },
  {
    decade: "2010",
    region: "Africa & Middle East",
    artForm: "Visual Arts",
    popular: {
      name: "All Things Bright and Beautiful",
      description: "El Anatsui's monumental tapestries woven from bottle caps, transforming waste into wonder."
    },
    timeless: {
      name: "Black Lines",
      description: "Julie Mehretu's vast abstract paintings mapping global flows of capital, migration, and power."
    }
  },
  // 2020s
  {
    decade: "2020",
    region: "North America",
    artForm: "Visual Arts",
    popular: {
      name: "Everydays: The First 5000 Days",
      description: "Beeple's record-breaking NFT sale, marking digital art's entry into the mainstream art market."
    },
    timeless: {
      name: "Refik Anadol's Machine Hallucinations",
      description: "AI-generated visual symphonies transforming data into immersive architectural experiences."
    }
  },
];

// Helper function to find art data
export function getArtData(decade: string, region: string, artForm: string): ArtData | null {
  return mockArtData.find(
    (data) => data.decade === decade && data.region === region && data.artForm === artForm
  ) || null;
}

// Get a default entry when no exact match exists
export function getDefaultOrArtData(decade: string, region: string, artForm: string): ArtData {
  const exact = getArtData(decade, region, artForm);
  if (exact) return exact;
  
  // Try to find something from the same decade
  const sameDecade = mockArtData.find((data) => data.decade === decade);
  if (sameDecade) return sameDecade;
  
  // Return the first entry as fallback
  return mockArtData[0];
}
