package com.streak.demo;

import com.streak.auth.User;
import com.streak.auth.repositories.UserRepository;
import com.streak.gamification.entities.Goal;
import com.streak.gamification.repositories.GoalRepository;
import com.streak.posts.entities.Post;
import com.streak.posts.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DemoDataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final GoalRepository goalRepository;
    private final PostRepository postRepository;

    private final Random rand = new Random();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only populate demo data if there are no users with username demo1
        if (userRepository.existsByUsername("demo1")) {
            System.out.println("Demo users already exist, skipping demo data load.");
            return;
        }

        System.out.println("Loading demo users, goals and posts...");

        for (int i = 1; i <= 10; i++) {
            String username = "demo" + i;
            User user = new User();
            user.setUsername(username);
            user.setEmail(username + "@example.com");
            user.setPassword("password");
            user.setFullName("Demo User " + i);
            user.setBio("I am demo user " + i + ".");
            userRepository.save(user);

            // Create 1 or 2 goals per user
            int goalsCount = i % 2 == 0 ? 2 : 1;
            for (int g = 1; g <= goalsCount; g++) {
                Goal goal = new Goal();
                goal.setUser(user);
                
                // 🛑 CRITICAL FIX: Set the username field explicitly
                goal.setUsername(username); 
                
                goal.setTitle((g == 1 ? "Daily Writing" : "Morning Pages") + " - " + username);
                int target = (g == 1) ? 7 + rand.nextInt(24) : 14 + rand.nextInt(16);
                goal.setTargetDays(target);
                int current = rand.nextInt(Math.min(target, 5)) + 1;
                goal.setCurrentStreak(current);
                goal.setStartDate(LocalDate.now().minusDays(rand.nextInt(10)));
                goal.setActive(true);
                goal.setLongestStreak(Math.max(current, rand.nextInt(10)));
                goal.setFreezeCount(1);
                goal.setTotalPoints(10 * current);
                goal.setStreakStatus(current >= 7 ? "Consistent" : "Beginner");
                goalRepository.save(goal);

                // Create 1-3 posts for the goal
                int postsCount = 1 + rand.nextInt(3);
                for (int p = 1; p <= postsCount; p++) {
                    Post post = new Post();
                    post.setTitle("Demo post " + p + " for " + goal.getTitle());
                    post.setContent("This is a demo post for user " + username + ".\n\nLorem ipsum dolor sit amet.");
                    post.setAuthorUsername(username);
                    post.setGoalId(goal.getId());
                    // Use picsum as placeholder images
                    post.setImageUrl("https://picsum.photos/seed/" + username + p + "/1200/600");
                    postRepository.save(post);
                }
            }
        }

        System.out.println("Demo data load complete.");
    }
}