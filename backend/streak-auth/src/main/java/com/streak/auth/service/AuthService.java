package com.streak.auth.service;

import com.streak.auth.repositories.UserRepository;
import com.streak.auth.utils.JwtUtil;
import com.streak.auth.dtos.AuthResponse; // Make sure this is imported
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    // ALL variables must be INSIDE the class braces
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(String username, String email, String rawPassword) {
        if(userRepository.findByUsername(username).isPresent()){
            throw new RuntimeException("Username already exists");
        }

        // ... (rest of your registration logic)

        String token = jwtUtil.generateToken(username);
        return new AuthResponse(token, username);
    }

    public AuthResponse login(String username, String rawPassword) {
        // ... (rest of your login logic)

        String token = jwtUtil.generateToken(username);
        return new AuthResponse(token, username);
    }
}