package com.streak.auth.service;

import com.streak.auth.User;
import com.streak.auth.dtos.ChangePasswordRequest;
import com.streak.auth.dtos.UpdateProfileRequest;
import com.streak.auth.dtos.UserProfileResponse;
import com.streak.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Autowired(required = false)
    private DataSource dataSource;
    
    /**
     * Get user profile by username
     */
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return mapToProfileResponse(user);
    }
    
    /**
     * Update user profile
     */
    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Update fields
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getWebsiteUrl() != null) {
            user.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.getGithubUsername() != null) {
            user.setGithubUsername(request.getGithubUsername());
        }
        if (request.getTwitterUsername() != null) {
            user.setTwitterUsername(request.getTwitterUsername());
        }
        if (request.getLinkedinUrl() != null) {
            user.setLinkedinUrl(request.getLinkedinUrl());
        }
        
        User savedUser = userRepository.save(user);
        return mapToProfileResponse(savedUser);
    }
    
    /**
     * Update profile picture URL
     */
    @Transactional
    public UserProfileResponse updateProfilePicture(String username, String profilePictureUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        user.setProfilePictureUrl(profilePictureUrl);
        User savedUser = userRepository.save(user);
        return mapToProfileResponse(savedUser);
    }
    
    /**
     * Change password
     */
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update to new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
    
    /**
     * Delete user account and all related data (posts, goals, streaks)
     */
    @Transactional
    public void deleteAccount(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        try {
            // Use direct SQL to delete related data to avoid circular dependencies
            if (dataSource != null) {
                try (Connection conn = dataSource.getConnection()) {
                    // Delete all posts by this user
                    try (PreparedStatement ps = conn.prepareStatement(
                            "DELETE FROM posts WHERE author_username = ?")) {
                        ps.setString(1, username);
                        int postsDeleted = ps.executeUpdate();
                        System.out.println("Deleted " + postsDeleted + " posts for user: " + username);
                    }
                    
                    // Delete all goals by this user  
                    try (PreparedStatement ps = conn.prepareStatement(
                            "DELETE FROM goals WHERE user_id = ?")) {
                        ps.setLong(1, user.getId());
                        int goalsDeleted = ps.executeUpdate();
                        System.out.println("Deleted " + goalsDeleted + " goals for user: " + username);
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete user data: " + e.getMessage(), e);
        }
        
        // Finally, delete the user
        userRepository.delete(user);
    }
    
    /**
     * Helper method to map User entity to UserProfileResponse
     */
    private UserProfileResponse mapToProfileResponse(User user) {
        return new UserProfileResponse(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getBio(),
            user.getProfilePictureUrl(),
            user.getWebsiteUrl(),
            user.getGithubUsername(),
            user.getTwitterUsername(),
            user.getLinkedinUrl(),
            user.getCreatedAt()
        );
    }
}
