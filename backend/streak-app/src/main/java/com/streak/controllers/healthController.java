package com.streak.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class healthController {

    @GetMapping("/ping")
    public String checkHealth() {
        return "Pong! Streak Platform is running.";
    }
}