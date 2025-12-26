package com.streak.posts.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;




@Service
public class PostEventProducer {
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${qstash.token}")
    private String qstashToken;

    // Line 1: Verify this matches your CURRENT ngrok terminal exactly
    private final String NGROK_URL = "https://brandee-preimportant-semimystically.ngrok-free.dev";

    public void publishPostCreated(String username) {
        try {
            // Line 2: Construct the destination path
            String destination = NGROK_URL + "/api/goals/streak-update";

            // Line 3: Construct the full QStash URL as a URI object to prevent double-encoding
            java.net.URI qstashUri = new java.net.URI("https://qstash.upstash.io/v2/publish/" + destination);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + qstashToken);
            headers.setContentType(MediaType.TEXT_PLAIN);

            HttpEntity<String> entity = new HttpEntity<>(username, headers);

            // Line 4: Use the URI object here instead of a String
            restTemplate.postForEntity(qstashUri, entity, String.class);

            System.out.println("✅ Successfully published to QStash for user: " + username);

        } catch (java.net.URISyntaxException e) {
            System.err.println("❌ URL Syntax Error: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ QStash Connection Error: " + e.getMessage());
        }
    }
}