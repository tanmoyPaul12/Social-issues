# Codebase Architecture Tree

```
/home/bappaditya/coding/2026 Projects/sih project/Social-issues
├── ai-service
│   ├── app
│   │   ├── api
│   │   │   ├── routes
│   │   │   │   ├── analyze.py
│   │   │   │   ├── categorization.py
│   │   │   │   ├── crawl.py
│   │   │   │   ├── deduplication.py
│   │   │   │   ├── health.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── intelligence.py
│   │   │   │   ├── preprocess.py
│   │   │   │   ├── prioritization.py
│   │   │   │   ├── routing.py
│   │   │   │   └── validation.py
│   │   │   ├── schemas
│   │   │   │   ├── attachment.py
│   │   │   │   ├── category.py
│   │   │   │   ├── challenge.py
│   │   │   │   ├── duplicate.py
│   │   │   │   ├── enums.py
│   │   │   │   ├── evidence.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── location.py
│   │   │   │   ├── preprocessing.py
│   │   │   │   ├── priority.py
│   │   │   │   ├── response.py
│   │   │   │   ├── routing.py
│   │   │   │   ├── text.py
│   │   │   │   └── validation.py
│   │   │   └── __init__.py
│   │   ├── categorization
│   │   │   ├── category_definitions.py
│   │   │   ├── category_embeddings.py
│   │   │   ├── classifier.py
│   │   │   ├── __init__.py
│   │   │   └── multilingual_categorizer.py
│   │   ├── config
│   │   │   ├── __init__.py
│   │   │   └── settings.py
│   │   ├── core
│   │   │   └── config.py
│   │   ├── deduplication
│   │   │   ├── duplicate_checker.py
│   │   │   ├── embedding_search.py
│   │   │   ├── __init__.py
│   │   │   └── similarity.py
│   │   ├── domain
│   │   │   ├── intelligence
│   │   │   │   ├── categorization
│   │   │   │   │   └── categorizer.py
│   │   │   │   ├── prioritization
│   │   │   │   │   └── priority_engine.py
│   │   │   │   ├── issue_context_builder.py
│   │   │   │   └── issue_validator.py
│   │   │   ├── preprocessing
│   │   │   │   ├── document
│   │   │   │   │   ├── document_preprocessor.py
│   │   │   │   │   └── document_validator.py
│   │   │   │   ├── image
│   │   │   │   │   ├── image_preprocessor.py
│   │   │   │   │   └── image_validator.py
│   │   │   │   ├── location
│   │   │   │   │   └── location_processor.py
│   │   │   │   ├── language_detector.py
│   │   │   │   ├── text_cleaner.py
│   │   │   │   ├── text_preprocessor.py
│   │   │   │   ├── translation_validator.py
│   │   │   │   └── transliterator.py
│   │   │   └── routing
│   │   │       └── models.py
│   │   ├── infrastructure
│   │   │   ├── crawler
│   │   │   │   ├── client.py
│   │   │   │   ├── crawl4ai_adapter.py
│   │   │   │   ├── engine.py
│   │   │   │   ├── faculty_discovery.py
│   │   │   │   ├── hash.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── normalizer.py
│   │   │   │   ├── parser.py
│   │   │   │   ├── robots.py
│   │   │   │   ├── ssrf.py
│   │   │   │   └── storage.py
│   │   │   ├── database
│   │   │   │   ├── client.py
│   │   │   │   ├── health.py
│   │   │   │   └── __init__.py
│   │   │   ├── extractor
│   │   │   │   ├── langgraph_pipeline.py
│   │   │   │   ├── markdown_exporter.py
│   │   │   │   └── schemas.py
│   │   │   ├── __init__.py
│   │   │   ├── model_manager.py
│   │   │   ├── storage.py
│   │   │   └── vector_store.py
│   │   ├── ml
│   │   │   ├── providers
│   │   │   │   ├── base.py
│   │   │   │   ├── gemini_provider.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── mock_provider.py
│   │   │   │   └── nvidia_vision_provider.py
│   │   │   └── translation
│   │   │       ├── base.py
│   │   │       ├── cloud_provider.py
│   │   │       ├── indictrans2_provider.py
│   │   │       ├── mock_provider.py
│   │   │       └── nvidia_provider.py
│   │   ├── models
│   │   │   ├── document
│   │   │   │   ├── __init__.py
│   │   │   │   └── ocr_model.py
│   │   │   ├── text
│   │   │   │   ├── embedding_model.py
│   │   │   │   ├── __init__.py
│   │   │   │   └── translation_model.py
│   │   │   ├── vision
│   │   │   │   ├── __init__.py
│   │   │   │   └── mobileclip_model.py
│   │   │   └── __init__.py
│   │   ├── pipelines
│   │   │   ├── challenge_pipeline.py
│   │   │   └── __init__.py
│   │   ├── preprocessing
│   │   │   ├── document
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ocr_processor.py
│   │   │   │   └── pdf_extractor.py
│   │   │   ├── image
│   │   │   │   ├── image_processor.py
│   │   │   │   └── __init__.py
│   │   │   ├── location
│   │   │   │   └── __init__.py
│   │   │   ├── text
│   │   │   │   ├── embedding_service.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── language_detector.py
│   │   │   │   ├── text_cleaner.py
│   │   │   │   ├── text_preprocessor.py
│   │   │   │   ├── translation_quality.py
│   │   │   │   ├── translator.py
│   │   │   │   └── transliterator.py
│   │   │   ├── video
│   │   │   │   ├── frame_extractor.py
│   │   │   │   └── __init__.py
│   │   │   ├── __init__.py
│   │   │   └── orchestrator.py
│   │   ├── prioritization
│   │   │   ├── __init__.py
│   │   │   ├── priority_engine.py
│   │   │   ├── priority_features.py
│   │   │   └── priority_rules.py
│   │   ├── routing
│   │   │   ├── __init__.py
│   │   │   ├── university_embeddings.py
│   │   │   ├── university_matcher.py
│   │   │   └── university_profile.py
│   │   ├── services
│   │   │   └── crawl_service.py
│   │   ├── utils
│   │   │   ├── device.py
│   │   │   ├── hashing.py
│   │   │   ├── __init__.py
│   │   │   └── logger.py
│   │   ├── validation
│   │   │   ├── document_validator.py
│   │   │   ├── image_validator.py
│   │   │   ├── __init__.py
│   │   │   ├── location_validator.py
│   │   │   ├── orchestrator.py
│   │   │   ├── text_validator.py
│   │   │   └── video_validator.py
│   │   ├── verification
│   │   │   ├── consistency_checker.py
│   │   │   ├── evidence_score.py
│   │   │   ├── __init__.py
│   │   │   └── verification_engine.py
│   │   ├── grpc_server.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── database
│   │   ├── migrations
│   │   │   ├── 001_university_schema.sql
│   │   │   ├── 002_expertise_relationships.sql
│   │   │   ├── 003_crawler_schema.sql
│   │   │   └── 004_vector_embeddings.sql
│   │   └── seed
│   │       ├── crawl_configuration_seed.py
│   │       └── taxonomy_seed.py
│   ├── scripts
│   │   ├── crawl_academic_records.py
│   │   ├── crawl_bitmesra_about.py
│   │   ├── crawl_bitmesra_faculty.py
│   │   ├── crawl_bitmesra_patents.py
│   │   ├── crawl_bitmesra_research.py
│   │   ├── crawl_edc_bitmesra.py
│   │   ├── crawl_ism_iie.py
│   │   ├── crawl_ism_research.py
│   │   ├── crawl_research_facilities.py
│   │   ├── crawl_research_projects.py
│   │   ├── crawl_university.py
│   │   ├── deep_crawl_universities.py
│   │   ├── discover_urls.py
│   │   ├── extract_university_knowledge.py
│   │   ├── purge_mock_universities.py
│   │   ├── seed_bitmesra_urls.py
│   │   ├── setup_indictrans2.py
│   │   ├── test_api.sh
│   │   ├── test_crawl4ai2.py
│   │   ├── test_crawl4ai.py
│   │   └── test_indictrans2.py
│   ├── tests
│   │   ├── crawler
│   │   │   ├── __init__.py
│   │   │   ├── test_change_detection.py
│   │   │   ├── test_crawler_engine.py
│   │   │   ├── test_normalizer.py
│   │   │   ├── test_parser.py
│   │   │   ├── test_robots.py
│   │   │   └── test_ssrf.py
│   │   ├── database
│   │   │   └── test_database.py
│   │   ├── document
│   │   │   └── Untitled design.pdf
│   │   ├── extractor
│   │   │   ├── __init__.py
│   │   │   ├── test_langgraph_pipeline.py
│   │   │   ├── test_markdown_exporter.py
│   │   │   └── test_schemas.py
│   │   ├── conftest.py
│   │   ├── __init__.py
│   │   ├── test_categorization.py
│   │   ├── test_embedding_service.py
│   │   ├── test_language_detector.py
│   │   ├── test_multimodal_intelligence.py
│   │   ├── test_orchestrator.py
│   │   ├── test_schemas.py
│   │   ├── test_text_cleaner.py
│   │   ├── test_text_preprocessor.py
│   │   ├── test_translation_quality.py
│   │   ├── test_translator.py
│   │   └── test_validation.py
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── main.py
│   ├── README.md
│   └── requirements.txt
├── api-gateway
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── example
│   │   │   │           └── apigateway
│   │   │   │               ├── dto
│   │   │   │               │   └── ErrorResponseDto.java
│   │   │   │               ├── exception
│   │   │   │               │   └── GlobalGatewayExceptionHandler.java
│   │   │   │               ├── filter
│   │   │   │               │   ├── CorrelationIdFilter.java
│   │   │   │               │   ├── JwtAuthenticationFilter.java
│   │   │   │               │   └── RequestLoggingFilter.java
│   │   │   │               └── ApiGatewayApplication.java
│   │   │   └── resources
│   │   │       └── application.yml
│   │   └── test
│   │       └── java
│   │           └── com
│   │               └── example
│   │                   └── apigateway
│   │                       └── ApiGatewayApplicationTests.java
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── pom.xml
│   └── README.md
├── backend
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── example
│   │   │   │           └── social_issues
│   │   │   │               ├── analytics
│   │   │   │               │   ├── controller
│   │   │   │               │   │   └── AnalyticsController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   └── AnalyticsDashboardResponse.java
│   │   │   │               │   ├── model
│   │   │   │               │   ├── repository
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       │   └── AnalyticsServiceImpl.java
│   │   │   │               │       └── AnalyticsService.java
│   │   │   │               ├── auth
│   │   │   │               │   ├── controller
│   │   │   │               │   │   ├── AuthController.java
│   │   │   │               │   │   └── InstitutionalOnboardingController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   ├── AuthResponse.java
│   │   │   │               │   │   ├── InstitutionalOnboardingRequest.java
│   │   │   │               │   │   ├── LoginRequest.java
│   │   │   │               │   │   ├── OtpSendRequest.java
│   │   │   │               │   │   ├── OtpVerifyRequest.java
│   │   │   │               │   │   ├── RefreshTokenRequest.java
│   │   │   │               │   │   ├── SignupRequest.java
│   │   │   │               │   │   └── UserSummaryDto.java
│   │   │   │               │   ├── model
│   │   │   │               │   │   ├── CitizenProfile.java
│   │   │   │               │   │   ├── EntityType.java
│   │   │   │               │   │   ├── GovernmentProfile.java
│   │   │   │               │   │   ├── IndustryProfile.java
│   │   │   │               │   │   ├── OtpSession.java
│   │   │   │               │   │   ├── Role.java
│   │   │   │               │   │   ├── UniversityProfile.java
│   │   │   │               │   │   ├── User.java
│   │   │   │               │   │   └── VerificationStatus.java
│   │   │   │               │   ├── repository
│   │   │   │               │   │   ├── CitizenProfileRepository.java
│   │   │   │               │   │   ├── GovernmentProfileRepository.java
│   │   │   │               │   │   ├── IndustryProfileRepository.java
│   │   │   │               │   │   ├── OtpSessionRepository.java
│   │   │   │               │   │   ├── UniversityProfileRepository.java
│   │   │   │               │   │   └── UserRepository.java
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       ├── AuthServiceImpl.java
│   │   │   │               │       ├── AuthService.java
│   │   │   │               │       ├── InstitutionalOnboardingService.java
│   │   │   │               │       ├── JwtService.java
│   │   │   │               │       └── RedisSessionService.java
│   │   │   │               ├── common
│   │   │   │               │   ├── config
│   │   │   │               │   │   ├── CorsConfig.java
│   │   │   │               │   │   ├── DatabaseCleanupRunner.java
│   │   │   │               │   │   ├── MinioConfig.java
│   │   │   │               │   │   └── SecurityBeansConfig.java
│   │   │   │               │   ├── dto
│   │   │   │               │   ├── exception
│   │   │   │               │   │   ├── GlobalExceptionHandler.java
│   │   │   │               │   │   └── ResourceNotFoundException.java
│   │   │   │               │   ├── model
│   │   │   │               │   ├── security
│   │   │   │               │   │   └── FileEncryptionService.java
│   │   │   │               │   └── util
│   │   │   │               ├── industrypartnership
│   │   │   │               │   ├── config
│   │   │   │               │   │   └── MarketplaceDataSeeder.java
│   │   │   │               │   ├── controller
│   │   │   │               │   │   ├── ActivePilotsController.java
│   │   │   │               │   │   ├── CoDevelopmentController.java
│   │   │   │               │   │   ├── CompanyProfileSettingsController.java
│   │   │   │               │   │   ├── CsrComplianceController.java
│   │   │   │               │   │   ├── FieldTestbedController.java
│   │   │   │               │   │   ├── IndustryAnalyticsController.java
│   │   │   │               │   │   ├── IndustryDashboardController.java
│   │   │   │               │   │   └── MentorshipController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   ├── AcceptInvitationRequest.java
│   │   │   │               │   │   ├── ActivePilotDetailDto.java
│   │   │   │               │   │   ├── ActivePilotsOverviewDto.java
│   │   │   │               │   │   ├── ActivePilotSummaryDto.java
│   │   │   │               │   │   ├── CoDevelopmentAgreementDto.java
│   │   │   │               │   │   ├── CommitFundingRequest.java
│   │   │   │               │   │   ├── CompanyProfileDto.java
│   │   │   │               │   │   ├── CorporateNotificationPreferencesDto.java
│   │   │   │               │   │   ├── CreateAgreementRequest.java
│   │   │   │               │   │   ├── CreateTestbedRequest.java
│   │   │   │               │   │   ├── CsrAuditTrailDto.java
│   │   │   │               │   │   ├── CsrBudgetSummaryDto.java
│   │   │   │               │   │   ├── CsrComplianceSummaryDto.java
│   │   │   │               │   │   ├── CsrLedgerEntryDto.java
│   │   │   │               │   │   ├── CsrUtilizationCertificateDto.java
│   │   │   │               │   │   ├── DisbursementDto.java
│   │   │   │               │   │   ├── DiscussionMessageDto.java
│   │   │   │               │   │   ├── ExpressInterestRequest.java
│   │   │   │               │   │   ├── FinancialTrendPointDto.java
│   │   │   │               │   │   ├── ImpactSummaryDto.java
│   │   │   │               │   │   ├── IndustryActivityDto.java
│   │   │   │               │   │   ├── IndustryOverviewResponse.java
│   │   │   │               │   │   ├── IndustryStatCardsDto.java
│   │   │   │               │   │   ├── IndustryTeamMemberDto.java
│   │   │   │               │   │   ├── InviteTeamMemberRequest.java
│   │   │   │               │   │   ├── LogMentorshipSessionRequest.java
│   │   │   │               │   │   ├── MarketplaceMetaDto.java
│   │   │   │               │   │   ├── MarketplaceProjectDto.java
│   │   │   │               │   │   ├── McaCsr2ReportDto.java
│   │   │   │               │   │   ├── MentorshipEngagementDto.java
│   │   │   │               │   │   ├── MilestoneDto.java
│   │   │   │               │   │   ├── OfferMentorshipRequest.java
│   │   │   │               │   │   ├── PilotDocumentDto.java
│   │   │   │               │   │   ├── PostDiscussionRequest.java
│   │   │   │               │   │   ├── QuarterlyTrendDto.java
│   │   │   │               │   │   ├── QuickActionsDto.java
│   │   │   │               │   │   ├── ReleaseDisbursementRequest.java
│   │   │   │               │   │   ├── ReviewMilestoneRequest.java
│   │   │   │               │   │   ├── SectorEngagementDto.java
│   │   │   │               │   │   ├── SetCsrBudgetRequest.java
│   │   │   │               │   │   ├── TestbedDistrictSummaryDto.java
│   │   │   │               │   │   ├── TestbedSponsorshipDto.java
│   │   │   │               │   │   ├── UpdateCompanyProfileRequest.java
│   │   │   │               │   │   ├── UpdateNotificationPreferencesRequest.java
│   │   │   │               │   │   ├── UpdatePilotHealthRequest.java
│   │   │   │               │   │   ├── UpdateTeamMemberRoleRequest.java
│   │   │   │               │   │   ├── UpdateTestbedStatusRequest.java
│   │   │   │               │   │   └── VerifyCertificateRequest.java
│   │   │   │               │   ├── model
│   │   │   │               │   │   ├── ActivitySeverity.java
│   │   │   │               │   │   ├── AgreementStatus.java
│   │   │   │               │   │   ├── AgreementType.java
│   │   │   │               │   │   ├── CoDevelopmentAgreement.java
│   │   │   │               │   │   ├── CoFundedPilot.java
│   │   │   │               │   │   ├── CommitmentStatus.java
│   │   │   │               │   │   ├── CorporateNotificationPreference.java
│   │   │   │               │   │   ├── CorporateRole.java
│   │   │   │               │   │   ├── CsrAnnualBudget.java
│   │   │   │               │   │   ├── CsrAuditTrail.java
│   │   │   │               │   │   ├── CsrCategory.java
│   │   │   │               │   │   ├── CsrCommitment.java
│   │   │   │               │   │   ├── CsrScheduleVIIItem.java
│   │   │   │               │   │   ├── CsrUtilizationCertificate.java
│   │   │   │               │   │   ├── DeploymentStatus.java
│   │   │   │               │   │   ├── DisbursementStatus.java
│   │   │   │               │   │   ├── EmailDigestFrequency.java
│   │   │   │               │   │   ├── EngagementStatus.java
│   │   │   │               │   │   ├── EngagementType.java
│   │   │   │               │   │   ├── IndustryActivityLog.java
│   │   │   │               │   │   ├── IndustryTeamMember.java
│   │   │   │               │   │   ├── MarketplaceEngagement.java
│   │   │   │               │   │   ├── MarketplaceProject.java
│   │   │   │               │   │   ├── MarketplaceStage.java
│   │   │   │               │   │   ├── MarketplaceStatus.java
│   │   │   │               │   │   ├── MentorshipEngagement.java
│   │   │   │               │   │   ├── MentorshipStatus.java
│   │   │   │               │   │   ├── MilestoneStatus.java
│   │   │   │               │   │   ├── PartnerCategory.java
│   │   │   │               │   │   ├── PilotDisbursement.java
│   │   │   │               │   │   ├── PilotDiscussion.java
│   │   │   │               │   │   ├── PilotDocument.java
│   │   │   │               │   │   ├── PilotDocumentType.java
│   │   │   │               │   │   ├── PilotHealthStatus.java
│   │   │   │               │   │   ├── PilotMilestone.java
│   │   │   │               │   │   ├── PilotStage.java
│   │   │   │               │   │   ├── PilotStatus.java
│   │   │   │               │   │   ├── TeamMemberStatus.java
│   │   │   │               │   │   └── TestbedSponsorship.java
│   │   │   │               │   ├── repository
│   │   │   │               │   │   ├── CoDevelopmentAgreementRepository.java
│   │   │   │               │   │   ├── CoFundedPilotRepository.java
│   │   │   │               │   │   ├── CorporateNotificationPreferenceRepository.java
│   │   │   │               │   │   ├── CsrAnnualBudgetRepository.java
│   │   │   │               │   │   ├── CsrAuditTrailRepository.java
│   │   │   │               │   │   ├── CsrCommitmentRepository.java
│   │   │   │               │   │   ├── CsrUtilizationCertificateRepository.java
│   │   │   │               │   │   ├── IndustryActivityLogRepository.java
│   │   │   │               │   │   ├── IndustryTeamMemberRepository.java
│   │   │   │               │   │   ├── MarketplaceEngagementRepository.java
│   │   │   │               │   │   ├── MarketplaceProjectRepository.java
│   │   │   │               │   │   ├── MentorshipEngagementRepository.java
│   │   │   │               │   │   ├── PilotDisbursementRepository.java
│   │   │   │               │   │   ├── PilotDiscussionRepository.java
│   │   │   │               │   │   ├── PilotDocumentRepository.java
│   │   │   │               │   │   ├── PilotMilestoneRepository.java
│   │   │   │               │   │   └── TestbedSponsorshipRepository.java
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       ├── ActivePilotsServiceImpl.java
│   │   │   │               │       ├── ActivePilotsService.java
│   │   │   │               │       ├── CoDevelopmentServiceImpl.java
│   │   │   │               │       ├── CoDevelopmentService.java
│   │   │   │               │       ├── CompanySettingsServiceImpl.java
│   │   │   │               │       ├── CompanySettingsService.java
│   │   │   │               │       ├── CsrComplianceServiceImpl.java
│   │   │   │               │       ├── CsrComplianceService.java
│   │   │   │               │       ├── FieldTestbedServiceImpl.java
│   │   │   │               │       ├── FieldTestbedService.java
│   │   │   │               │       ├── IndustryAnalyticsServiceImpl.java
│   │   │   │               │       ├── IndustryAnalyticsService.java
│   │   │   │               │       ├── IndustryDashboardServiceImpl.java
│   │   │   │               │       ├── IndustryDashboardService.java
│   │   │   │               │       ├── MarketplaceServiceImpl.java
│   │   │   │               │       ├── MarketplaceService.java
│   │   │   │               │       ├── MentorshipServiceImpl.java
│   │   │   │               │       └── MentorshipService.java
│   │   │   │               ├── notifications
│   │   │   │               │   ├── dto
│   │   │   │               │   │   └── NotificationEvent.java
│   │   │   │               │   └── service
│   │   │   │               │       └── NotificationEventPublisher.java
│   │   │   │               ├── problemsubmission
│   │   │   │               │   ├── config
│   │   │   │               │   │   └── IssueDataSeeder.java
│   │   │   │               │   ├── controller
│   │   │   │               │   │   ├── FileDownloadController.java
│   │   │   │               │   │   └── IssueController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   ├── AttachmentResponse.java
│   │   │   │               │   │   ├── IssuePageResponse.java
│   │   │   │               │   │   ├── IssueResponse.java
│   │   │   │               │   │   ├── IssueStatsResponse.java
│   │   │   │               │   │   ├── IssueStatusUpdateRequest.java
│   │   │   │               │   │   ├── IssueSubmitRequest.java
│   │   │   │               │   │   ├── IssueSummaryResponse.java
│   │   │   │               │   │   └── IssueUpdateRequest.java
│   │   │   │               │   ├── model
│   │   │   │               │   │   ├── AttachmentType.java
│   │   │   │               │   │   ├── GrassrootIssue.java
│   │   │   │               │   │   ├── IssueAttachment.java
│   │   │   │               │   │   ├── IssuePriority.java
│   │   │   │               │   │   ├── IssueSector.java
│   │   │   │               │   │   └── IssueStatus.java
│   │   │   │               │   ├── repository
│   │   │   │               │   │   ├── GrassrootIssueRepository.java
│   │   │   │               │   │   └── IssueAttachmentRepository.java
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       ├── AiServiceClient.java
│   │   │   │               │       ├── FileStorageService.java
│   │   │   │               │       ├── IssueServiceImpl.java
│   │   │   │               │       ├── IssueService.java
│   │   │   │               │       ├── MinioFileStorageServiceImpl.java
│   │   │   │               │       └── ValidationClient.java
│   │   │   │               ├── projectlifecycle
│   │   │   │               │   ├── controller
│   │   │   │               │   │   ├── IntellectualPropertyController.java
│   │   │   │               │   │   ├── ProjectMilestoneController.java
│   │   │   │               │   │   ├── ProjectTestingController.java
│   │   │   │               │   │   └── StageApprovalController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   ├── ApprovalSignoffDto.java
│   │   │   │               │   │   ├── CreateIpRecordRequest.java
│   │   │   │               │   │   ├── CreateMilestoneRequest.java
│   │   │   │               │   │   ├── DeliverableDto.java
│   │   │   │               │   │   ├── DualClosedLoopStatusDto.java
│   │   │   │               │   │   ├── IpRecordDto.java
│   │   │   │               │   │   ├── MilestoneDto.java
│   │   │   │               │   │   ├── RecordTestResultRequest.java
│   │   │   │               │   │   ├── ReviewMilestoneRequest.java
│   │   │   │               │   │   ├── SubmitDeliverableRequest.java
│   │   │   │               │   │   ├── SubmitSignoffRequest.java
│   │   │   │               │   │   ├── TestResultDto.java
│   │   │   │               │   │   └── UpdateIpStatusRequest.java
│   │   │   │               │   ├── model
│   │   │   │               │   │   ├── ApprovalStage.java
│   │   │   │               │   │   ├── ApprovalStatus.java
│   │   │   │               │   │   ├── ApproverRole.java
│   │   │   │               │   │   ├── DeliverableType.java
│   │   │   │               │   │   ├── IntellectualPropertyRecord.java
│   │   │   │               │   │   ├── IpStatus.java
│   │   │   │               │   │   ├── IpType.java
│   │   │   │               │   │   ├── MilestoneStatus.java
│   │   │   │               │   │   ├── ProjectDeliverable.java
│   │   │   │               │   │   ├── ProjectMilestone.java
│   │   │   │               │   │   ├── ProjectTestResult.java
│   │   │   │               │   │   ├── StageApprovalSignoff.java
│   │   │   │               │   │   ├── TestPassStatus.java
│   │   │   │               │   │   └── TestType.java
│   │   │   │               │   ├── repository
│   │   │   │               │   │   ├── IntellectualPropertyRepository.java
│   │   │   │               │   │   ├── ProjectDeliverableRepository.java
│   │   │   │               │   │   ├── ProjectMilestoneRepository.java
│   │   │   │               │   │   ├── ProjectTestResultRepository.java
│   │   │   │               │   │   └── StageApprovalSignoffRepository.java
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       │   ├── IntellectualPropertyServiceImpl.java
│   │   │   │               │       │   ├── ProjectMilestoneServiceImpl.java
│   │   │   │               │       │   ├── ProjectTestingServiceImpl.java
│   │   │   │               │       │   └── StageApprovalServiceImpl.java
│   │   │   │               │       ├── IntellectualPropertyService.java
│   │   │   │               │       ├── ProjectMilestoneService.java
│   │   │   │               │       ├── ProjectTestingService.java
│   │   │   │               │       └── StageApprovalService.java
│   │   │   │               ├── routing
│   │   │   │               │   ├── controller
│   │   │   │               │   ├── dto
│   │   │   │               │   ├── model
│   │   │   │               │   ├── repository
│   │   │   │               │   └── service
│   │   │   │               │       └── impl
│   │   │   │               ├── universitycollab
│   │   │   │               │   ├── controller
│   │   │   │               │   │   └── UniversityCollabController.java
│   │   │   │               │   ├── dto
│   │   │   │               │   │   ├── AccreditationReportDto.java
│   │   │   │               │   │   ├── ChallengeClaimRequest.java
│   │   │   │               │   │   ├── ChallengeClaimResponse.java
│   │   │   │               │   │   ├── CitizenVerificationRequest.java
│   │   │   │               │   │   ├── CreateUniversityProjectRequest.java
│   │   │   │               │   │   ├── CsrPitchRequest.java
│   │   │   │               │   │   ├── IndustryOfferDto.java
│   │   │   │               │   │   ├── RoutedChallengeDto.java
│   │   │   │               │   │   ├── TeamMemberDto.java
│   │   │   │               │   │   ├── UniversityProjectResponse.java
│   │   │   │               │   │   └── UpdateProjectStageRequest.java
│   │   │   │               │   ├── model
│   │   │   │               │   │   ├── ChallengeClaim.java
│   │   │   │               │   │   ├── ClaimStatus.java
│   │   │   │               │   │   ├── TeamMemberRole.java
│   │   │   │               │   │   ├── UniversityProject.java
│   │   │   │               │   │   ├── UniversityProjectStage.java
│   │   │   │               │   │   └── UniversityTeamMember.java
│   │   │   │               │   ├── repository
│   │   │   │               │   │   ├── ChallengeClaimRepository.java
│   │   │   │               │   │   ├── UniversityProjectRepository.java
│   │   │   │               │   │   └── UniversityTeamMemberRepository.java
│   │   │   │               │   └── service
│   │   │   │               │       ├── impl
│   │   │   │               │       │   └── UniversityCollabServiceImpl.java
│   │   │   │               │       ├── NotificationDispatcherService.java
│   │   │   │               │       └── UniversityCollabService.java
│   │   │   │               └── JharkhandGovtApplication.java
│   │   │   └── resources
│   │   │       ├── application.properties
│   │   │       └── application.yml
│   │   └── test
│   │       └── java
│   │           └── com
│   │               └── example
│   │                   ├── jharkhand_govt
│   │                   │   └── JharkhandGovtApplicationTests.java
│   │                   └── social_issues
│   │                       └── common
│   │                           └── security
│   │                               └── FileEncryptionServiceTest.java
│   ├── uploads
│   │   └── issues
│   │       └── GRI-2026-573421
│   │           ├── 881dfc3a-bff7-4cf4-a97a-fe47f1cab389-SIH2026-Presentation.pdf
│   │           └── ab626514-0ba9-4fce-8c9b-be0c7dac1910-CV_Template.pdf
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── docs
│   ├── adr
│   │   └── 0001-crawl4ai-langgraph-university-knowledge-pipeline.md
│   ├── architecture
│   │   ├── Codebase_Tree.md
│   │   ├── Container_Architecture.md
│   │   └── System_Context.md
│   ├── knowledge_base
│   │   └── universities
│   │       ├── AIIMS_DEOGHAR
│   │       │   ├── departments.md
│   │       │   ├── faculty_directory.md
│   │       │   ├── incubation_tbi.md
│   │       │   ├── laboratories.md
│   │       │   ├── overview.md
│   │       │   └── research_centers.md
│   │       ├── BAU_RANCHI
│   │       │   ├── departments.md
│   │       │   ├── faculty_directory.md
│   │       │   ├── incubation_tbi.md
│   │       │   ├── laboratories.md
│   │       │   ├── overview.md
│   │       │   └── research_centers.md
│   │       ├── BIT_MESRA
│   │       │   ├── departments.md
│   │       │   ├── faculty_directory.md
│   │       │   ├── incubation_tbi.md
│   │       │   ├── laboratories.md
│   │       │   ├── overview.md
│   │       │   └── research_centers.md
│   │       ├── IIT_ISM_DHANBAD
│   │       │   ├── departments.md
│   │       │   ├── faculty_directory.md
│   │       │   ├── incubation_tbi.md
│   │       │   ├── laboratories.md
│   │       │   ├── overview.md
│   │       │   └── research_centers.md
│   │       └── NIT_JAMSHEDPUR
│   │           ├── departments.md
│   │           ├── faculty_directory.md
│   │           ├── incubation_tbi.md
│   │           ├── laboratories.md
│   │           ├── overview.md
│   │           └── research_centers.md
│   ├── ai_teammate_integration_guide.md
│   ├── architect_review_top5_university_pipeline.md
│   ├── fault_tolerant_university_crawler_pipeline.md
│   ├── feature_ticket_list.md
│   ├── frontend_spec.md
│   ├── industry_dashboard.md
│   ├── industry_module_tasks.md
│   ├── industry_partnership_module_verification_report.md
│   ├── project_lifecycle_tasks.md
│   ├── security_access.md
│   ├── technical_architecture.md
│   ├── top_5_jharkhand_universities_knowledge_base_plan.md
│   ├── university_comprehensive_crawler_and_domain_mapping.md
│   ├── university_crawler_and_knowledge_pipeline.md
│   ├── university_intelligent_pipeline_master_guide.md
│   └── university_knowledge_graph_crawler_architecture.md
├── frontend
│   └── web
│       ├── public
│       │   ├── bharatviz_NFHS5_Jharkhand_districts.geojson
│       │   ├── emblem-india.svg
│       │   ├── emblem.jpg
│       │   ├── emblem.png
│       │   ├── file.svg
│       │   ├── globe.svg
│       │   ├── next.svg
│       │   ├── vercel.svg
│       │   └── window.svg
│       ├── src
│       │   ├── app
│       │   │   ├── auth
│       │   │   │   ├── login
│       │   │   │   │   ├── college
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── government
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── industry
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   ├── university
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── login-college
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── login-government
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── login-industry
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── login-university
│       │   │   │   │   └── page.tsx
│       │   │   │   └── signup
│       │   │   │       └── page.tsx
│       │   │   ├── dashboard
│       │   │   │   └── page.tsx
│       │   │   ├── industry-rd
│       │   │   │   └── page.tsx
│       │   │   ├── onboarding
│       │   │   │   ├── citizen
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── college
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── government
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── industry
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── university
│       │   │   │   │   └── page.tsx
│       │   │   │   └── page.tsx
│       │   │   ├── favicon.ico
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components
│       │   │   ├── auth
│       │   │   │   └── GuestOnlyGuard.tsx
│       │   │   ├── common
│       │   │   │   ├── GoogleMapPicker.tsx
│       │   │   │   └── SiteNavbar.tsx
│       │   │   ├── dashboard
│       │   │   │   ├── government
│       │   │   │   │   └── GovernmentAnalyticsOverview.tsx
│       │   │   │   ├── industry
│       │   │   │   │   ├── analytics
│       │   │   │   │   │   └── IndustryAnalyticsTab.tsx
│       │   │   │   │   ├── communication
│       │   │   │   │   │   └── IndustryCommunicationTab.tsx
│       │   │   │   │   ├── csr
│       │   │   │   │   │   ├── CsrAuditTrailSection.tsx
│       │   │   │   │   │   ├── CsrBudgetOverviewSection.tsx
│       │   │   │   │   │   ├── CsrCertificatesSection.tsx
│       │   │   │   │   │   ├── CsrComplianceTab.tsx
│       │   │   │   │   │   ├── CsrLedgerTable.tsx
│       │   │   │   │   │   ├── McaCsr2ReportSection.tsx
│       │   │   │   │   │   ├── SetCsrBudgetModal.tsx
│       │   │   │   │   │   ├── UploadCertificateModal.tsx
│       │   │   │   │   │   └── VerifyCertificateModal.tsx
│       │   │   │   │   ├── marketplace
│       │   │   │   │   │   ├── CommitFundingModal.tsx
│       │   │   │   │   │   ├── IndustryMarketplaceTab.tsx
│       │   │   │   │   │   ├── MarketplaceFilterBar.tsx
│       │   │   │   │   │   ├── MarketplaceProjectCard.tsx
│       │   │   │   │   │   ├── OfferMentorshipModal.tsx
│       │   │   │   │   │   └── ProjectDossierModal.tsx
│       │   │   │   │   ├── notifications
│       │   │   │   │   │   └── IndustryNotificationsTab.tsx
│       │   │   │   │   ├── pilots
│       │   │   │   │   │   ├── ActivePilotCard.tsx
│       │   │   │   │   │   ├── ActivePilotsTab.tsx
│       │   │   │   │   │   ├── PilotDetailDossierModal.tsx
│       │   │   │   │   │   ├── PilotsOverviewStats.tsx
│       │   │   │   │   │   ├── ReleaseDisbursementModal.tsx
│       │   │   │   │   │   ├── ReviewMilestoneModal.tsx
│       │   │   │   │   │   └── UploadPilotDocumentModal.tsx
│       │   │   │   │   ├── settings
│       │   │   │   │   │   ├── CompanyProfileSection.tsx
│       │   │   │   │   │   ├── CompanySettingsTab.tsx
│       │   │   │   │   │   ├── CorporateTeamSection.tsx
│       │   │   │   │   │   ├── EditTeamMemberRoleModal.tsx
│       │   │   │   │   │   ├── InviteTeamMemberModal.tsx
│       │   │   │   │   │   └── NotificationPreferencesSection.tsx
│       │   │   │   │   ├── testbeds
│       │   │   │   │   │   ├── CreateTestbedModal.tsx
│       │   │   │   │   │   └── FieldTestbedDeploymentTab.tsx
│       │   │   │   │   ├── IndustryIpTransferTab.tsx
│       │   │   │   │   ├── IndustryOverviewTab.tsx
│       │   │   │   │   ├── IndustryQuickActions.tsx
│       │   │   │   │   ├── IndustryRecentActivityFeed.tsx
│       │   │   │   │   ├── IndustrySectorEngagementChart.tsx
│       │   │   │   │   └── IndustryStatCards.tsx
│       │   │   │   ├── university
│       │   │   │   │   └── ProjectMilestoneTimeline.tsx
│       │   │   │   ├── CitizenDashboardView.tsx
│       │   │   │   ├── DashboardHeader.tsx
│       │   │   │   ├── DashboardNavbar.tsx
│       │   │   │   ├── DashboardSidebar.tsx
│       │   │   │   ├── GovernmentDashboardView.tsx
│       │   │   │   ├── icons.tsx
│       │   │   │   ├── IndustryDashboardView.tsx
│       │   │   │   ├── NodalAiAuditCard.tsx
│       │   │   │   ├── PlatformAdminDashboardView.tsx
│       │   │   │   ├── ToastStack.tsx
│       │   │   │   ├── UniversityDashboardView.tsx
│       │   │   │   └── WorkspacePlaceholderTab.tsx
│       │   │   ├── landing
│       │   │   │   ├── jharkhandGeoData.ts
│       │   │   │   └── JharkhandHeroMap.tsx
│       │   │   └── onboarding
│       │   │       └── OnboardingFormWrapper.tsx
│       │   ├── context
│       │   ├── hooks
│       │   ├── lib
│       │   │   ├── api
│       │   │   │   └── apiErrorHelper.ts
│       │   │   └── store
│       │   │       ├── useAuthStore.ts
│       │   │       └── useIssueStore.ts
│       │   ├── modules
│       │   │   ├── admin
│       │   │   ├── citizen
│       │   │   ├── industry
│       │   │   │   ├── hooks
│       │   │   │   │   ├── useActivePilots.ts
│       │   │   │   │   ├── useCompanySettings.ts
│       │   │   │   │   ├── useCsrCompliance.ts
│       │   │   │   │   ├── useFieldTestbeds.ts
│       │   │   │   │   ├── useIndustryAnalytics.ts
│       │   │   │   │   ├── useIndustryOverview.ts
│       │   │   │   │   └── useMarketplace.ts
│       │   │   │   ├── services
│       │   │   │   │   ├── activePilotsApi.ts
│       │   │   │   │   ├── companySettingsApi.ts
│       │   │   │   │   ├── csrComplianceApi.ts
│       │   │   │   │   ├── fieldTestbedApi.ts
│       │   │   │   │   ├── industryAnalyticsApi.ts
│       │   │   │   │   ├── industryDashboardApi.ts
│       │   │   │   │   └── marketplaceApi.ts
│       │   │   │   └── types
│       │   │   │       ├── activePilots.ts
│       │   │   │       ├── analytics.ts
│       │   │   │       ├── companySettings.ts
│       │   │   │       ├── csrCompliance.ts
│       │   │   │       ├── industryDashboard.ts
│       │   │   │       ├── marketplace.ts
│       │   │   │       └── testbeds.ts
│       │   │   └── university
│       │   │       ├── hooks
│       │   │       │   ├── useNotificationStream.ts
│       │   │       │   └── useUniversity.ts
│       │   │       ├── services
│       │   │       │   ├── projectLifecycleApi.ts
│       │   │       │   └── universityApi.ts
│       │   │       └── types.ts
│       │   └── routes
│       ├── AGENTS.md
│       ├── CLAUDE.md
│       ├── eslint.config.mjs
│       ├── next.config.ts
│       ├── next-env.d.ts
│       ├── package.json
│       ├── package-lock.json
│       ├── pnpm-lock.yaml
│       ├── pnpm-workspace.yaml
│       ├── postcss.config.mjs
│       ├── README.md
│       ├── tsconfig.json
│       └── tsconfig.tsbuildinfo
├── knowlegebase
│   ├── entities
│   │   ├── analyze.md
│   │   ├── app_layout.md
│   │   ├── app_page.md
│   │   ├── attachment.md
│   │   ├── AttachmentResponse.md
│   │   ├── AttachmentType.md
│   │   ├── AuthController.md
│   │   ├── AuthResponse.md
│   │   ├── AuthServiceImpl.md
│   │   ├── AuthService.md
│   │   ├── base.md
│   │   ├── categorization.md
│   │   ├── categorizer.md
│   │   ├── category_definitions.md
│   │   ├── category_embeddings.md
│   │   ├── category.md
│   │   ├── challenge.md
│   │   ├── challenge_pipeline.md
│   │   ├── CitizenDashboardView.md
│   │   ├── citizen_page.md
│   │   ├── CitizenProfile.md
│   │   ├── CitizenProfileRepository.md
│   │   ├── classifier.md
│   │   ├── cloud_provider.md
│   │   ├── college_page.md
│   │   ├── config.md
│   │   ├── consistency_checker.md
│   │   ├── CorsConfig.md
│   │   ├── DashboardHeader.md
│   │   ├── DashboardNavbar.md
│   │   ├── dashboard_page.md
│   │   ├── DashboardSidebar.md
│   │   ├── DatabaseCleanupRunner.md
│   │   ├── deduplication.md
│   │   ├── device.md
│   │   ├── document_preprocessor.md
│   │   ├── document_validator.md
│   │   ├── duplicate_checker.md
│   │   ├── duplicate.md
│   │   ├── embedding_model.md
│   │   ├── embedding_search.md
│   │   ├── embedding_service.md
│   │   ├── EntityType.md
│   │   ├── enums.md
│   │   ├── evidence.md
│   │   ├── evidence_score.md
│   │   ├── FileStorageService.md
│   │   ├── frame_extractor.md
│   │   ├── gemini_provider.md
│   │   ├── GlobalExceptionHandler.md
│   │   ├── GoogleMapPicker.md
│   │   ├── GovernmentDashboardView.md
│   │   ├── government_page.md
│   │   ├── GovernmentProfile.md
│   │   ├── GovernmentProfileRepository.md
│   │   ├── GrassrootIssue.md
│   │   ├── GrassrootIssueRepository.md
│   │   ├── hashing.md
│   │   ├── health.md
│   │   ├── image_preprocessor.md
│   │   ├── image_processor.md
│   │   ├── image_validator.md
│   │   ├── indictrans2_provider.md
│   │   ├── IndustryDashboardView.md
│   │   ├── industry_page.md
│   │   ├── IndustryProfile.md
│   │   ├── IndustryProfileRepository.md
│   │   ├── industry-rd_page.md
│   │   ├── InstitutionalOnboardingController.md
│   │   ├── InstitutionalOnboardingRequest.md
│   │   ├── InstitutionalOnboardingService.md
│   │   ├── intelligence.md
│   │   ├── IssueAttachment.md
│   │   ├── IssueAttachmentRepository.md
│   │   ├── issue_context_builder.md
│   │   ├── IssueController.md
│   │   ├── IssuePageResponse.md
│   │   ├── IssuePriority.md
│   │   ├── IssueResponse.md
│   │   ├── IssueSector.md
│   │   ├── IssueServiceImpl.md
│   │   ├── IssueService.md
│   │   ├── IssueStatsResponse.md
│   │   ├── IssueStatus.md
│   │   ├── IssueStatusUpdateRequest.md
│   │   ├── IssueSubmitRequest.md
│   │   ├── IssueSummaryResponse.md
│   │   ├── IssueUpdateRequest.md
│   │   ├── issue_validator.md
│   │   ├── JharkhandGovtApplication.md
│   │   ├── JharkhandGovtApplicationTests.md
│   │   ├── JwtService.md
│   │   ├── language_detector.md
│   │   ├── location.md
│   │   ├── location_processor.md
│   │   ├── location_validator.md
│   │   ├── logger.md
│   │   ├── login-college_page.md
│   │   ├── login-government_page.md
│   │   ├── login-industry_page.md
│   │   ├── login_page.md
│   │   ├── LoginRequest.md
│   │   ├── login-university_page.md
│   │   ├── main.md
│   │   ├── MinioConfig.md
│   │   ├── MinioFileStorageServiceImpl.md
│   │   ├── mobileclip_model.md
│   │   ├── mock_provider.md
│   │   ├── model_manager.md
│   │   ├── multilingual_categorizer.md
│   │   ├── nvidia_provider.md
│   │   ├── ocr_model.md
│   │   ├── ocr_processor.md
│   │   ├── OnboardingFormWrapper.md
│   │   ├── onboarding_page.md
│   │   ├── orchestrator.md
│   │   ├── OtpSendRequest.md
│   │   ├── OtpSession.md
│   │   ├── OtpSessionRepository.md
│   │   ├── OtpVerifyRequest.md
│   │   ├── pdf_extractor.md
│   │   ├── PlatformAdminDashboardView.md
│   │   ├── preprocessing.md
│   │   ├── preprocess.md
│   │   ├── prioritization.md
│   │   ├── priority_engine.md
│   │   ├── priority_features.md
│   │   ├── priority.md
│   │   ├── priority_rules.md
│   │   ├── RedisSessionService.md
│   │   ├── ResourceNotFoundException.md
│   │   ├── response.md
│   │   ├── Role.md
│   │   ├── routing.md
│   │   ├── SecurityBeansConfig.md
│   │   ├── settings.md
│   │   ├── signup_page.md
│   │   ├── SignupRequest.md
│   │   ├── similarity.md
│   │   ├── SiteNavbar.md
│   │   ├── storage.md
│   │   ├── text_cleaner.md
│   │   ├── text.md
│   │   ├── text_preprocessor.md
│   │   ├── text_validator.md
│   │   ├── ToastStack.md
│   │   ├── translation_model.md
│   │   ├── translation_quality.md
│   │   ├── translator.md
│   │   ├── transliterator.md
│   │   ├── UniversityDashboardView.md
│   │   ├── university_embeddings.md
│   │   ├── university_matcher.md
│   │   ├── university_page.md
│   │   ├── university_profile.md
│   │   ├── UniversityProfile.md
│   │   ├── UniversityProfileRepository.md
│   │   ├── useAuthStore.md
│   │   ├── User.md
│   │   ├── UserRepository.md
│   │   ├── UserSummaryDto.md
│   │   ├── ValidationClient.md
│   │   ├── validation.md
│   │   ├── vector_store.md
│   │   ├── verification_engine.md
│   │   ├── VerificationStatus.md
│   │   └── video_validator.md
│   ├── LLM_CONTEXT_MAP.md
│   ├── MOC_AI_Service.md
│   ├── MOC_Backend_Java.md
│   ├── MOC_Frontend_Next.md
│   ├── MOC_System_Architecture.md
│   └── preprocessing.md
├── notification-service
│   ├── src
│   │   ├── redisSubscriber.ts
│   │   ├── server.ts
│   │   ├── sseManager.ts
│   │   └── types.ts
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── tsconfig.json
├── proto
│   └── societal_innovation_ai.proto
├── scripts
│   ├── crawl_university.py
│   ├── deep_crawl_universities.py
│   ├── extract_university_knowledge.py
│   └── generate_obsidian_graph.py
├── 2026-09-08.md
├── auth.md
├── docker-compose.yml
├── project.md
├── skills-lock.json
├── typing.md
├── Untitled 1.base
├── Untitled 2.base
├── Untitled.base
└── Untitled.canvas

221 directories, 865 files
```
