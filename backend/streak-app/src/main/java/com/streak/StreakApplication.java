package com.streak;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {
        "com.streak",
        "com.streak.auth"
})
public class StreakApplication {

    public static void main(String[] args) {
        SpringApplication.run(StreakApplication.class, args);
    }
}