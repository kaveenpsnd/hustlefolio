package com.streak.auth.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for profile picture uploads
 * Part of streak-auth module - handles user profile image operations
 * Profile pictures are stored in uploads/ with "profile_" prefix
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:5174"})
public class ProfileImageController {

    private final com.streak.auth.service.FileStorageService fileStorageService;

    /**
     * Upload profile picture
     * POST /api/profile/upload-picture
     * 
     * Validates file type and size, then stores in uploads/ with profile_ prefix
     */
    @PostMapping(value = "/upload-picture", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestPart("file") MultipartFile file) {
        
        // Validate file is an image
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "File must be an image");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "File size must not exceed 5MB");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        // Save file and return URL (uses shared uploads/ folder with profile_ prefix)
        String filename = fileStorageService.saveProfilePicture(file);
        String fileUrl = "http://localhost:8080/api/images/" + filename;
        
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        
        return ResponseEntity.ok(response);
    }
}
