package com.spicyeat.user.repository;

import com.spicyeat.user.domain.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavouriteRepository extends JpaRepository<Favourite, UUID> {
    List<Favourite> findByUserId(UUID userId);
    Optional<Favourite> findByUserIdAndMenuItemId(UUID userId, UUID menuItemId);
}
