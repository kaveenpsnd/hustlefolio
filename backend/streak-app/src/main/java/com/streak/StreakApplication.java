package com.streak;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(scanBasePackages = {
        "com.streak",
        "com.streak.auth"
})
public class StreakApplication {

    public static void main(String[] args) {
        SpringApplication.run(StreakApplication.class, args);
    }

    @Bean
    CommandLineRunner init(com.streak.posts.service.FileStorageService postFileStorageService,
                          com.streak.auth.service.FileStorageService profileFileStorageService) {
        return args -> {
            postFileStorageService.init();
            profileFileStorageService.init();
        };
    }
}