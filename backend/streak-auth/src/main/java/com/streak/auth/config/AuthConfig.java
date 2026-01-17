package com.streak.auth.config;

import com.streak.auth.filters.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@RequiredArgsConstructor // This automatically "plugs in" our Guard
public class AuthConfig {

    private final JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173", "http://localhost:5174","https://hustlefolio.vercel.app","http://64.227.166.226"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // 1. PUBLIC AUTH PATHS
                        .requestMatchers("/api/auth/**").permitAll()

                        // 2. IMAGE ENDPOINTS (shared uploads/ folder)
                        // Public: viewing all images (GET) - both post and profile images
                        .requestMatchers(HttpMethod.GET, "/api/images/**").permitAll()
                        // Protected: uploading images (POST) - requires authentication
                        .requestMatchers(HttpMethod.POST, "/api/images/upload").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/profile/upload-picture").authenticated()

                        // 3. USER PROFILE ENDPOINTS
                        // Public: viewing user profiles (GET)
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()
                        // Protected: updating profile (PUT, POST)
                        .requestMatchers("/api/users/me/**").authenticated()

                        // 4. CATEGORIES & TAGS PUBLIC READS
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tags/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/goal-categories/**").permitAll()

                        // 5. GOALS & POSTS PUBLIC READS (must come before authenticated matchers)
                        .requestMatchers("/api/goals/history/**").permitAll()
                        .requestMatchers("/api/goals/streak-update").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/goals/**").permitAll()

                        // 6. EVERYTHING ELSE FOR POSTS/GOALS/CATEGORIES PROTECTED
                        .requestMatchers("/api/posts/**").authenticated()
                        .requestMatchers("/api/goals/**").authenticated()
                        .requestMatchers("/api/categories/**").authenticated()
                        .requestMatchers("/api/tags/**").authenticated()
                        .requestMatchers("/api/goal-categories/**").authenticated()
                        
                        // 7. CATCH-ALL
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }
}

//kaveenps2
//kaveenps2@kaveen