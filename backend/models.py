from pydantic import BaseModel
from typing import Optional
from enum import Enum


class Region(str, Enum):
    WESTERN_EUROPE = "Western Europe"
    EASTERN_EUROPE = "Eastern Europe"
    NORTH_AMERICA = "North America"
    LATIN_AMERICA = "Latin America"
    EAST_ASIA = "East Asia"
    AFRICA_MIDDLE_EAST = "Africa & Middle East"


class ArtForm(str, Enum):
    VISUAL_ARTS = "Visual Arts"
    MUSIC = "Music"
    LITERATURE = "Literature"


class TimePeriod(str, Enum):
    P1500 = "1500"
    P1550 = "1550"
    P1600 = "1600"
    P1650 = "1650"
    P1700 = "1700"
    P1750 = "1750"
    P1800 = "1800"
    P1850 = "1850"
    P1900 = "1900"
    P1910 = "1910"
    P1920 = "1920"
    P1930 = "1930"
    P1940 = "1940"
    P1950 = "1950"
    P1960 = "1960"
    P1970 = "1970"
    P1980 = "1980"
    P1990 = "1990"
    P2000 = "2000"
    P2010 = "2010"
    P2020 = "2020"


class ArtEntry(BaseModel):
    name: str
    description: str


class ArtData(BaseModel):
    decade: str
    region: str
    artForm: str
    popular: ArtEntry
    timeless: ArtEntry


class ConfigResponse(BaseModel):
    regions: list[str]
    artForms: list[str]
    timePeriods: list[str]


class ArtDataResponse(BaseModel):
    data: Optional[ArtData]
    found: bool

