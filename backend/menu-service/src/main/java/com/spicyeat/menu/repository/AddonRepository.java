package com.spicyeat.menu.repository;

import com.spicyeat.menu.domain.Addon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AddonRepository extends JpaRepository<Addon, UUID> {
    List<Addon> findByMenuItemId(UUID menuItemId);
}
