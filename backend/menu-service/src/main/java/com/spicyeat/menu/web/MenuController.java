package com.spicyeat.menu.web;

import com.spicyeat.common.security.CurrentUser;
import com.spicyeat.common.security.Role;
import com.spicyeat.menu.domain.MenuItem;
import com.spicyeat.menu.service.MenuService;
import com.spicyeat.menu.web.dto.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public List<MenuItemResponse> list(@RequestParam(required = false) UUID categoryId) {
        return menuService.listItems(categoryId).stream().map(MenuItemResponse::from).toList();
    }

    @GetMapping("/categories")
    public List<CategoryResponse> categories() {
        return menuService.listCategories().stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/search")
    public List<MenuItemResponse> search(@RequestParam String q) {
        return menuService.search(q).stream().map(MenuItemResponse::from).toList();
    }

    @GetMapping("/slug/{slug}")
    public MenuItemResponse getBySlug(@PathVariable String slug) {
        return MenuItemResponse.from(menuService.getBySlug(slug));
    }

    @GetMapping("/{id}")
    public MenuItemResponse getById(@PathVariable UUID id) {
        return MenuItemResponse.from(menuService.getById(id));
    }

    @GetMapping("/{id}/addons")
    public List<AddonResponse> addons(@PathVariable UUID id) {
        return menuService.listAddons(id).stream().map(AddonResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> create(HttpServletRequest request, @Valid @RequestBody MenuItemRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        MenuItem created = menuService.create(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(MenuItemResponse.from(created));
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody MenuItemRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return MenuItemResponse.from(menuService.update(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable UUID id) {
        CurrentUser.requireRole(request, Role.ADMIN);
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/availability")
    public MenuItemResponse setAvailability(HttpServletRequest request, @PathVariable UUID id, @Valid @RequestBody AvailabilityRequest body) {
        CurrentUser.requireRole(request, Role.ADMIN);
        return MenuItemResponse.from(menuService.setAvailability(id, body.available()));
    }
}
