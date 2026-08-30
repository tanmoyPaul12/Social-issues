package com.example.social_issues.industrypartnership.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ReleaseDisbursementRequest {

    @NotNull(message = "Disbursement tranche ID is required")
    private Long disbursementId;

    private String paymentMethod = "NEFT_RTGS";

    private String utrNumber;

    private String receiptDocUrl;

    private String notes;

    private LocalDate disbursedDate = LocalDate.now();

    public ReleaseDisbursementRequest() {}

    public Long getDisbursementId() { return disbursementId; }
    public void setDisbursementId(Long disbursementId) { this.disbursementId = disbursementId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getUtrNumber() { return utrNumber; }
    public void setUtrNumber(String utrNumber) { this.utrNumber = utrNumber; }

    public String getReceiptDocUrl() { return receiptDocUrl; }
    public void setReceiptDocUrl(String receiptDocUrl) { this.receiptDocUrl = receiptDocUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDate getDisbursedDate() { return disbursedDate; }
    public void setDisbursedDate(LocalDate disbursedDate) { this.disbursedDate = disbursedDate; }
}
