package com.streak.gamification.controllers;

import com.streak.gamification.entities.GoalCategory;
import com.streak.gamification.services.GoalCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goal-categories")
@RequiredArgsConstructor
public class GoalCategoryController {

    private final GoalCategoryService goalCategoryService;

    @GetMapping
    public ResponseEntity<List<GoalCategory>> getAllCategories() {
        return ResponseEntity.ok(goalCategoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalCategory> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(goalCategoryService.getCategoryById(id));
    }

    @PostMapping
    public ResponseEntity<GoalCategory> createCategory(@RequestBody GoalCategory category) {
        return ResponseEntity.ok(goalCategoryService.createCategory(category));
    }
}
