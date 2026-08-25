package com.spicyeat.user.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.user.domain.Address;
import com.spicyeat.user.domain.Favourite;
import com.spicyeat.user.domain.UserProfile;
import com.spicyeat.user.service.UserProfileService;
import com.spicyeat.user.web.dto.AddressRequest;
import com.spicyeat.user.web.dto.AddressResponse;
import com.spicyeat.user.web.dto.FavouriteResponse;
import com.spicyeat.user.web.dto.ProfileResponse;
import com.spicyeat.user.web.dto.UpdateProfileRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ProfileResponse me(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        UserProfile profile = userProfileService.getOrCreateProfile(userId);
        return new ProfileResponse(profile.getUserId(), profile.getFullName(), profile.getPhoneNumber());
    }

    @PutMapping("/me")
    public ProfileResponse updateMe(HttpServletRequest request, @Valid @RequestBody UpdateProfileRequest body) {
        UUID userId = CurrentUser.userId(request);
        UserProfile profile = userProfileService.updateProfile(userId, body.fullName(), body.phoneNumber());
        return new ProfileResponse(profile.getUserId(), profile.getFullName(), profile.getPhoneNumber());
    }

    @GetMapping("/me/addresses")
    public List<AddressResponse> addresses(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        return userProfileService.listAddresses(userId).stream().map(AddressResponse::from).toList();
    }

    @GetMapping("/me/addresses/{id}")
    public AddressResponse getAddress(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        return AddressResponse.from(userProfileService.getAddress(userId, id));
    }

    @PostMapping("/me/addresses")
    public ResponseEntity<AddressResponse> addAddress(HttpServletRequest request, @Valid @RequestBody AddressRequest body) {
        UUID userId = CurrentUser.userId(request);
        Address address = userProfileService.addAddress(userId, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(AddressResponse.from(address));
    }

    @PutMapping("/me/addresses/{id}")
    public AddressResponse updateAddress(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody AddressRequest body) {
        UUID userId = CurrentUser.userId(request);
        return AddressResponse.from(userProfileService.updateAddress(userId, id, body));
    }

    @DeleteMapping("/me/addresses/{id}")
    public ResponseEntity<Void> deleteAddress(HttpServletRequest request, @PathVariable UUID id) {
        UUID userId = CurrentUser.userId(request);
        userProfileService.deleteAddress(userId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/favourites")
    public List<FavouriteResponse> favourites(HttpServletRequest request) {
        UUID userId = CurrentUser.userId(request);
        return userProfileService.listFavourites(userId).stream()
                .map(f -> new FavouriteResponse(f.getMenuItemId()))
                .toList();
    }

    @PostMapping("/me/favourites/{menuItemId}")
    public ResponseEntity<Void> addFavourite(HttpServletRequest request, @PathVariable UUID menuItemId) {
        UUID userId = CurrentUser.userId(request);
        userProfileService.addFavourite(userId, menuItemId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/me/favourites/{menuItemId}")
    public ResponseEntity<Void> removeFavourite(HttpServletRequest request, @PathVariable UUID menuItemId) {
        UUID userId = CurrentUser.userId(request);
        userProfileService.removeFavourite(userId, menuItemId);
        return ResponseEntity.noContent().build();
    }
}
