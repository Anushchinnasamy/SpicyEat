package com.spicyeat.user.service;

import com.spicyeat.user.domain.Address;
import com.spicyeat.user.domain.Favourite;
import com.spicyeat.user.domain.UserProfile;
import com.spicyeat.user.repository.AddressRepository;
import com.spicyeat.user.repository.FavouriteRepository;
import com.spicyeat.user.repository.UserProfileRepository;
import com.spicyeat.user.web.dto.AddressRequest;
import com.spicyeat.common.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final AddressRepository addressRepository;
    private final FavouriteRepository favouriteRepository;

    public UserProfileService(
            UserProfileRepository userProfileRepository,
            AddressRepository addressRepository,
            FavouriteRepository favouriteRepository
    ) {
        this.userProfileRepository = userProfileRepository;
        this.addressRepository = addressRepository;
        this.favouriteRepository = favouriteRepository;
    }

    @Transactional
    public UserProfile getOrCreateProfile(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseGet(() -> userProfileRepository.save(new UserProfile(userId)));
    }

    @Transactional
    public UserProfile updateProfile(UUID userId, String fullName, String phoneNumber) {
        UserProfile profile = getOrCreateProfile(userId);
        if (fullName != null) {
            profile.setFullName(fullName);
        }
        if (phoneNumber != null) {
            profile.setPhoneNumber(phoneNumber);
        }
        return userProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public List<Address> listAddresses(UUID userId) {
        return addressRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Address getAddress(UUID userId, UUID addressId) {
        return addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> ApiException.notFound("Address not found"));
    }

    @Transactional
    public Address addAddress(UUID userId, AddressRequest request) {
        Address address = new Address(
                userId, request.label(), request.line1(), request.line2(),
                request.city(), request.state(), request.postalCode()
        );
        address.setDefault(request.isDefault());
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> ApiException.notFound("Address not found"));
        address.setLabel(request.label());
        address.setLine1(request.line1());
        address.setLine2(request.line2());
        address.setCity(request.city());
        address.setState(request.state());
        address.setPostalCode(request.postalCode());
        address.setDefault(request.isDefault());
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> ApiException.notFound("Address not found"));
        addressRepository.delete(address);
    }

    @Transactional(readOnly = true)
    public List<Favourite> listFavourites(UUID userId) {
        return favouriteRepository.findByUserId(userId);
    }

    @Transactional
    public void addFavourite(UUID userId, UUID menuItemId) {
        favouriteRepository.findByUserIdAndMenuItemId(userId, menuItemId)
                .orElseGet(() -> favouriteRepository.save(new Favourite(userId, menuItemId)));
    }

    @Transactional
    public void removeFavourite(UUID userId, UUID menuItemId) {
        favouriteRepository.findByUserIdAndMenuItemId(userId, menuItemId)
                .ifPresent(favouriteRepository::delete);
    }
}
