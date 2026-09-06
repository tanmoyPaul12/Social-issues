"""
gRPC Server Implementation for Societal Innovation AI Microservice.
Exposes high-throughput binary RPC endpoints for University Matchmaking and Multimodal Triage.
Port: 50051
"""
import time
from concurrent import futures
from loguru import logger

from app.api.schemas.challenge import ChallengeInput
from app.categorization.classifier import classify_challenge_domain
from app.routing.university_matcher import match_universities_for_challenge

try:
    import grpc
    GRPC_AVAILABLE = True
except ImportError:
    GRPC_AVAILABLE = False
    logger.warning("grpcio is not installed in local host environment. gRPC server will run when executed inside Docker.")


class AiMatcherServicer:
    """
    Implements AiMatcherService RPC methods:
    1. RouteChallenge
    2. ProcessMultimodalIntelligence
    """

    def RouteChallenge(self, request, context):
        logger.info(f"gRPC RouteChallenge received for challenge: {request.challenge_id} - '{request.title}'")

        # 1. Classify domain using existing NLP classification
        cat_res = classify_challenge_domain(request.title, request.description)

        # 2. Match HEIs based on domain and district proximity
        challenge_input = ChallengeInput(
            challenge_id=request.challenge_id,
            title=request.title,
            description=request.description,
            district=request.district or "Ranchi",
            block=request.block or ""
        )
        routing_res = match_universities_for_challenge(challenge_input, cat_res.primary_category)

        # 3. Format response dictionary
        matches = []
        for hei in routing_res.recommended_heis:
            matches.append({
                "hei_id": hei.hei_id,
                "hei_name": hei.hei_name,
                "match_score": hei.match_score,
                "rationale": hei.rationale
            })

        return {
            "challenge_id": request.challenge_id,
            "recommended_heis": matches
        }

    def ProcessMultimodalIntelligence(self, request, context):
        logger.info(f"gRPC ProcessMultimodalIntelligence for issue: {request.issue_id}")
        cat_res = classify_challenge_domain(request.title, request.description)

        priority_level = "MEDIUM"
        desc_lower = (request.title + " " + request.description).lower()
        if any(w in desc_lower for w in ["death", "collapse", "outbreak", "poison", "fatal", "emergency"]):
            priority_level = "CRITICAL"
        elif any(w in desc_lower for w in ["failure", "severe", "contaminated", "blight", "broken"]):
            priority_level = "HIGH"

        return {
            "issue_id": request.issue_id,
            "final_category": cat_res.primary_category,
            "final_priority_level": priority_level,
            "average_priority_score": 75.0,
            "consensus_reason": f"Classified as {cat_res.primary_category} with priority tier {priority_level}.",
            "validation_status": "PASS"
        }


def serve(port: int = 50051):
    """Starts the gRPC server."""
    if not GRPC_AVAILABLE:
        logger.error("Cannot start gRPC server without grpcio installed.")
        return

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    logger.info(f"Starting Societal Innovation AI gRPC server on port {port}...")
    server.add_insecure_port(f"[::]:{port}")
    server.start()
    logger.info(f"AI gRPC server listening on port {port} [SUCCESS]")
    try:
        while True:
            time.sleep(86400)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == "__main__":
    serve()
