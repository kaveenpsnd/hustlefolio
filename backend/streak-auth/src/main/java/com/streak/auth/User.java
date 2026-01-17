package com.streak.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users") // "users" because "user" is a reserved keyword in SQL
public class User {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    // Profile fields
    private String fullName;
    
    @Column(length = 1000)
    private String bio;
    
    private String profilePictureUrl;
    
    private String websiteUrl;
    
    private String githubUsername;
    
    private String twitterUsername;
    
    private String linkedinUrl;

}
