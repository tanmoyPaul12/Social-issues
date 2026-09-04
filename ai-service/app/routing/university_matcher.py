"""
University Matcher Engine: Ranks and recommends top Jharkhand Higher Education Institutions (HEIs)
matching the classified challenge domain and geographical district.
"""
from typing import List
from app.api.schemas.challenge import ChallengeInput
from app.api.schemas.routing import RoutingResult, HEIMatch
from app.routing.university_profile import JHARKHAND_HEIS

def match_universities_for_challenge(challenge: ChallengeInput, classified_domain: str) -> RoutingResult:
    """Matches and ranks top 3 HEI capstone labs best equipped to solve the challenge."""
    matches: List[HEIMatch] = []
    
    for hei in JHARKHAND_HEIS:
        score = 0.5
        # Match domain expertise
        if classified_domain in hei["domains"]:
            score += 0.35
        # Match geographic district proximity
        if challenge.district.lower() == hei["district"].lower():
            score += 0.15
            
        rationale = f"Matched based on research domain '{classified_domain}' and regional lab capabilities in {hei['district']}."
        matches.append(HEIMatch(
            hei_id=hei["hei_id"],
            hei_name=hei["name"],
            match_score=round(score, 2),
            rationale=rationale
        ))
        
    sorted_matches = sorted(matches, key=lambda x: x.match_score, reverse=True)[:3]
    return RoutingResult(recommended_heis=sorted_matches)
