package com.example.social_issues.industrypartnership.service;

import com.example.social_issues.industrypartnership.dto.*;
import com.example.social_issues.industrypartnership.model.PilotDocumentType;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ActivePilotsService {

    Page<ActivePilotSummaryDto> getActivePilots(
            Long userId,
            String status,
            String healthStatus,
            String stage,
            String search,
            String sortBy,
            int page,
            int size
    );

    ActivePilotsOverviewDto getOverviewMetrics(Long userId);

    ActivePilotDetailDto getPilotDetail(Long userId, Long pilotId);

    ActivePilotSummaryDto updateHealthStatus(Long userId, Long pilotId, UpdatePilotHealthRequest request);

    MilestoneDto reviewMilestone(Long userId, Long pilotId, Long milestoneId, ReviewMilestoneRequest request);

    DisbursementDto releaseDisbursement(Long userId, Long pilotId, ReleaseDisbursementRequest request);

    List<DiscussionMessageDto> getDiscussions(Long userId, Long pilotId);

    DiscussionMessageDto postDiscussion(Long userId, Long pilotId, PostDiscussionRequest request);

    List<PilotDocumentDto> getDocuments(Long userId, Long pilotId, PilotDocumentType docType);

    PilotDocumentDto uploadDocument(Long userId, Long pilotId, String title, PilotDocumentType docType, MultipartFile file);

    void deleteDocument(Long userId, Long pilotId, Long documentId);
}
