package com.streak.auth.service;

import com.streak.auth.User;
import com.streak.auth.repositories.UserRepository;
import com.streak.auth.utils.JwtUtil;
import com.streak.auth.dtos.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(String username, String email, String rawPassword) {
        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        // Create and save the new user
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        
        User savedUser = userRepository.save(user);
        System.out.println("User registered successfully: " + savedUser.getUsername());

        // Generate token for the new user
        String token = jwtUtil.generateToken(username);
        return new AuthResponse(token, username);
    }

    public AuthResponse login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        System.out.println("User logged in successfully: " + username);
        String token = jwtUtil.generateToken(username);
        return new AuthResponse(token, username);
    }
}