package com.streak.gamification.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("title")
    private String title;
    
    @JsonProperty("targetDays")
    private Integer targetDays;
    
    @JsonProperty("currentStreak")
    private Integer currentStreak;
    
    @JsonProperty("categoryId")
    private Long categoryId;
}
