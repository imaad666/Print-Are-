package com.printare.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    private static class TokenInfo {
        final String kioskId;
        final Instant expiresAt;
        volatile boolean locked;

        TokenInfo(String kioskId, Instant expiresAt) {
            this.kioskId = kioskId;
            this.expiresAt = expiresAt;
            this.locked = false;
        }
    }

    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    public String issueToken(String kioskId, long ttlSeconds) {
        String token = UUID.randomUUID().toString();
        tokenStore.put(token, new TokenInfo(kioskId, Instant.now().plusSeconds(ttlSeconds)));
        return token;
    }

    public boolean validate(String token, String kioskId) {
        TokenInfo info = tokenStore.get(token);
        if (info == null) return false;
        if (!info.kioskId.equals(kioskId)) return false;
        if (info.locked) return false;
        return Instant.now().isBefore(info.expiresAt);
    }

    public boolean lock(String token) {
        TokenInfo info = tokenStore.get(token);
        if (info == null) return false;
        if (info.locked) return false;
        if (Instant.now().isAfter(info.expiresAt)) return false;
        info.locked = true;
        return true;
    }

    public void invalidate(String token) {
        tokenStore.remove(token);
    }
}


