package com.printare.service;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class StorageService {

    private final Path uploadRoot;
    private final Set<String> allowedMimeTypes;
    private final long maxFileSizeBytes;

    public StorageService(
            @Value("${printare.upload-dir:uploads}") String uploadDir,
            @Value("${printare.allowed-mime-types:application/pdf,image/png,image/jpeg}") List<String> allowed,
            @Value("${printare.max-file-size-bytes:26214400}") long maxFileSizeBytes
    ) {
        this.uploadRoot = Paths.get(uploadDir);
        this.allowedMimeTypes = Set.copyOf(allowed == null ? List.of("application/pdf","image/png","image/jpeg") : allowed);
        this.maxFileSizeBytes = maxFileSizeBytes;
    }

    public SavedFile saveDocument(MultipartFile multipartFile) throws IOException {
        if (multipartFile == null || multipartFile.isEmpty()) {
            throw new IOException("No file uploaded");
        }
        if (multipartFile.getSize() > maxFileSizeBytes) {
            throw new IOException("File too large");
        }

        String original = sanitizeFilename(multipartFile.getOriginalFilename());
        String ext = FilenameUtils.getExtension(original);
        String base = FilenameUtils.getBaseName(original);
        String unique = base + "-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID();
        String storedName = ext == null || ext.isBlank() ? unique : unique + "." + ext.toLowerCase();

        if (!Files.exists(uploadRoot)) {
            Files.createDirectories(uploadRoot);
        }

        Path destination = uploadRoot.resolve(storedName).normalize();
        multipartFile.transferTo(destination);

        String contentType = multipartFile.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = Files.probeContentType(destination);
        }
        if (contentType == null || !allowedMimeTypes.contains(contentType)) {
            // best-effort cleanup
            try { Files.deleteIfExists(destination); } catch (Exception ignored) {}
            throw new IOException("Unsupported file type");
        }

        return new SavedFile(original, destination.toString(), contentType, multipartFile.getSize());
    }

    private String sanitizeFilename(String name) {
        if (name == null) return "file";
        String cleaned = name.replaceAll("[^a-zA-Z0-9._-]", "_");
        return cleaned.length() > 200 ? cleaned.substring(0, 200) : cleaned;
    }

    public static class SavedFile {
        public final String originalName;
        public final String storagePath;
        public final String mimeType;
        public final long sizeBytes;

        public SavedFile(String originalName, String storagePath, String mimeType, long sizeBytes) {
            this.originalName = originalName;
            this.storagePath = storagePath;
            this.mimeType = mimeType;
            this.sizeBytes = sizeBytes;
        }
    }
}


