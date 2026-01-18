"""Seed initial emotions for autocomplete."""

from sqlalchemy import text

MIGRATION_ID = "001_seed_emotions"

EMOTIONS  = [
    "Abandoned", "Abhiman (Hindi)", "Accepted", "Acedia", "Admiration", "Adoration", 
    "Affection", "Agitated", "Agony", "Alarm", "Alienated", "Amae (Japanese)", 
    "Ambivalent", "Ambiguphobia", "Amazed", "Amused", "Anger", "Anguish", "Annoyed", 
    "Anticipation", "Anxiety", "Apathy", "Appalled", "Apprehensive", "Ashamed", 
    "Astonished", "Attachment", "At Ease", "Attracted", "Awe", "Awestruck", 
    "Aware (Japanese)", "Awumbuk (Baining, Papua New Guinea)", "Baffled", "Basorexia", 
    "Bedgasm", "Belonging", "Bemused", "Betrayed", "Bewildered", "Bitterness", 
    "Bliss", "Blocked", "Bored", "Brabant", "Brave", "Bruised", "Burned out", 
    "Buzzy", "Calm", "Carefree", "Caring", "Centered", "Chagrined", "Cheerful", 
    "Cherished", "Chill", "Clammy", "Comfortable", "Compassionate", "Compersion", 
    "Confident", "Conflicted", "Connected", "Contained", "Content", "Contentment", 
    "Contempt", "Contracted", "Courageous", "Craving", "Curious", "Cynical", 
    "Dépaysement (French)", "Defeated", "Delighted", "Depressed", "Desire", 
    "Despair", "Detached", "Determined", "Devoted", "Disconnected", "Disappointed", 
    "Discouraged", "Disengaged", "Disgruntled", "Disgusted", "Dismayed", "Distracted", 
    "Distress", "Dolce far niente (Italian)", "Doubt", "Down", "Drained", "Dread", 
    "Duende (Spanish)", "Eager", "Ecstatic", "Elation", "Embarrassed", "Empathetic", 
    "Empty", "Energized", "Enchanted", "Engaged", "Enthralled", "Enthusiastic", 
    "Envious", "Euphoria", "Evighed (Danish)", "Exasperated", "Excluded", "Expanded", 
    "Fatigued", "Fear", "Fiero (Italian)", "Flowing", "Focused", "Forelsket (Norwegian)", 
    "Forlorn", "FOMO", "Fragile", "Free", "Frightened", "Frustrated", "Fulfilled", 
    "Furious", "Gaiety", "Gentle", "Gezelligheid (Dutch)", "Gigil (Tagalog)", "Glum", 
    "Grateful", "Grief", "Grounded", "Guilt", "Han (Korean)", "Happy", "Heavy", 
    "Helpless", "Hollow", "Hopeful", "Hopeless", "Hostile", "Humiliated", "Hurt", 
    "Ijirashii (Japanese)", "Ikigai (Japanese)", "Ilinx", "Indifferent", "Insecure", 
    "Inspired", "Interested", "Intimate", "Invisible", "Irate", "Irritated", 
    "Jealous", "Joy", "Jovial", "Jubilant", "Jumpy", "Kaifas (Lithuanian)", 
    "Kilig (Tagalog)", "Knotted", "Lagom (Swedish)", "Liberated", "Light", "Lonely", 
    "Longing", "Loved", "Lust", "Lykke (Danish)", "Melancholy", "Meh", "Mellow", 
    "Mindful", "Misery", "Mono no aware (Japanese)", "Motivated", "Moved", 
    "Muditā (Sanskrit)", "Nauseous", "Neglected", "Nervous", "Nirvana (Sanskrit)", 
    "Nostalgic", "Numb", "Optimistic", "Overwhelmed", "Panicked", "Passionate", 
    "Peaceful", "Pessimistic", "Playful", "Pleased", "Proud", "Protected", "Radiant", 
    "Rage", "Rapture", "Relaxed", "Relieved", "Resentful", "Resigned", "Restless", 
    "Revitalized", "Sad", "Safe", "Satisfied", "Scared", "Secure", "Self-conscious", 
    "Serene", "Settled", "Shaken", "Shame", "Shy", "Sisu (Finnish)", "Skeptical", 
    "Soothed", "Spacey", "Supported", "Suspicious", "Tender", "Thankful", "Thrilled", 
    "Tired", "Torn", "Trapped", "Triumphant", "Troubled", "Trusting", "Ukiyo (Japanese)", 
    "Uneasy", "Unworthy", "Valued", "Vengeful", "Vibrant", "Vulnerable", "Warm", 
    "Welcomed", "Weltschmerz (German)", "Wistful", "Wonder", "Worried", "Yearning", 
    "Yūgen (Japanese)", "Zeal", "Achy", "Airy", "Blocked", "Breathless", "Burning", 
    "Clenched", "Cold", "Constricted", "Dizzy", "Dull", "Electric", "Fluid", 
    "Fluttery", "Frozen", "Full", "Hard", "Hot", "Icy", "Itchy", "Loose", "Pain", 
    "Pounding", "Prickly", "Pulsing", "Queasy", "Radiating", "Releasing", "Rigid", 
    "Sensitive", "Shaky", "Shivery", "Slow", "Smooth", "Soft", "Sore", "Spacious", 
    "Sparkly", "Stiff", "Still", "Suffocated", "Sweaty", "Tense", "Throbbing", 
    "Tight", "Tingling", "Trembly", "Twitchy", "Vibrating", "Wobbly", "Wooden"
]


async def up(conn):
    """Apply migration - seed initial emotions."""
    result = await conn.execute(text("SELECT COUNT(*) FROM emotions"))
    count = result.scalar()
    if count == 0:
        # Use dict.fromkeys to remove duplicates while preserving order
        unique_emotions = list(dict.fromkeys(EMOTIONS))
        for emotion in unique_emotions:
            await conn.execute(
                text("INSERT INTO emotions (id, name) VALUES (:id, :name)"),
                {"id": emotion, "name": emotion}
            )


async def down(conn):
    """Rollback migration - remove seeded emotions."""
    await conn.execute(
        text("DELETE FROM emotions WHERE id IN :ids"),
        {"ids": tuple(EMOTIONS)}
    )
