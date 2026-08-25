package com.spicyeat.delivery.repository;

import com.spicyeat.delivery.domain.Earning;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EarningRepository extends JpaRepository<Earning, UUID> {
    List<Earning> findByPartnerIdOrderByCreatedAtDesc(UUID partnerId);
}
