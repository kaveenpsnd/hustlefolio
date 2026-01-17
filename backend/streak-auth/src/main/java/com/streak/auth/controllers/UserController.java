package com.streak.auth.controllers;

import com.streak.auth.dtos.ChangePasswordRequest;
import com.streak.auth.dtos.UpdateProfileRequest;
import com.streak.auth.dtos.UserProfileResponse;
import com.streak.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class UserController {
    
    private final UserService userService;
    
    /**
     * Get current user's profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Get user profile by username (public view)
     * GET /api/users/{username}
     */
    @GetMapping("/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable String username) {
        UserProfileResponse profile = userService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }
    
    /**
     * Update current user's profile
     * PUT /api/users/me
     */
    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        UserProfileResponse updatedProfile = userService.updateProfile(username, request);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Update profile picture URL
     * PUT /api/users/me/profile-picture
     */
    @PutMapping("/me/profile-picture")
    public ResponseEntity<UserProfileResponse> updateProfilePicture(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String profilePictureUrl = request.get("profilePictureUrl");
        
        if (profilePictureUrl == null || profilePictureUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        UserProfileResponse updatedProfile = userService.updateProfilePicture(username, profilePictureUrl);
        return ResponseEntity.ok(updatedProfile);
    }
    
    /**
     * Change password
     * POST /api/users/me/change-password
     */
    @PostMapping("/me/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        userService.changePassword(username, request);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Delete current user's account (and all related data)
     * DELETE /api/users/me
     */
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount(Authentication authentication) {
        String username = authentication.getName();
        userService.deleteAccount(username);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account deleted successfully");
        return ResponseEntity.ok(response);
    }
}
