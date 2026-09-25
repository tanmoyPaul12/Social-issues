package com.example.social_issues.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StateSuperadminAccountSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StateSuperadminAccountSeeder.class);

    @Override
    public void run(String... args) {
        log.info("Government Governance Engine initialized. Statewide Superadmin and District Nodal Officers are registered via official /api/onboarding/government API.");
    }
}
