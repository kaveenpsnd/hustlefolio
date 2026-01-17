package com.streak.posts.repositories;

import com.streak.posts.entities.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByName(String name);
    Optional<Tag> findBySlug(String slug);
    Set<Tag> findByNameIn(Set<String> names);
    boolean existsByName(String name);
}
