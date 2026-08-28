package com.spicyeat.delivery.repository;

import com.spicyeat.delivery.domain.DeliveryPartnerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, UUID> {
}
