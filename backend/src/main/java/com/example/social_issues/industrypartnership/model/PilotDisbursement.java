package com.example.social_issues.industrypartnership.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pilot_disbursements", indexes = {
    @Index(name = "idx_disb_pilot", columnList = "pilot_id"),
    @Index(name = "idx_disb_status", columnList = "status"),
    @Index(name = "idx_disb_reference", columnList = "disbursement_reference")
})
public class PilotDisbursement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pilot_id", nullable = false)
    private CoFundedPilot pilot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private PilotMilestone milestone;

    @Column(name = "tranche_number", nullable = false)
    private Integer trancheNumber;

    @Column(name = "tranche_label", length = 200)
    private String trancheLabel;

    @Column(name = "disbursement_reference", length = 100, nullable = false)
    private String disbursementReference;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DisbursementStatus status = DisbursementStatus.SCHEDULED;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(name = "disbursed_date")
    private LocalDate disbursedDate;

    @Column(name = "payment_method", length = 80)
    private String paymentMethod;

    @Column(name = "utr_number", length = 100)
    private String utrNumber;

    @Column(name = "receipt_doc_url", length = 500)
    private String receiptDocUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public PilotDisbursement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CoFundedPilot getPilot() { return pilot; }
    public void setPilot(CoFundedPilot pilot) { this.pilot = pilot; }

    public PilotMilestone getMilestone() { return milestone; }
    public void setMilestone(PilotMilestone milestone) { this.milestone = milestone; }

    public Integer getTrancheNumber() { return trancheNumber; }
    public void setTrancheNumber(Integer trancheNumber) { this.trancheNumber = trancheNumber; }

    public String getTrancheLabel() { return trancheLabel; }
    public void setTrancheLabel(String trancheLabel) { this.trancheLabel = trancheLabel; }

    public String getDisbursementReference() { return disbursementReference; }
    public void setDisbursementReference(String disbursementReference) { this.disbursementReference = disbursementReference; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public DisbursementStatus getStatus() { return status; }
    public void setStatus(DisbursementStatus status) { this.status = status; }

    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }

    public LocalDate getDisbursedDate() { return disbursedDate; }
    public void setDisbursedDate(LocalDate disbursedDate) { this.disbursedDate = disbursedDate; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getReceiptDocUrl() { return receiptDocUrl; }
    public void setReceiptDocUrl(String receiptDocUrl) { this.receiptDocUrl = receiptDocUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
