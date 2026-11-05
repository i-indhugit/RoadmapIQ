"""
Aggregates all 18 domains (A through R) into a single DOMAIN_GROUPS list.
Total roles: 241 roles across all educational and professional domains.
"""
from app.engine.domain_definitions_part1 import DOMAIN_A, DOMAIN_B, DOMAIN_C
from app.engine.domain_definitions_part2 import (
    DOMAIN_D, DOMAIN_E, DOMAIN_F, DOMAIN_G, DOMAIN_H, DOMAIN_I
)
from app.engine.domain_definitions_part3 import (
    DOMAIN_J, DOMAIN_K, DOMAIN_L, DOMAIN_M, DOMAIN_N, DOMAIN_O,
    DOMAIN_P, DOMAIN_Q, DOMAIN_R
)

DOMAIN_GROUPS = [
    DOMAIN_A,  # Technology and IT (28)
    DOMAIN_B,  # AI & Machine Learning (15)
    DOMAIN_C,  # Data Science & Analytics (14)
    DOMAIN_D,  # Commerce, Finance & Banking (17)
    DOMAIN_E,  # Arts, Humanities & Social Sciences (20)
    DOMAIN_F,  # Business, Management & Consulting (16)
    DOMAIN_G,  # Healthcare, Medicine & Life Sciences (15)
    DOMAIN_H,  # Core Engineering (15)
    DOMAIN_I,  # Cybersecurity & Information Security (12)
    DOMAIN_J,  # Cloud, DevOps & Systems Engineering (12)
    DOMAIN_K,  # Law & Legal Services (11)
    DOMAIN_L,  # Education, Teaching & Academic Research (12)
    DOMAIN_M,  # Government, Civil Services & Public Policy (12)
    DOMAIN_N,  # Psychology & Behavioral Sciences (10)
    DOMAIN_O,  # Design, Media & Creative Arts (14)
    DOMAIN_P,  # Hospitality, Tourism & Event Management (10)
    DOMAIN_Q,  # Agriculture, Environment & Sustainability (11)
    DOMAIN_R,  # Entrepreneurship & Startups (9)
]

def get_total_role_count():
    count = 0
    for grp in DOMAIN_GROUPS:
        count += len(grp["roles"])
    return count

if __name__ == "__main__":
    print(f"Total domains: {len(DOMAIN_GROUPS)}")
    print(f"Total career roles across all domains: {get_total_role_count()}")

