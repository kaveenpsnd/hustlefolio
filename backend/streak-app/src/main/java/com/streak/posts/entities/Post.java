package com.streak.posts.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.streak.gamification.entities.Goal;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private String authorUsername;

    @Column(name = "goal_id")
    private Long goalId;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "goal_id", insertable = false, updatable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "user", "checkinDates"})
    private Goal goal;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    private String imageUrl;
    
    @Column(length = 500)
    private String featuredImage;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "post_tags",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

}
