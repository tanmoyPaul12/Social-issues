package com.example.social_issues.problemsubmission.config;

import com.example.social_issues.auth.model.EntityType;
import com.example.social_issues.auth.model.Role;
import com.example.social_issues.auth.model.User;
import com.example.social_issues.auth.model.VerificationStatus;
import com.example.social_issues.auth.repository.UserRepository;
import com.example.social_issues.problemsubmission.model.*;
import com.example.social_issues.problemsubmission.repository.GrassrootIssueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(2)
public class IssueDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(IssueDataSeeder.class);

    private final GrassrootIssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueDataSeeder(GrassrootIssueRepository issueRepository, UserRepository userRepository) {
        this.issueRepository = issueRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (issueRepository.count() > 0) {
                log.info("Grassroot issues already exist in database (count: {}). Skipping seeder.", issueRepository.count());
                return;
            }

            log.info("Seeding realistic Grassroot Issues across Jharkhand districts and sectors...");

        User defaultSubmitter = userRepository.findAll().stream().findFirst().orElseGet(() -> {
            User u = new User();
            u.setName("Rameshwar Murmu (Citizen Representative)");
            u.setEmail("citizen.jharkhand@gov.in");
            u.setPhone("+919431120491");
            u.setRole(Role.CITIZEN);
            u.setVerified(true);
            u.setVerificationStatus(VerificationStatus.APPROVED);
            return userRepository.save(u);
        });

        LocalDateTime now = LocalDateTime.now();

        List<GrassrootIssue> seedList = List.of(
            createIssue(
                "GRI-2026-881902",
                defaultSubmitter,
                "Groundwater Arsenic Contamination & Handpump Failure",
                "High levels of arsenic reported in 6 community tube wells in Rajmahal block, causing skin lesions among 400+ villagers. Immediate water filtration and testing needed.",
                IssueSector.WATER,
                IssuePriority.CRITICAL,
                IssueStatus.ASSIGNED_HEI,
                "Sahibganj",
                "Rajmahal",
                "Kalyanpur Gram",
                "PASS",
                "BIT Mesra - Department of Civil & Environmental Eng",
                now.minusDays(2)
            ),
            createIssue(
                "GRI-2026-614022",
                defaultSubmitter,
                "Off-grid Solar Microgrid Inverter Failure",
                "Community solar microgrid battery and inverter unit non-functional after thunderstorm in Mahuadanr, affecting night clinic operations.",
                IssueSector.ELECTRICITY,
                IssuePriority.HIGH,
                IssueStatus.ASSIGNED_HEI,
                "Latehar",
                "Mahuadanr",
                "Daltonganj Road Ward 4",
                "PASS",
                "NIT Jamshedpur - Clean Energy Cell",
                now.minusDays(5)
            ),
            createIssue(
                "GRI-2026-339101",
                defaultSubmitter,
                "Paddy Blast Fungus Outbreak in Non-Irrigated Terraces",
                "Extensive leaf blast and neck blast infestation damaging over 120 hectares of swarna sub-1 rice crops in Ormanjhi and Angara blocks.",
                IssueSector.AGRICULTURE,
                IssuePriority.CRITICAL,
                IssueStatus.IN_PROGRESS,
                "Ranchi",
                "Ormanjhi",
                "Chakla Village",
                "PASS",
                "Birsa Agricultural University (BAU) Ranchi - Plant Pathology Lab",
                now.minusDays(12)
            ),
            createIssue(
                "GRI-2026-442819",
                defaultSubmitter,
                "Coal Seam Fire Gas Infiltration in Underground Cellars",
                "Methane and carbon monoxide seepage reported in residential zones adjacent to underground mine fires in Jharia colliery belt.",
                IssueSector.ENVIRONMENT,
                IssuePriority.CRITICAL,
                IssueStatus.IN_PROGRESS,
                "Dhanbad",
                "Jharia",
                "Lodna Colliery Sector 3",
                "PASS",
                "IIT (ISM) Dhanbad - Mining & Mine Safety Center",
                now.minusDays(18)
            ),
            createIssue(
                "GRI-2026-551920",
                defaultSubmitter,
                "Fluoride Contamination in School Drinking Water Supply",
                "Water samples from 8 primary schools show fluoride concentrations above 2.8 mg/L, resulting in dental fluorosis among 280 children.",
                IssueSector.WATER,
                IssuePriority.HIGH,
                IssueStatus.RESOLVED,
                "Palamu",
                "Daltonganj",
                "Chainpur Block",
                "PASS",
                "BIT Mesra - Hydraulics Lab",
                now.minusDays(35)
            ),
            createIssue(
                "GRI-2026-772104",
                defaultSubmitter,
                "Sub-Centres Medical Cold Chain Disruption in Remote Forest Villages",
                "Vaccine refrigeration storage units malfunctioning in 4 tribal sub-health centers during summer peaks due to voltage fluctuations.",
                IssueSector.HEALTH,
                IssuePriority.HIGH,
                IssueStatus.ASSIGNED_HEI,
                "West Singhbhum",
                "Goilkera",
                "Saranda Forest Range",
                "PASS",
                "AIIMS Deoghar - Rural Health Outreach Unit",
                now.minusDays(8)
            ),
            createIssue(
                "GRI-2026-118492",
                defaultSubmitter,
                "Fly Ash Spillage and Runoff from Thermal Ash Dykes",
                "Leaching from coal ash containment ponds contaminating surface water streams and grazing land during pre-monsoon showers.",
                IssueSector.ENVIRONMENT,
                IssuePriority.HIGH,
                IssueStatus.UNDER_REVIEW,
                "Bokaro",
                "Bermo",
                "Phusro Ash Dyke",
                "PASS",
                null,
                now.minusDays(4)
            ),
            createIssue(
                "GRI-2026-992015",
                defaultSubmitter,
                "Tribal Lac Processing & Value Addition Moisture Spoilage",
                "Lack of solar tunnel dryers causing fungal contamination and 35% loss in raw sticklac harvested by 220 tribal SHG women.",
                IssueSector.LIVELIHOOD,
                IssuePriority.MEDIUM,
                IssueStatus.IN_PROGRESS,
                "Khunti",
                "Murhu",
                "Bandgaon Panchayat",
                "PASS",
                "Birsa Agricultural University (BAU) Ranchi - Post Harvest Eng",
                now.minusDays(22)
            ),
            createIssue(
                "GRI-2026-228491",
                defaultSubmitter,
                "Digital Attendance & Smart Classroom Connectivity Drop",
                "Unstable 4G telemetry and lack of solar UPS at 12 rural high schools leading to e-VidyaVahini sync failures.",
                IssueSector.EDUCATION,
                IssuePriority.MEDIUM,
                IssueStatus.RESOLVED,
                "Hazaribagh",
                "Barhi",
                "Padma High School",
                "PASS",
                "Central University of Jharkhand (CUJ) Brambe - Computer Science Dept",
                now.minusDays(40)
            ),
            createIssue(
                "GRI-2026-664019",
                defaultSubmitter,
                "Culvert Collapse Isolating 3 Gram Panchayats During Flash Floods",
                "Heavy rainfall washed away timber approach roads and damaged masonry culvert across Ajay River tributary.",
                IssueSector.INFRASTRUCTURE,
                IssuePriority.CRITICAL,
                IssueStatus.SUBMITTED,
                "Deoghar",
                "Sarwan",
                "Ajay River Basin",
                "PASS",
                null,
                now.minusDays(1)
            ),
            createIssue(
                "GRI-2026-883710",
                defaultSubmitter,
                "Municipal Solid Waste Open Dumping Near Water Reservoir",
                "Unsegregated municipal garbage dumped in catchment zone of Maithon reservoir posing contamination risk to potable intake pipes.",
                IssueSector.SANITATION,
                IssuePriority.HIGH,
                IssueStatus.UNDER_REVIEW,
                "Dhanbad",
                "Nirsa",
                "Maithon Catchment Zone",
                "PASS",
                null,
                now.minusDays(3)
            ),
            createIssue(
                "GRI-2026-331092",
                defaultSubmitter,
                "Soil Salinity & Acidity Degradation in Coal Haulage Corridors",
                "Heavy vehicle coal dust deposition reducing soil fertility and crop yields across 90 hectares of arable land.",
                IssueSector.AGRICULTURE,
                IssuePriority.MEDIUM,
                IssueStatus.ASSIGNED_HEI,
                "Ramgarh",
                "Patratu",
                "Bhurkunda Belt",
                "PASS",
                "IIT (ISM) Dhanbad - Environmental Science Dept",
                now.minusDays(14)
            ),
            createIssue(
                "GRI-2026-559102",
                defaultSubmitter,
                "Silicosis Screening Shortage for Stone Quarry Workers",
                "High prevalence of respiratory distress among unorganized stone crushing laborers without mobile spirometry diagnostics.",
                IssueSector.HEALTH,
                IssuePriority.CRITICAL,
                IssueStatus.IN_PROGRESS,
                "Dumka",
                "Shikaripara",
                "Stone Crusher Belt",
                "PASS",
                "RIMS Ranchi - Department of Pulmonary Medicine",
                now.minusDays(16)
            ),
            createIssue(
                "GRI-2026-778103",
                defaultSubmitter,
                "Rooftop Rainwater Harvesting Failure at Block Office Complex",
                "Defective recharge pit filters causing sedimentation clogging and stormwater wastage at administrative campus.",
                IssueSector.WATER,
                IssuePriority.LOW,
                IssueStatus.RESOLVED,
                "East Singhbhum",
                "Ghatshila",
                "Block HQ Complex",
                "PASS",
                "NIT Jamshedpur - Civil Eng Dept",
                now.minusDays(50)
            ),
            createIssue(
                "GRI-2026-440192",
                defaultSubmitter,
                "Panchayat Citizen Service Kiosk Biometric Reader Malfunctions",
                "Optical fingerprint sensors failing in dusty rural conditions, delaying Old Age Pension and PM-Kisan payouts.",
                IssueSector.GOVERNANCE,
                IssuePriority.MEDIUM,
                IssueStatus.ASSIGNED_HEI,
                "Giridih",
                "Bengabad",
                "Pragya Kendra Unit 4",
                "PASS",
                "BIT Mesra - Electronics & Comm Lab",
                now.minusDays(7)
            ),
            createIssue(
                "GRI-2026-129038",
                defaultSubmitter,
                "Traditional Dokra Metal Craft Kiln High Charcoal Consumption",
                "Artisan clusters in Jagannathpur facing fuel cost escalation due to inefficient clay kilns.",
                IssueSector.LIVELIHOOD,
                IssuePriority.LOW,
                IssueStatus.IN_PROGRESS,
                "West Singhbhum",
                "Jagannathpur",
                "Dokra Artisan Cluster",
                "PASS",
                "NIT Jamshedpur - Metallurgical Eng Lab",
                now.minusDays(25)
            ),
            createIssue(
                "GRI-2026-981029",
                defaultSubmitter,
                "Maternal Anemia Mobile Ultrasound Unit Route Inefficiencies",
                "Lack of GIS route optimization causing missed monthly antenatal checkups in scattered hilly hamlets.",
                IssueSector.HEALTH,
                IssuePriority.HIGH,
                IssueStatus.ASSIGNED_HEI,
                "Simdega",
                "Kolebira",
                "Kolebira CHC",
                "PASS",
                "AIIMS Deoghar - Community Medicine Dept",
                now.minusDays(9)
            ),
            createIssue(
                "GRI-2026-220194",
                defaultSubmitter,
                "Mini Hydro Turbine Silt Abrasion on Hill Stream",
                "Quartz silt in hill torrent causing accelerated runner blade erosion at 15kW micro-hydro generator.",
                IssueSector.ELECTRICITY,
                IssuePriority.HIGH,
                IssueStatus.IN_PROGRESS,
                "Gumla",
                "Bishunpur",
                "Netarhat Foothills",
                "PASS",
                "BIT Mesra - Hydraulics Lab",
                now.minusDays(19)
            )
        );

        issueRepository.saveAll(seedList);
        log.info("Successfully seeded {} live Grassroot Issues into database.", seedList.size());
        } catch (Exception e) {
            log.warn("IssueDataSeeder non-fatal notice: {}", e.getMessage());
        }
    }

    private GrassrootIssue createIssue(
            String issueNumber,
            User submitter,
            String title,
            String description,
            IssueSector sector,
            IssuePriority priority,
            IssueStatus status,
            String district,
            String block,
            String villageOrWard,
            String validationStatus,
            String assignedHEI,
            LocalDateTime createdAt
    ) {
        GrassrootIssue issue = new GrassrootIssue();
        issue.setIssueNumber(issueNumber);
        issue.setSubmitter(submitter);
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setSector(sector);
        issue.setPriority(priority);
        issue.setStatus(status);
        issue.setDistrict(district);
        issue.setBlock(block);
        issue.setVillageOrWard(villageOrWard);
        issue.setValidationStatus(validationStatus);
        issue.setAssignedHEI(assignedHEI);
        issue.setCreatedAt(createdAt);
        issue.setUpdatedAt(createdAt);
        issue.setSubmitterEntityType(EntityType.INDIVIDUAL);
        issue.setAffectedPopulation(priority == IssuePriority.CRITICAL ? 1200 : priority == IssuePriority.HIGH ? 450 : 150);
        issue.setEstimatedImpactScore(priority == IssuePriority.CRITICAL ? 92 : priority == IssuePriority.HIGH ? 78 : 55);
        return issue;
    }
}
