"""Mock art data - will be replaced with actual logic later."""

from typing import Optional
from models import ArtData, ArtEntry

# Configuration lists
REGIONS = [
    "Western Europe",
    "Eastern Europe",
    "North America",
    "Latin America",
    "East Asia",
    "Africa & Middle East",
]

ART_FORMS = [
    "Visual Arts",
    "Music",
    "Literature",
]

# Before 1900: 50-year intervals, after 1900: 10-year intervals
TIME_PERIODS = [
    "1500", "1550", "1600", "1650", "1700", "1750", "1800", "1850",
    "1900", "1910", "1920", "1930", "1940", "1950",
    "1960", "1970", "1980", "1990", "2000", "2010", "2020"
]

# Mock data with various decade/region/artForm combinations
MOCK_ART_DATA: list[ArtData] = [
    # 1920s
    ArtData(
        decade="1920",
        region="Western Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Composition with Red, Blue and Yellow",
            description="Piet Mondrian's defining work of the De Stijl movement, reducing painting to its essential elements of line, form, and primary color."
        ),
        timeless=ArtEntry(
            name="The Persistence of Memory",
            description="Salvador Dalí's surrealist masterpiece exploring the fluid nature of time through melting clocks in a dreamlike landscape."
        )
    ),
    ArtData(
        decade="1920",
        region="Western Europe",
        artForm="Literature",
        popular=ArtEntry(
            name="Ulysses",
            description="James Joyce's monumental stream-of-consciousness novel, following Leopold Bloom through a single day in Dublin."
        ),
        timeless=ArtEntry(
            name="The Great Gatsby",
            description="F. Scott Fitzgerald's meditation on the American Dream, wealth, and the impossibility of recapturing the past."
        )
    ),
    ArtData(
        decade="1920",
        region="North America",
        artForm="Music",
        popular=ArtEntry(
            name="Rhapsody in Blue",
            description="George Gershwin's groundbreaking fusion of classical and jazz, capturing the pulse of modern American life."
        ),
        timeless=ArtEntry(
            name="West End Blues",
            description="Louis Armstrong's revolutionary recording that established jazz as a serious art form with virtuosic improvisation."
        )
    ),
    ArtData(
        decade="1920",
        region="Eastern Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Battleship Potemkin",
            description="Sergei Eisenstein's revolutionary silent film, pioneering montage editing and becoming a landmark of world cinema."
        ),
        timeless=ArtEntry(
            name="The Man with a Movie Camera",
            description="Dziga Vertov's experimental documentary, a poetic meditation on urban life and the possibilities of cinema."
        )
    ),
    # 1930s
    ArtData(
        decade="1930",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="American Gothic",
            description="Grant Wood's iconic painting of rural American values, becoming one of the most parodied images in art history."
        ),
        timeless=ArtEntry(
            name="Nighthawks",
            description="Edward Hopper's luminous depiction of urban isolation, capturing the loneliness beneath the surface of modern life."
        )
    ),
    ArtData(
        decade="1930",
        region="Western Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Villa Savoye",
            description="Le Corbusier's purist masterpiece, embodying the five points of modern architecture on the outskirts of Paris."
        ),
        timeless=ArtEntry(
            name="Barcelona Pavilion",
            description="Mies van der Rohe's flowing spatial composition, redefining architecture as the art of spatial experience."
        )
    ),
    # 1950s
    ArtData(
        decade="1950",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="No. 5, 1948",
            description="Jackson Pollock's drip painting technique revolutionized art, making the act of creation as important as the result."
        ),
        timeless=ArtEntry(
            name="Flag",
            description="Jasper Johns' iconic work blurring the line between object and representation, heralding Pop Art."
        )
    ),
    ArtData(
        decade="1950",
        region="East Asia",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Rashomon",
            description="Akira Kurosawa's groundbreaking film exploring subjective truth through multiple conflicting narratives."
        ),
        timeless=ArtEntry(
            name="Tokyo Story",
            description="Yasujirō Ozu's quiet masterpiece on family, aging, and the passage of time in postwar Japan."
        )
    ),
    # 1960s
    ArtData(
        decade="1960",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Campbell's Soup Cans",
            description="Andy Warhol's iconic series transformed consumer products into high art, defining the Pop Art movement."
        ),
        timeless=ArtEntry(
            name="Who's Afraid of Red, Yellow and Blue",
            description="Barnett Newman's monumental color field painting, exploring the sublime through pure chromatic experience."
        )
    ),
    ArtData(
        decade="1960",
        region="Western Europe",
        artForm="Music",
        popular=ArtEntry(
            name="Sgt. Pepper's Lonely Hearts Club Band",
            description="The Beatles' revolutionary concept album that elevated pop music to the realm of art."
        ),
        timeless=ArtEntry(
            name="Kind of Blue",
            description="Miles Davis's modal jazz masterpiece, the best-selling jazz album of all time."
        )
    ),
    ArtData(
        decade="1960",
        region="Latin America",
        artForm="Literature",
        popular=ArtEntry(
            name="One Hundred Years of Solitude",
            description="Gabriel García Márquez's magical realist epic, tracing seven generations of the Buendía family."
        ),
        timeless=ArtEntry(
            name="Hopscotch",
            description="Julio Cortázar's experimental novel that can be read in multiple orders, revolutionizing narrative structure."
        )
    ),
    # 1970s
    ArtData(
        decade="1970",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="The Godfather",
            description="Francis Ford Coppola's operatic crime saga, redefining the American gangster film."
        ),
        timeless=ArtEntry(
            name="Taxi Driver",
            description="Martin Scorsese's descent into urban alienation, with Robert De Niro's unforgettable Travis Bickle."
        )
    ),
    ArtData(
        decade="1970",
        region="Western Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Rhythm 0",
            description="Marina Abramović's harrowing performance exploring vulnerability and human nature."
        ),
        timeless=ArtEntry(
            name="The Artist is Present",
            description="Abramović's marathon of silent presence, creating profound connections through stillness."
        )
    ),
    # 1980s
    ArtData(
        decade="1980",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Untitled (Skull)",
            description="Jean-Michel Basquiat's raw, expressive work combining graffiti, neo-expressionism, and cultural commentary."
        ),
        timeless=ArtEntry(
            name="Radiant Baby",
            description="Keith Haring's iconic symbol of hope and energy, bringing art to the streets and subways."
        )
    ),
    ArtData(
        decade="1980",
        region="East Asia",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Ran",
            description="Akira Kurosawa's epic reimagining of King Lear in feudal Japan, a visual masterpiece."
        ),
        timeless=ArtEntry(
            name="In the Mood for Love",
            description="Wong Kar-wai's ravishing tale of unfulfilled desire in 1960s Hong Kong."
        )
    ),
    # 1990s
    ArtData(
        decade="1990",
        region="Western Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="The Physical Impossibility of Death",
            description="Damien Hirst's shark in formaldehyde, emblematic of the Young British Artists movement."
        ),
        timeless=ArtEntry(
            name="My Bed",
            description="Tracey Emin's confessional installation, blurring art and autobiography."
        )
    ),
    ArtData(
        decade="1990",
        region="Africa & Middle East",
        artForm="Music",
        popular=ArtEntry(
            name="Buena Vista Social Club",
            description="The Grammy-winning album that introduced Cuban son music to a global audience."
        ),
        timeless=ArtEntry(
            name="Talking Timbuktu",
            description="Ali Farka Touré and Ry Cooder's genre-defying collaboration bridging African and American blues."
        )
    ),
    # 2000s
    ArtData(
        decade="2000",
        region="Western Europe",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="30 St Mary Axe (The Gherkin)",
            description="Norman Foster's distinctive London skyscraper, pioneering sustainable design in commercial architecture."
        ),
        timeless=ArtEntry(
            name="Tate Modern",
            description="Herzog & de Meuron's transformation of a power station into one of the world's great modern art museums."
        )
    ),
    ArtData(
        decade="2000",
        region="East Asia",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Infinity Mirror Rooms",
            description="Yayoi Kusama's immersive installations creating endless reflections of light and space."
        ),
        timeless=ArtEntry(
            name="The Weather Project",
            description="Olafur Eliasson's artificial sun in the Tate's Turbine Hall, blurring nature and artifice."
        )
    ),
    # 2010s
    ArtData(
        decade="2010",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Rain Room",
            description="Random International's immersive installation where visitors walk through rain without getting wet."
        ),
        timeless=ArtEntry(
            name="The Artist is Present (2010)",
            description="Marina Abramović's three-month performance at MoMA, sitting silently with individual visitors."
        )
    ),
    ArtData(
        decade="2010",
        region="Africa & Middle East",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="All Things Bright and Beautiful",
            description="El Anatsui's monumental tapestries woven from bottle caps, transforming waste into wonder."
        ),
        timeless=ArtEntry(
            name="Black Lines",
            description="Julie Mehretu's vast abstract paintings mapping global flows of capital, migration, and power."
        )
    ),
    # 2020s
    ArtData(
        decade="2020",
        region="North America",
        artForm="Visual Arts",
        popular=ArtEntry(
            name="Everydays: The First 5000 Days",
            description="Beeple's record-breaking NFT sale, marking digital art's entry into the mainstream art market."
        ),
        timeless=ArtEntry(
            name="Refik Anadol's Machine Hallucinations",
            description="AI-generated visual symphonies transforming data into immersive architectural experiences."
        )
    ),
]


def get_art_data(decade: str, region: str, art_form: str) -> Optional[ArtData]:
    """Find art data for exact match of decade, region, and art form."""
    for data in MOCK_ART_DATA:
        if data.decade == decade and data.region == region and data.artForm == art_form:
            return data
    return None


def get_default_or_art_data(decade: str, region: str, art_form: str) -> ArtData:
    """Get art data with fallback to same decade or first entry."""
    exact = get_art_data(decade, region, art_form)
    if exact:
        return exact
    
    # Try to find something from the same decade
    for data in MOCK_ART_DATA:
        if data.decade == decade:
            return data
    
    # Return the first entry as fallback
    return MOCK_ART_DATA[0]

