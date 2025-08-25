package com.printare.service;

import com.printare.domain.SessionState;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {

    public static class Session {
        public final String sessionId;
        public final String kioskId;
        public final String token;
        public volatile SessionState state;
        public volatile Instant lastKeepaliveAt;
        public final Instant createdAt;

        public Session(String sessionId, String kioskId, String token, SessionState state) {
            this.sessionId = sessionId;
            this.kioskId = kioskId;
            this.token = token;
            this.state = state;
            this.createdAt = Instant.now();
            this.lastKeepaliveAt = this.createdAt;
        }
    }

    private final Map<String, Session> sessionsById = new ConcurrentHashMap<>();
    private volatile String currentSessionId;

    public Session startSession(String kioskId, String token) {
        String sessionId = UUID.randomUUID().toString();
        Session session = new Session(sessionId, kioskId, token, SessionState.LOCKED);
        sessionsById.put(sessionId, session);
        currentSessionId = sessionId;
        return session;
    }

    public Session getCurrentSession() {
        return currentSessionId == null ? null : sessionsById.get(currentSessionId);
    }

    public Session getById(String sessionId) {
        return sessionsById.get(sessionId);
    }

    public void keepalive(String sessionId) {
        Session s = sessionsById.get(sessionId);
        if (s != null) {
            s.lastKeepaliveAt = Instant.now();
        }
    }

    public void endSession(String sessionId) {
        Session s = sessionsById.remove(sessionId);
        if (s != null && sessionId.equals(currentSessionId)) {
            currentSessionId = null;
        }
    }

    public void setState(String sessionId, SessionState state) {
        Session s = sessionsById.get(sessionId);
        if (s != null) s.state = state;
    }
}


