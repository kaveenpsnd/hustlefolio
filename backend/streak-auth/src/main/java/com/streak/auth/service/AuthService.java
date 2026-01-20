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
        user.setRole(com.streak.auth.Role.USER); // Default role

        User savedUser = userRepository.save(user);
        System.out.println("User registered successfully: " + savedUser.getUsername());

        // Generate token for the new user
        String token = jwtUtil.generateToken(username, savedUser.getRole().toString());
        return new AuthResponse(token, username, savedUser.getRole().toString());
    }

    public AuthResponse login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Handle null role for legacy users (Default to USER)
        if (user.getRole() == null) {
            System.out.println("⚠️ WARNING: User " + username + " has NULL role, defaulting to USER");
            user.setRole(com.streak.auth.Role.USER);
            userRepository.save(user);
        }

        System.out.println("=== LOGIN DEBUG ===");
        System.out.println("Username: " + username);
        System.out.println("DB Role: " + user.getRole());
        System.out.println("Generating token with role: " + user.getRole().toString());

        String token = jwtUtil.generateToken(username, user.getRole().toString());

        System.out.println("Token generated successfully");
        System.out.println("Response role: " + user.getRole().toString());
        System.out.println("==================");

        return new AuthResponse(token, username, user.getRole().toString());
    }

    /**
     * Temporary method to promote a user to ADMIN
     */
    public void promoteToAdmin(String username, String secret) {
        if (!"SUPER_ADMIN_SECRET_2026".equals(secret)) {
            throw new RuntimeException("Invalid admin secret");
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("=== PROMOTION DEBUG ===");
        System.out.println("Username: " + username);
        System.out.println("Current role: " + user.getRole());

        user.setRole(com.streak.auth.Role.ADMIN);
        User savedUser = userRepository.save(user);

        System.out.println("New role: " + savedUser.getRole());
        System.out.println("✅ User promoted to ADMIN successfully");
        System.out.println("⚠️ IMPORTANT: User must LOG OUT and LOG IN again for changes to take effect!");
        System.out.println("======================");
    }
}