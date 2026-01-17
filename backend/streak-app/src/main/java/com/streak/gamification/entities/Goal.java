package com.streak.gamification.entities;


import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.streak.auth.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="goals")
@Data
public class Goal {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;
   
   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "user_id", nullable = true)
   @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "goals"})
   private User user;

   @Column(nullable = false)
    private String title;
   
   private Integer targetDays;
   private Integer currentStreak = 0;
   private LocalDate startDate = LocalDate.now();
   private boolean active = true;
   private LocalDate lastUpdatedDate;
   
   @Column(name = "longest_streak")
   private Integer longestStreak = 0;
   
   @Column(name = "freeze_count")
   private Integer freezeCount = 1;
   @Column(name = "username", nullable = false)
private String username;
   
   private Integer totalPoints = 0;
   private String streakStatus = "uninitiated";

   @Column(name = "created_at", updatable = false)
   private LocalDateTime createdAt;

   @PrePersist
   protected void onCreate() {
      if (createdAt == null) {
         createdAt = LocalDateTime.now();
      }
   }

   @ManyToOne(fetch = FetchType.EAGER)
   @JoinColumn(name = "category_id")
   private GoalCategory category;

   @ElementCollection
   @CollectionTable(name = "goal_checkins", joinColumns = @JoinColumn(name = "goal_id"))
   @Column(name = "checkin_date")
   private List<LocalDate> checkinDates = new ArrayList<>();

}
