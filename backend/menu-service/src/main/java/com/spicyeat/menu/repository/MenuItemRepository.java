package com.spicyeat.menu.repository;

import com.spicyeat.menu.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    Optional<MenuItem> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<MenuItem> findByCategoryId(UUID categoryId);
    List<MenuItem> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
