package com.streak.auth.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * File storage service for user profile pictures
 * Part of streak-auth module - handles user-related file uploads
 * Uses shared uploads/ folder with "profile_" prefix
 */
@Service("profileFileStorageService")
public class FileStorageService {
    
    private final Path root = Paths.get("uploads");

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize uploads folder: " + e.getMessage());
        }
    }

    /**
     * Save profile picture file to uploads/ folder
     * Uses "profile_" prefix to distinguish from post images
     * @param file MultipartFile to save
     * @return filename of saved file
     */
    public String saveProfilePicture(MultipartFile file) {
        try {
            // Generate unique filename with "profile_" prefix
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
            String filename = "profile_" + UUID.randomUUID() + extension;
            
            // Save file to uploads/ folder
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Could not store profile picture: " + e.getMessage());
        }
    }

    /**
     * Delete profile picture file from uploads/ folder
     * @param filename filename to delete (should start with "profile_")
     */
    public void deleteProfilePicture(String filename) {
        try {
            // Security check: only allow deletion of files with "profile_" prefix
            if (!filename.startsWith("profile_")) {
                throw new RuntimeException("Invalid profile picture filename");
            }
            Path file = root.resolve(filename);
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("Could not delete profile picture: " + e.getMessage());
        }
    }
}
