package com.streak.auth.config;

import com.streak.auth.filters.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@RequiredArgsConstructor // This automatically "plugs in" our Guard
public class AuthConfig {

    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC PATHS (Highest Priority - Specificity first)
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/goals/history/**").permitAll() // MOVE THIS TO THE TOP
                        .requestMatchers("/api/goals/streak-update").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/posts/**").permitAll()

                        // 2. PROTECTED PATHS (Broad rules - authenticated only)
                        .requestMatchers("/api/posts/**", "/api/goals/**").authenticated()

                        // 3. CATCH-ALL (Secure everything else)
                        .anyRequest().authenticated()
                );
        // Tell Spring to use our Guard before its own default guard
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

//kaveenps2
//kaveenps2@kaveen