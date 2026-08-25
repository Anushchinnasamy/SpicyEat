package com.spicyeat.menu.repository;

import com.spicyeat.menu.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByOrderByDisplayOrderAsc();
}
