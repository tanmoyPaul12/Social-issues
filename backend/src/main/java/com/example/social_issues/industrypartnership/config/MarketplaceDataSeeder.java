package com.example.social_issues.industrypartnership.config;

import com.example.social_issues.auth.model.IndustryProfile;
import com.example.social_issues.auth.repository.IndustryProfileRepository;
import com.example.social_issues.industrypartnership.model.*;
import com.example.social_issues.industrypartnership.repository.*;
import com.example.social_issues.problemsubmission.model.IssueSector;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class MarketplaceDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceDataSeeder.class);

    private final MarketplaceProjectRepository projectRepository;
    private final IndustryProfileRepository industryProfileRepository;
    private final CoFundedPilotRepository pilotRepository;
    private final PilotMilestoneRepository milestoneRepository;
    private final PilotDisbursementRepository disbursementRepository;
    private final PilotDiscussionRepository discussionRepository;
    private final PilotDocumentRepository documentRepository;
    private final CsrCommitmentRepository csrCommitmentRepository;

    public MarketplaceDataSeeder(
            MarketplaceProjectRepository projectRepository,
            IndustryProfileRepository industryProfileRepository,
            CoFundedPilotRepository pilotRepository,
            PilotMilestoneRepository milestoneRepository,
            PilotDisbursementRepository disbursementRepository,
            PilotDiscussionRepository discussionRepository,
            PilotDocumentRepository documentRepository,
            CsrCommitmentRepository csrCommitmentRepository) {
        this.projectRepository = projectRepository;
        this.industryProfileRepository = industryProfileRepository;
        this.pilotRepository = pilotRepository;
        this.milestoneRepository = milestoneRepository;
        this.disbursementRepository = disbursementRepository;
        this.discussionRepository = discussionRepository;
        this.documentRepository = documentRepository;
        this.csrCommitmentRepository = csrCommitmentRepository;
    }

    @Override
    public void run(String... args) {
        seedMarketplaceProjects();
        seedActivePilots();
    }

    private void seedMarketplaceProjects() {
        if (projectRepository.count() > 0) {
            log.info("Marketplace projects already exist in the database, skipping seeding.");
            return;
        }

        log.info("Seeding initial verified Academic R&D Marketplace projects for Jharkhand HEIs...");

        MarketplaceProject p1 = new MarketplaceProject();
        p1.setTitle("Low-Cost Arsenic & Iron Bio-Sand Filtration Unit with IoT Telemetry");
        p1.setAbstractDescription("A dual-stage gravity filtration system utilizing locally sourced laterite adsorbent media combined with an ESP32 optical turbidity sensor. Designed specifically for community tube wells in Sahibganj and Pakur tribal clusters.");
        p1.setSector(IssueSector.WATER);
        p1.setStage(MarketplaceStage.READY_FOR_TESTBED);
        p1.setUniversityId(101L);
        p1.setUniversityName("Birla Institute of Technology (BIT) Mesra, Ranchi");
        p1.setLeadFacultyMentor("Dr. R. K. Mukherjee (Dept. of Civil & Environmental Eng)");
        p1.setStudentLead("Ananya Soren & Team JalSuraksha");
        p1.setTeamSize(5);
        p1.setFundingAskAmount(new BigDecimal("1250000.00"));
        p1.setFundingCommittedAmount(new BigDecimal("450000.00"));
        p1.setTrlLevel(6);
        p1.setTargetDistrict("Sahibganj");
        p1.setStatus(MarketplaceStatus.PUBLISHED);
        p1.setClosingDate(LocalDate.now().plusMonths(3));

        MarketplaceProject p2 = new MarketplaceProject();
        p2.setTitle("Solar-Powered Phase Change Material (PCM) Micro Cold Storage for Lac & Mahua");
        p2.setAbstractDescription("Decentralized 2-tonne mobile cold chain unit utilizing non-toxic paraffin phase change materials charged via 3kW rooftop solar arrays. Retains sub-8°C storage temperature for 72 hours without continuous grid electricity.");
        p2.setSector(IssueSector.AGRICULTURE);
        p2.setStage(MarketplaceStage.NEEDS_FUNDING);
        p2.setUniversityId(102L);
        p2.setUniversityName("Birsa Agricultural University (BAU), Kanke");
        p2.setLeadFacultyMentor("Prof. Shailendra Prasad (Farm Machinery & Power Eng)");
        p2.setStudentLead("Vikas Mahato");
        p2.setTeamSize(4);
        p2.setFundingAskAmount(new BigDecimal("2800000.00"));
        p2.setFundingCommittedAmount(new BigDecimal("1200000.00"));
        p2.setTrlLevel(5);
        p2.setTargetDistrict("Khunti");
        p2.setStatus(MarketplaceStatus.PUBLISHED);
        p2.setClosingDate(LocalDate.now().plusMonths(2));

        MarketplaceProject p3 = new MarketplaceProject();
        p3.setTitle("Edge-AI Diagnostic Mobile App for Early Detection of Forest Soil Toxicity");
        p3.setAbstractDescription("Lightweight offline computer vision model trained on Jharkhand red soil spectral reflections and NIR camera dongles to classify heavy metal toxicity in mining-adjacent agricultural fields.");
        p3.setSector(IssueSector.ENVIRONMENT);
        p3.setStage(MarketplaceStage.PROTOTYPE);
        p3.setUniversityId(103L);
        p3.setUniversityName("Indian Institute of Technology (IIT ISM) Dhanbad");
        p3.setLeadFacultyMentor("Dr. Priyanka Sinha (Computer Science & Mining Cybernetics)");
        p3.setStudentLead("Rahul Verma");
        p3.setTeamSize(3);
        p3.setFundingAskAmount(new BigDecimal("950000.00"));
        p3.setFundingCommittedAmount(BigDecimal.ZERO);
        p3.setTrlLevel(4);
        p3.setTargetDistrict("Dhanbad");
        p3.setStatus(MarketplaceStatus.PUBLISHED);
        p3.setClosingDate(LocalDate.now().plusMonths(4));

        MarketplaceProject p4 = new MarketplaceProject();
        p4.setTitle("Rugged Tele-Health Point-of-Care Kit for Primary Health Centers");
        p4.setAbstractDescription("Solar-rechargeable diagnostic backpack containing digital stethoscope, 12-lead ECG, non-invasive hemoglobin sensor, and satellite-sync health records module with multilingual Santali and Ho voice prompts.");
        p4.setSector(IssueSector.HEALTH);
        p4.setStage(MarketplaceStage.NEEDS_MENTOR);
        p4.setUniversityId(104L);
        p4.setUniversityName("National Institute of Technology (NIT) Jamshedpur");
        p4.setLeadFacultyMentor("Dr. A. K. Choudhary (Electronics & Bio-Medical Instrumentation)");
        p4.setStudentLead("Pooja Mishra");
        p4.setTeamSize(4);
        p4.setFundingAskAmount(new BigDecimal("1850000.00"));
        p4.setFundingCommittedAmount(new BigDecimal("600000.00"));
        p4.setTrlLevel(5);
        p4.setTargetDistrict("West Singhbhum");
        p4.setStatus(MarketplaceStatus.PUBLISHED);
        p4.setClosingDate(LocalDate.now().plusMonths(3));

        MarketplaceProject p5 = new MarketplaceProject();
        p5.setTitle("Micro-Hydro Kinetic Energy Harvester for Hill-Stream Tribal Hamlets");
        p5.setAbstractDescription("Low-head Kaplan vortex turbine made with modular recycled polymers capable of generating 1.5kW power at water flows as low as 0.8 m/s, intended for continuous LED lighting and battery banks.");
        p5.setSector(IssueSector.ELECTRICITY);
        p5.setStage(MarketplaceStage.READY_FOR_TESTBED);
        p5.setUniversityId(105L);
        p5.setUniversityName("Ranchi University - School of Engineering");
        p5.setLeadFacultyMentor("Dr. B. N. Tirkey");
        p5.setStudentLead("Amitabh Hembrom");
        p5.setTeamSize(6);
        p5.setFundingAskAmount(new BigDecimal("1500000.00"));
        p5.setFundingCommittedAmount(new BigDecimal("1500000.00"));
        p5.setTrlLevel(7);
        p5.setTargetDistrict("Latehar");
        p5.setStatus(MarketplaceStatus.PUBLISHED);
        p5.setClosingDate(LocalDate.now().plusMonths(1));

        projectRepository.saveAll(List.of(p1, p2, p3, p4, p5));
        log.info("Successfully seeded {} academic R&D marketplace projects.", 5);
    }

    private void seedActivePilots() {
        List<IndustryProfile> profiles = industryProfileRepository.findAll();
        if (profiles.isEmpty()) {
            return;
        }

        for (IndustryProfile profile : profiles) {
            long existing = pilotRepository.countByIndustryProfileId(profile.getId());
            if (existing > 0) continue;

            log.info("Seeding realistic active co-funded pilots for industry profile: {}", profile.getCompanyName());

            // Pilot 1: Smart Irrigation & Soil Nutrient Sensing (Active, On Track)
            CoFundedPilot pilot1 = new CoFundedPilot();
            pilot1.setIndustryProfile(profile);
            pilot1.setTitle("IoT-Enabled Low-Power Soil Nutrient & Moisture Sensing Grid for Rainfed Millets");
            pilot1.setAbstractDescription("Subsurface LoRaWAN wireless sensor nodes measuring NPK concentration, pH, and soil moisture levels in Khunti tribal millet clusters with dynamic solar valve controllers.");
            pilot1.setSector(IssueSector.AGRICULTURE);
            pilot1.setUniversityId(102L);
            pilot1.setUniversityName("Birsa Agricultural University (BAU), Kanke");
            pilot1.setFacultyLeadName("Prof. Shailendra Prasad");
            pilot1.setFacultyLeadDesignation("Head, Dept. of Agricultural Instrumentation");
            pilot1.setFacultyLeadEmail("s.prasad@bau.ac.in");
            pilot1.setStudentLeadName("Vikas Mahato & Team KrishiTech");
            pilot1.setCorporateMentorName("Dr. Arunav Sen");
            pilot1.setCorporateMentorDesignation("Chief Technology Advisor (Agritech)");
            pilot1.setTargetDistrict("Khunti");
            pilot1.setStage(PilotStage.FIELD_TRIAL);
            pilot1.setStatus(PilotStatus.ACTIVE);
            pilot1.setHealthStatus(PilotHealthStatus.ON_TRACK);
            pilot1.setCurrentMilestone(2);
            pilot1.setTotalMilestones(4);
            pilot1.setProgressPercentage(40);
            pilot1.setTotalBudget(new BigDecimal("2400000.00"));
            pilot1.setDisbursedBudget(new BigDecimal("1000000.00"));
            pilot1.setNextDeliverableDate(LocalDate.now().plusWeeks(3));
            pilot1.setTargetCompletionDate(LocalDate.now().plusMonths(8));
            pilot1 = pilotRepository.save(pilot1);

            // Milestones for Pilot 1
            PilotMilestone m1_1 = new PilotMilestone();
            m1_1.setPilot(pilot1);
            m1_1.setMilestoneNumber(1);
            m1_1.setTitle("Sensor Hardware Prototyping & Lab Calibration");
            m1_1.setDeliverableSummary("Fabrication of 25 ISFET NPK sensor probes and calibration in red soil testbeds at BAU greenhouse.");
            m1_1.setTargetDate(LocalDate.now().minusMonths(2));
            m1_1.setCompletedDate(LocalDate.now().minusMonths(2));
            m1_1.setStatus(MilestoneStatus.APPROVED);
            m1_1.setTrancheAmount(new BigDecimal("1000000.00"));
            m1_1.setCompletionPercentage(100);
            m1_1.setSubmissionRemarks("All 25 probes calibrated with <2% standard deviation. Bench reports attached.");
            m1_1.setReviewRemarks("Verified against BAU soil standard samples. Tranche 1 approved.");

            PilotMilestone m1_2 = new PilotMilestone();
            m1_2.setPilot(pilot1);
            m1_2.setMilestoneNumber(2);
            m1_2.setTitle("Field Deployment of 15 Pilot Sensor Nodes in Murhu Block");
            m1_2.setDeliverableSummary("Installation of LoRaWAN gateway tower at Krishi Vigyan Kendra and 15 sensor nodes across 8 farmers' fields.");
            m1_2.setTargetDate(LocalDate.now().plusWeeks(3));
            m1_2.setStatus(MilestoneStatus.IN_PROGRESS);
            m1_2.setTrancheAmount(new BigDecimal("600000.00"));
            m1_2.setCompletionPercentage(65);

            PilotMilestone m1_3 = new PilotMilestone();
            m1_3.setPilot(pilot1);
            m1_3.setMilestoneNumber(3);
            m1_3.setTitle("Farmer Advisory Mobile App & Automated Drip Valve Integration");
            m1_3.setDeliverableSummary("Telemetry integration with mobile app in Hindi/Mundari and automated solonoid valve triggers.");
            m1_3.setTargetDate(LocalDate.now().plusMonths(4));
            m1_3.setStatus(MilestoneStatus.UPCOMING);
            m1_3.setTrancheAmount(new BigDecimal("500000.00"));
            m1_3.setCompletionPercentage(0);

            PilotMilestone m1_4 = new PilotMilestone();
            m1_4.setPilot(pilot1);
            m1_4.setMilestoneNumber(4);
            m1_4.setTitle("Seasonal Yield Impact Assessment & Final Technology Transfer");
            m1_4.setDeliverableSummary("Comprehensive agronomic yield analysis, cost-benefit report, and open-source hardware dossier.");
            m1_4.setTargetDate(LocalDate.now().plusMonths(8));
            m1_4.setStatus(MilestoneStatus.UPCOMING);
            m1_4.setTrancheAmount(new BigDecimal("300000.00"));
            m1_4.setCompletionPercentage(0);

            milestoneRepository.saveAll(List.of(m1_1, m1_2, m1_3, m1_4));

            // Disbursements for Pilot 1
            PilotDisbursement d1_1 = new PilotDisbursement();
            d1_1.setPilot(pilot1);
            d1_1.setMilestone(m1_1);
            d1_1.setTrancheNumber(1);
            d1_1.setTrancheLabel("Tranche 1 - Kickoff & Hardware Procurement");
            d1_1.setDisbursementReference("DISB-2026-001");
            d1_1.setAmount(new BigDecimal("1000000.00"));
            d1_1.setStatus(DisbursementStatus.DISBURSED);
            d1_1.setScheduledDate(LocalDate.now().minusMonths(3));
            d1_1.setDisbursedDate(LocalDate.now().minusMonths(2));
            d1_1.setPaymentMethod("NEFT_RTGS");
            d1_1.setUtrNumber("HDFCN26182049102");
            d1_1.setNotes("Released upon MoU signing and Milestone 1 bench verification.");

            PilotDisbursement d1_2 = new PilotDisbursement();
            d1_2.setPilot(pilot1);
            d1_2.setMilestone(m1_2);
            d1_2.setTrancheNumber(2);
            d1_2.setTrancheLabel("Tranche 2 - Field Trial & LoRa Gateway");
            d1_2.setDisbursementReference("DISB-2026-002");
            d1_2.setAmount(new BigDecimal("600000.00"));
            d1_2.setStatus(DisbursementStatus.SCHEDULED);
            d1_2.setScheduledDate(LocalDate.now().plusWeeks(3));
            d1_2.setPaymentMethod("NEFT_RTGS");
            d1_2.setNotes("Pending completion of field deployment at Murhu block.");

            disbursementRepository.saveAll(List.of(d1_1, d1_2));

            // Discussions for Pilot 1
            PilotDiscussion disc1 = new PilotDiscussion();
            disc1.setPilot(pilot1);
            disc1.setSenderUserId(profile.getUser() != null ? profile.getUser().getId() : 1L);
            disc1.setSenderName(profile.getSpocName() != null ? profile.getSpocName() : profile.getCompanyName());
            disc1.setSenderRole("INDUSTRY_PARTNER");
            disc1.setMessage("Welcome to the co-funded initiative! We have reviewed the initial PCB layout and approved Tranche 1 release.");
            disc1.setIsPinned(true);

            PilotDiscussion disc2 = new PilotDiscussion();
            disc2.setPilot(pilot1);
            disc2.setSenderUserId(999L);
            disc2.setSenderName("Prof. Shailendra Prasad");
            disc2.setSenderRole("FACULTY_LEAD");
            disc2.setMessage("Thank you! Gateway installation at Murhu KVK center is scheduled for this Thursday. Field telemetry tests will commence Friday.");
            disc2.setIsPinned(false);

            discussionRepository.saveAll(List.of(disc1, disc2));

            // Documents for Pilot 1
            PilotDocument doc1 = new PilotDocument();
            doc1.setPilot(pilot1);
            doc1.setTitle("Joint R&D Project Proposal & Work Breakdown Structure");
            doc1.setDocType(PilotDocumentType.PROJECT_PROPOSAL);
            doc1.setFileUrl("/api/uploads/pilots/proposal_bau_iot.pdf");
            doc1.setFileSizeBytes(2450000L);
            doc1.setMimeType("application/pdf");
            doc1.setUploadedByName("Prof. Shailendra Prasad");
            doc1.setUploadedByRole("FACULTY_LEAD");

            PilotDocument doc2 = new PilotDocument();
            doc2.setPilot(pilot1);
            doc2.setTitle("Milestone 1 Bench Calibration & Sensor Precision Report");
            doc2.setDocType(PilotDocumentType.LAB_REPORT);
            doc2.setFileUrl("/api/uploads/pilots/m1_calibration_report.pdf");
            doc2.setFileSizeBytes(1180000L);
            doc2.setMimeType("application/pdf");
            doc2.setUploadedByName("Vikas Mahato");
            doc2.setUploadedByRole("STUDENT_LEAD");

            documentRepository.saveAll(List.of(doc1, doc2));

            // Pilot 2: Clean Water Arsenic Bio-Sand Filtration (Milestone Pending Review)
            CoFundedPilot pilot2 = new CoFundedPilot();
            pilot2.setIndustryProfile(profile);
            pilot2.setTitle("Solar-Assisted Arsenic Removal Unit with Continuous Water Quality Telemetry");
            pilot2.setAbstractDescription("Adsorption-based modular water treatment plant removing arsenic and dissolved iron from groundwater in Sahibganj tribal settlements.");
            pilot2.setSector(IssueSector.WATER);
            pilot2.setUniversityId(101L);
            pilot2.setUniversityName("Birla Institute of Technology (BIT) Mesra, Ranchi");
            pilot2.setFacultyLeadName("Dr. R. K. Mukherjee");
            pilot2.setFacultyLeadDesignation("Professor, Civil & Environmental Engineering");
            pilot2.setFacultyLeadEmail("rkmukherjee@bitmesra.ac.in");
            pilot2.setStudentLeadName("Ananya Soren");
            pilot2.setCorporateMentorName("Dr. Arunav Sen");
            pilot2.setCorporateMentorDesignation("CSR Technical Advisor");
            pilot2.setTargetDistrict("Sahibganj");
            pilot2.setStage(PilotStage.LAB_TESTING);
            pilot2.setStatus(PilotStatus.MILESTONE_PENDING);
            pilot2.setHealthStatus(PilotHealthStatus.ON_TRACK);
            pilot2.setCurrentMilestone(2);
            pilot2.setTotalMilestones(4);
            pilot2.setProgressPercentage(30);
            pilot2.setTotalBudget(new BigDecimal("1800000.00"));
            pilot2.setDisbursedBudget(new BigDecimal("600000.00"));
            pilot2.setNextDeliverableDate(LocalDate.now().plusWeeks(1));
            pilot2.setTargetCompletionDate(LocalDate.now().plusMonths(6));
            pilot2 = pilotRepository.save(pilot2);

            PilotMilestone m2_1 = new PilotMilestone();
            m2_1.setPilot(pilot2);
            m2_1.setMilestoneNumber(1);
            m2_1.setTitle("Adsorbent Media Optimization & Laboratory Column Tests");
            m2_1.setDeliverableSummary("Chemical testing of activated alumina and iron-coated sand beds for arsenic reduction < 10 ppb.");
            m2_1.setTargetDate(LocalDate.now().minusMonths(1));
            m2_1.setCompletedDate(LocalDate.now().minusMonths(1));
            m2_1.setStatus(MilestoneStatus.APPROVED);
            m2_1.setTrancheAmount(new BigDecimal("600000.00"));
            m2_1.setCompletionPercentage(100);
            m2_1.setReviewRemarks("Arsenic reduction meets WHO standards. Approved.");

            PilotMilestone m2_2 = new PilotMilestone();
            m2_2.setPilot(pilot2);
            m2_2.setMilestoneNumber(2);
            m2_2.setTitle("500 LPH Pilot Rig Assembly & Optical Turbidity Telemetry");
            m2_2.setDeliverableSummary("Assembly of skid-mounted 500 liters/hour water unit with automated IoT turbidity alerts.");
            m2_2.setTargetDate(LocalDate.now().plusDays(4));
            m2_2.setStatus(MilestoneStatus.SUBMITTED_FOR_REVIEW);
            m2_2.setTrancheAmount(new BigDecimal("500000.00"));
            m2_2.setCompletionPercentage(90);
            m2_2.setSubmissionRemarks("Rig fabrication complete. NABL test certificate uploaded for corporate mentor approval.");

            PilotMilestone m2_3 = new PilotMilestone();
            m2_3.setPilot(pilot2);
            m2_3.setMilestoneNumber(3);
            m2_3.setTitle("Community Installation in Rajmahal Tribal Village");
            m2_3.setDeliverableSummary("On-ground deployment connected to community borewell serving 120 households.");
            m2_3.setTargetDate(LocalDate.now().plusMonths(3));
            m2_3.setStatus(MilestoneStatus.UPCOMING);
            m2_3.setTrancheAmount(new BigDecimal("400000.00"));

            PilotMilestone m2_4 = new PilotMilestone();
            m2_4.setPilot(pilot2);
            m2_4.setMilestoneNumber(4);
            m2_4.setTitle("3-Month Continuous Water Quality Monitoring & Handover");
            m2_4.setDeliverableSummary("Operational validation, village water committee training, and handover.");
            m2_4.setTargetDate(LocalDate.now().plusMonths(6));
            m2_4.setStatus(MilestoneStatus.UPCOMING);
            m2_4.setTrancheAmount(new BigDecimal("300000.00"));

            milestoneRepository.saveAll(List.of(m2_1, m2_2, m2_3, m2_4));

            // Also create CSR commitment records for ledger synchronization
            CsrCommitment csr1 = new CsrCommitment();
            csr1.setIndustryProfile(profile);
            csr1.setPilot(pilot1);
            csr1.setFinancialYear("2026-2027");
            csr1.setTotalCommittedAmount(pilot1.getTotalBudget());
            csr1.setTotalDisbursedAmount(pilot1.getDisbursedBudget());
            csr1.setScheduleVIICategory(CsrCategory.TECHNOLOGY_INCUBATORS);
            csr1.setStatus(CommitmentStatus.COMMITTED);
            csr1.setCsrProjectCode("CSR-PLT-" + pilot1.getId());

            CsrCommitment csr2 = new CsrCommitment();
            csr2.setIndustryProfile(profile);
            csr2.setPilot(pilot2);
            csr2.setFinancialYear("2026-2027");
            csr2.setTotalCommittedAmount(pilot2.getTotalBudget());
            csr2.setTotalDisbursedAmount(pilot2.getDisbursedBudget());
            csr2.setScheduleVIICategory(CsrCategory.TECHNOLOGY_INCUBATORS);
            csr2.setStatus(CommitmentStatus.COMMITTED);
            csr2.setCsrProjectCode("CSR-PLT-" + pilot2.getId());

            csrCommitmentRepository.saveAll(List.of(csr1, csr2));
        }
    }
}
