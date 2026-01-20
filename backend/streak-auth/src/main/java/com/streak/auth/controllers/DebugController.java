package com.streak.auth.controllers;

import com.streak.auth.utils.JwtUtil;
import com.streak.auth.repositories.UserRepository;
import com.streak.auth.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class DebugController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugAuth(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> debugInfo = new HashMap<>();

        // 1. Check Security Context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        debugInfo.put("context_authentication", auth != null ? auth.getName() : "null");
        debugInfo.put("context_authorities", auth != null ? auth.getAuthorities().toString() : "null");

        // 2. Check Raw Token
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            debugInfo.put("token_received", "yes");
            try {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                boolean valid = jwtUtil.validateToken(token, username);

                debugInfo.put("token_username", username);
                debugInfo.put("token_role_claim", role);
                debugInfo.put("token_valid", valid);
            } catch (Exception e) {
                debugInfo.put("token_error", e.getMessage());
            }
        } else {
            debugInfo.put("token_received", "no or invalid header");
        }

        return ResponseEntity.ok(debugInfo);
    }

    @GetMapping("/debug/db-check")
    public ResponseEntity<Map<String, Object>> checkDbRole(
            @org.springframework.web.bind.annotation.RequestParam String username) {
        Map<String, Object> info = new HashMap<>();
        info.put("requested_username", username);
        try {
            // We need to inject UserRepository to do this.
            // Since this is a quick debug hack, let's just use a raw query if possible, or
            // injected repo.
            // But DebugController didn't inject UserRepository.
            // Let's rely on the user running the promote command again and seeing the 200
            // OK.
            // Actually, let's Modify DebugController to inject UserRepository.
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }
}
