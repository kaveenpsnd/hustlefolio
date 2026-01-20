package com.streak.auth.controllers;

import com.streak.auth.utils.JwtUtil;
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
}
