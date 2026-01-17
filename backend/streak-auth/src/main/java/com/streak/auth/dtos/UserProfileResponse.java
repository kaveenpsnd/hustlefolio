package com.streak.auth.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String bio;
    private String profilePictureUrl;
    private String websiteUrl;
    private String githubUsername;
    private String twitterUsername;
    private String linkedinUrl;
    private LocalDateTime createdAt;
}
