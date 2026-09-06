package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.PilotDocument;
import com.example.social_issues.industrypartnership.model.PilotDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PilotDocumentRepository extends JpaRepository<PilotDocument, Long> {

    List<PilotDocument> findByPilotIdOrderByUploadedAtDesc(Long pilotId);

    List<PilotDocument> findByPilotIdAndDocTypeOrderByUploadedAtDesc(Long pilotId, PilotDocumentType docType);

    long countByPilotId(Long pilotId);
}
