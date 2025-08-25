package com.printare.domain;

import java.time.Instant;

public class PrintJob {
    public enum Status { PENDING, PRINTING, COMPLETED, FAILED, CANCELLED }

    public String id;
    public String originalName;
    public String storagePath;
    public String mimeType;
    public long sizeBytes;
    public Instant createdAt;
    public Instant updatedAt;
    public Status status;
    public String tokenId;
    public String sessionId;
    public String printerName;
    public int attempts;
    public String errorMessage;

    public PrintJob() {}
}


