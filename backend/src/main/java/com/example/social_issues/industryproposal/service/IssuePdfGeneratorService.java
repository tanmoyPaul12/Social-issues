package com.example.social_issues.industryproposal.service;

import com.example.social_issues.industryproposal.util.ByteArrayMultipartFile;
import com.example.social_issues.problemsubmission.model.GrassrootIssue;
import com.example.social_issues.problemsubmission.model.IssueAttachment;
import com.example.social_issues.problemsubmission.service.FileStorageService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class IssuePdfGeneratorService {

    private static final Logger log = LoggerFactory.getLogger(IssuePdfGeneratorService.class);

    private final FileStorageService fileStorageService;

    public IssuePdfGeneratorService(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    public record GeneratedPdfResult(
            String fileUrl,
            String storageKey,
            byte[] pdfBytes
    ) {}

    public GeneratedPdfResult generateAndStoreIssueBrief(GrassrootIssue issue, String collegeCustomNotes) {
        try {
            byte[] pdfBytes = generateIssueBriefBytes(issue, collegeCustomNotes);

            String filename = "issue-brief-" + (issue.getIssueNumber() != null ? issue.getIssueNumber() : issue.getId()) + ".pdf";
            ByteArrayMultipartFile multipartFile = new ByteArrayMultipartFile(
                    pdfBytes,
                    "file",
                    filename,
                    "application/pdf"
            );

            FileStorageService.StoredFile stored = fileStorageService.storeFile(multipartFile, "proposals/issue-briefs");
            log.info("Generated and stored PDF brief for issue #{}: URL={}", issue.getIssueNumber(), stored.fileUrl());

            return new GeneratedPdfResult(stored.fileUrl(), stored.storageKey(), pdfBytes);
        } catch (Exception e) {
            log.error("Failed to generate PDF brief for issue id {}: {}", issue.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate industry brief PDF: " + e.getMessage(), e);
        }
    }

    public byte[] generateIssueBriefBytes(GrassrootIssue issue, String collegeCustomNotes) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            PDType1Font fontOblique = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

            float pageWidth = PDRectangle.A4.getWidth();
            float pageHeight = PDRectangle.A4.getHeight();
            float margin = 40;
            float contentWidth = pageWidth - (margin * 2);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                float y = pageHeight - margin;

                // 1. Header Banner (Dark Blue / Teal)
                cs.setNonStrokingColor(0.08f, 0.20f, 0.38f); // #143361
                cs.addRect(margin, y - 50, contentWidth, 50);
                cs.fill();

                cs.setNonStrokingColor(1.0f, 1.0f, 1.0f); // White text
                cs.beginText();
                cs.setFont(fontBold, 13);
                cs.newLineAtOffset(margin + 12, y - 22);
                cs.showText("GOVERNMENT OF JHARKHAND - INNOVATION PORTAL");
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(margin + 12, y - 38);
                cs.showText("CONFIDENTIAL INDUSTRY COLLABORATION BRIEF  |  HIGHER & TECHNICAL EDUCATION");
                cs.endText();

                y -= 65;

                // 2. Issue Title & Meta Card
                cs.setNonStrokingColor(0.94f, 0.96f, 0.98f);
                cs.addRect(margin, y - 60, contentWidth, 60);
                cs.fill();

                cs.setNonStrokingColor(0.1f, 0.1f, 0.1f);
                cs.beginText();
                cs.setFont(fontBold, 12);
                cs.newLineAtOffset(margin + 10, y - 18);
                String safeTitle = sanitize(issue.getTitle() != null ? issue.getTitle() : "Untitled Issue");
                cs.showText("ISSUE: " + safeTitle);
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(margin + 10, y - 35);
                String issueNo = issue.getIssueNumber() != null ? issue.getIssueNumber() : "N/A";
                String sector = issue.getSector() != null ? issue.getSector().name() : "GENERAL";
                String district = issue.getDistrict() != null ? issue.getDistrict() : "N/A";
                String priority = issue.getPriority() != null ? issue.getPriority().name() : "MEDIUM";
                cs.showText(String.format("Issue #: %s  |  Sector: %s  |  District: %s  |  Priority: %s", issueNo, sector, district, priority));
                cs.endText();

                cs.beginText();
                cs.setFont(fontOblique, 8);
                cs.newLineAtOffset(margin + 10, y - 50);
                String publishedDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"));
                cs.showText("Brief Generated: " + publishedDate + " IST  |  Status: PUBLISHED TO INDUSTRY");
                cs.endText();

                y -= 75;

                // 3. Section: Academic Institution / College
                cs.setNonStrokingColor(0.15f, 0.35f, 0.65f);
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.newLineAtOffset(margin, y);
                cs.showText("1. ACADEMIC & NODAL INSTITUTION");
                cs.endText();
                y -= 14;

                cs.setNonStrokingColor(0.2f, 0.2f, 0.2f);
                cs.beginText();
                cs.setFont(fontRegular, 9);
                cs.newLineAtOffset(margin, y);
                String assignedHei = issue.getAssignedHEI() != null ? issue.getAssignedHEI() : "Assigned Higher Education Institute / College";
                cs.showText("Assigned College / University: " + sanitize(assignedHei));
                cs.endText();
                y -= 13;

                if (Boolean.TRUE.equals(issue.getIsAnonymous())) {
                    cs.beginText();
                    cs.setFont(fontRegular, 9);
                    cs.newLineAtOffset(margin, y);
                    cs.showText("Submitting Authority: Anonymous Citizen (Identity Protected)");
                    cs.endText();
                    y -= 18;
                } else if (issue.getSubmitter() != null) {
                    cs.beginText();
                    cs.setFont(fontRegular, 9);
                    cs.newLineAtOffset(margin, y);
                    String submitterName = issue.getSubmitter().getName() != null ? issue.getSubmitter().getName() : "N/A";
                    String submitterRole = issue.getSubmitter().getRole() != null ? issue.getSubmitter().getRole().name() : "N/A";
                    cs.showText(String.format("Submitting Authority: %s (%s)", sanitize(submitterName), sanitize(submitterRole)));
                    cs.endText();
                    y -= 18;
                } else {
                    y -= 5;
                }

                // 4. Section: Problem Description & Scope
                cs.setNonStrokingColor(0.15f, 0.35f, 0.65f);
                cs.beginText();
                cs.setFont(fontBold, 11);
                cs.newLineAtOffset(margin, y);
                cs.showText("2. PROBLEM STATEMENT & FIELD CONTEXT");
                cs.endText();
                y -= 14;

                cs.setNonStrokingColor(0.2f, 0.2f, 0.2f);
                String desc = issue.getDescription() != null ? issue.getDescription() : "No detailed description provided.";
                List<String> wrappedDesc = wrapText(desc, 90);
                for (String line : wrappedDesc) {
                    if (y < margin + 120) break; // Avoid overflow
                    cs.beginText();
                    cs.setFont(fontRegular, 9);
                    cs.newLineAtOffset(margin, y);
                    cs.showText(sanitize(line));
                    cs.endText();
                    y -= 12;
                }
                y -= 10;

                // 5. Section: College Custom Notes & Industry Instructions
                if (collegeCustomNotes != null && !collegeCustomNotes.isBlank()) {
                    cs.setNonStrokingColor(0.15f, 0.35f, 0.65f);
                    cs.beginText();
                    cs.setFont(fontBold, 11);
                    cs.newLineAtOffset(margin, y);
                    cs.showText("3. COLLEGE REQUIREMENTS & INSTRUCTIONS");
                    cs.endText();
                    y -= 14;

                    cs.setNonStrokingColor(0.2f, 0.2f, 0.2f);
                    List<String> wrappedNotes = wrapText(collegeCustomNotes, 90);
                    for (String line : wrappedNotes) {
                        if (y < margin + 80) break;
                        cs.beginText();
                        cs.setFont(fontRegular, 9);
                        cs.newLineAtOffset(margin, y);
                        cs.showText(sanitize(line));
                        cs.endText();
                        y -= 12;
                    }
                    y -= 10;
                }

                // 6. Section: Attachments list
                List<IssueAttachment> attachments = issue.getAttachments();
                if (attachments != null && !attachments.isEmpty()) {
                    cs.setNonStrokingColor(0.15f, 0.35f, 0.65f);
                    cs.beginText();
                    cs.setFont(fontBold, 11);
                    cs.newLineAtOffset(margin, y);
                    cs.showText("4. FIELD EVIDENCE & ATTACHMENTS");
                    cs.endText();
                    y -= 14;

                    cs.setNonStrokingColor(0.3f, 0.3f, 0.3f);
                    for (IssueAttachment att : attachments) {
                        if (y < margin + 50) break;
                        cs.beginText();
                        cs.setFont(fontRegular, 8.5f);
                        cs.newLineAtOffset(margin + 5, y);
                        String attName = att.getFileName() != null ? att.getFileName() : "Attachment";
                        String attType = att.getFileType() != null ? att.getFileType().name() : "FILE";
                        cs.showText("- " + sanitize(attName) + " [" + attType + "]");
                        cs.endText();
                        y -= 12;
                    }
                    y -= 10;
                }

                // 7. Footer Notice
                cs.setNonStrokingColor(0.85f, 0.85f, 0.85f);
                cs.addRect(margin, margin + 25, contentWidth, 1);
                cs.fill();

                cs.setNonStrokingColor(0.45f, 0.45f, 0.45f);
                cs.beginText();
                cs.setFont(fontOblique, 7.5f);
                cs.newLineAtOffset(margin, margin + 12);
                cs.showText("This document is generated by Jharkhand Innovation Portal. Proprietary and confidential for registered industry partners.");
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 7.5f);
                cs.newLineAtOffset(contentWidth - 70, margin + 12);
                cs.showText("Page 1 of 1");
                cs.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replaceAll("[\\r\\n\\t]+", " ")
                .replaceAll("[^\\x20-\\x7E]", "?")
                .trim();
    }

    private List<String> wrapText(String text, int maxCharsPerLine) {
        List<String> lines = new ArrayList<>();
        if (text == null || text.isBlank()) return lines;

        String[] paragraphs = text.split("\n");
        for (String para : paragraphs) {
            String clean = sanitize(para);
            if (clean.isEmpty()) continue;

            while (clean.length() > maxCharsPerLine) {
                int splitIndex = clean.lastIndexOf(' ', maxCharsPerLine);
                if (splitIndex == -1 || splitIndex < 20) {
                    splitIndex = maxCharsPerLine;
                }
                lines.add(clean.substring(0, splitIndex).trim());
                clean = clean.substring(splitIndex).trim();
            }
            if (!clean.isEmpty()) {
                lines.add(clean);
            }
        }
        return lines;
    }
}
