package com.printare.controller;

import com.printare.domain.PrintJob;
import com.printare.domain.SessionState;
import com.printare.service.QrService;
import com.printare.service.SessionService;
import com.printare.service.StorageService;
import com.printare.service.TokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.print.PrintService;
import javax.print.PrintServiceLookup;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class AppController {

    private final TokenService tokenService;
    private final SessionService sessionService;
    private final StorageService storageService;
    private final QrService qrService;
    private final String baseUrl;
    private final String kioskId;
    private final long tokenTtlSeconds;

    private final Map<String, PrintJob> jobs = new ConcurrentHashMap<>();

    public AppController(TokenService tokenService,
                         SessionService sessionService,
                         StorageService storageService,
                         QrService qrService,
                         @Value("${printare.base-url:http://localhost:8080}") String baseUrl,
                         @Value("${printare.kiosk-id:kiosk-001}") String kioskId,
                         @Value("${printare.session.token-ttl-seconds:300}") long tokenTtlSeconds) {
        this.tokenService = tokenService;
        this.sessionService = sessionService;
        this.storageService = storageService;
        this.qrService = qrService;
        this.baseUrl = baseUrl;
        this.kioskId = kioskId;
        this.tokenTtlSeconds = tokenTtlSeconds;
    }

    @GetMapping({"/", "/kiosk"})
    public String kiosk(Model model) throws Exception {
        SessionService.Session current = sessionService.getCurrentSession();
        boolean locked = current != null && (current.state == SessionState.LOCKED || current.state == SessionState.PRINTING);

        String qrDataUrl = null;
        if (!locked) {
            String token = tokenService.issueToken(kioskId, tokenTtlSeconds);
            String url = baseUrl + "/upload?token=" + token;
            qrDataUrl = qrService.generateDataUrl(url);
        }

        model.addAttribute("kioskId", kioskId);
        model.addAttribute("locked", locked);
        model.addAttribute("qrDataUrl", qrDataUrl);
        return "index";
    }

    @GetMapping("/upload")
    public String uploadPage(@RequestParam("token") String token, Model model) {
        if (!tokenService.validate(token, kioskId)) {
            model.addAttribute("error", "This QR/session is invalid or expired.");
            return "upload";
        }
        if (!tokenService.lock(token)) {
            model.addAttribute("error", "This session is already in use.");
            return "upload";
        }
        SessionService.Session session = sessionService.startSession(kioskId, token);
        model.addAttribute("sessionId", session.sessionId);
        model.addAttribute("kioskId", kioskId);
        return "upload";
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseBody
    public Map<String, Object> upload(@RequestParam("token") String token,
                                      @RequestParam("sessionId") String sessionId,
                                      @RequestParam("document") MultipartFile document) throws Exception {
        SessionService.Session s = sessionService.getById(sessionId);
        if (s == null || s.state != SessionState.LOCKED || !s.token.equals(token)) {
            return Map.of("error", "Invalid session");
        }

        StorageService.SavedFile saved = storageService.saveDocument(document);
        PrintJob job = new PrintJob();
        job.id = UUID.randomUUID().toString();
        job.originalName = saved.originalName;
        job.storagePath = saved.storagePath;
        job.mimeType = saved.mimeType;
        job.sizeBytes = saved.sizeBytes;
        job.createdAt = Instant.now();
        job.updatedAt = job.createdAt;
        job.status = PrintJob.Status.PENDING;
        job.tokenId = token;
        job.sessionId = sessionId;
        jobs.put(job.id, job);

        return Map.of("jobId", job.id, "status", job.status);
    }

    @GetMapping("/jobs/{id}")
    @ResponseBody
    public Object jobStatus(@PathVariable String id) {
        PrintJob job = jobs.get(id);
        if (job == null) return Map.of("error", "not_found");
        return job;
    }

    @GetMapping("/printers")
    @ResponseBody
    public List<String> printers() {
        PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
        List<String> names = new ArrayList<>();
        for (PrintService ps : services) names.add(ps.getName());
        return names;
    }

    @PostMapping("/session/keepalive")
    @ResponseBody
    public Map<String, String> keepalive(@RequestParam String sessionId) {
        sessionService.keepalive(sessionId);
        return Map.of("ok", "true");
    }

    @PostMapping("/session/end")
    @ResponseBody
    public Map<String, String> end(@RequestParam String sessionId) {
        SessionService.Session s = sessionService.getById(sessionId);
        if (s != null) {
            sessionService.endSession(sessionId);
            // Invalidate token to force new QR next time
            tokenService.invalidate(s.token);
        }
        return Map.of("ok", "true");
    }
}


