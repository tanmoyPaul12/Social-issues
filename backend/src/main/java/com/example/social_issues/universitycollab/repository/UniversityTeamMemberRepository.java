package com.example.social_issues.universitycollab.repository;

import com.example.social_issues.universitycollab.model.TeamMemberRole;
import com.example.social_issues.universitycollab.model.UniversityTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniversityTeamMemberRepository extends JpaRepository<UniversityTeamMember, Long> {

    List<UniversityTeamMember> findByProjectId(Long projectId);

    List<UniversityTeamMember> findByProjectIdAndRole(Long projectId, TeamMemberRole role);

    void deleteByProjectIdAndId(Long projectId, Long id);
}
