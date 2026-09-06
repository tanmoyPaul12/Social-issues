package com.example.social_issues.industrypartnership.repository;

import com.example.social_issues.industrypartnership.model.CorporateRole;
import com.example.social_issues.industrypartnership.model.IndustryTeamMember;
import com.example.social_issues.industrypartnership.model.TeamMemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndustryTeamMemberRepository extends JpaRepository<IndustryTeamMember, Long> {

    List<IndustryTeamMember> findByIndustryProfileIdOrderByCreatedAtAsc(Long industryProfileId);

    List<IndustryTeamMember> findByIndustryProfileIdAndStatus(Long industryProfileId, TeamMemberStatus status);

    Optional<IndustryTeamMember> findByIndustryProfileIdAndEmail(Long industryProfileId, String email);

    Optional<IndustryTeamMember> findByUserId(Long userId);

    Optional<IndustryTeamMember> findByInvitationToken(String invitationToken);

    boolean existsByIndustryProfileIdAndEmail(Long industryProfileId, String email);

    @Query("SELECT COUNT(m) FROM IndustryTeamMember m WHERE m.industryProfile.id = :profileId AND m.status = :status")
    long countByIndustryProfileIdAndStatus(@Param("profileId") Long profileId, @Param("status") TeamMemberStatus status);

    @Query("SELECT COUNT(m) FROM IndustryTeamMember m WHERE m.industryProfile.id = :profileId AND m.corporateRole = :role")
    long countByIndustryProfileIdAndRole(@Param("profileId") Long profileId, @Param("role") CorporateRole role);
}
