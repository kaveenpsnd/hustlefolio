package com.streak.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration for serving static files
 * Part of streak-auth module
 * 
 * Note: Profile pictures are stored in shared uploads/ folder with "profile_" prefix
 * They are served through the same /api/images/** endpoint as post images
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // No additional resource handlers needed
    // Profile pictures use the same uploads/ folder and are served via /api/images/**
    // which is already configured in streak-app module
}
