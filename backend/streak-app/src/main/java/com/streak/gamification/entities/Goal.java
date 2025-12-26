package com.streak.gamification.entities;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="goals")
@Data
public class Goal {
   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;


   @Column(nullable = false)
   private String username;

   @Column(nullable = false)
    private String title;
   private Integer targetDays;
   private Integer currentStreak = 0;
   private LocalDate startDate = LocalDate.now();
   private boolean active = true;
   private LocalDate lastUpdatedDate;
   private Integer longestStreak = 0;
   private Integer freezeCount = 1;
   private Integer totalPoints = 0;
   private String streakStatus = "uninitiated";

}
