package com.streak.gamification.controllers.advice;


import com.streak.exception.GoalRequiredException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionhandler {
    @ExceptionHandler(GoalRequiredException.class)
    public ResponseEntity<Map<String, String>> handleGoalRequired(GoalRequiredException ex) {

        //json response
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", ex.getMessage());
        errorResponse.put("action", "REDIRECT_TO_GOAL_CREATION");

        // /return http 403
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

}
