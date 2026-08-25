package com.spicyeat.menu.service;

import com.spicyeat.common.error.ApiException;
import com.spicyeat.menu.domain.Category;
import com.spicyeat.menu.domain.MenuItem;
import com.spicyeat.menu.repository.AddonRepository;
import com.spicyeat.menu.repository.CategoryRepository;
import com.spicyeat.menu.repository.MenuItemRepository;
import com.spicyeat.menu.web.dto.MenuItemRequest;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Cache-aside on the read-heavy, admin-write-rarely public catalog (plan
 * section 19): categories barely ever change, and menu items change far
 * less often than they're browsed. Every write below evicts broadly rather
 * than surgically — correctness over precision, given how infrequent writes
 * are here; a stale 5-minute TTL is the worst case even if eviction were
 * skipped entirely.
 */
@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final AddonRepository addonRepository;

    public MenuService(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository, AddonRepository addonRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.addonRepository = addonRepository;
    }

    @Cacheable("categories")
    @Transactional(readOnly = true)
    public List<Category> listCategories() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc();
    }

    @Cacheable(value = "menuItemLists", key = "#categoryId == null ? 'all' : #categoryId")
    @Transactional(readOnly = true)
    public List<MenuItem> listItems(UUID categoryId) {
        List<MenuItem> items = categoryId == null ? menuItemRepository.findAll() : menuItemRepository.findByCategoryId(categoryId);
        return items.stream().filter(MenuItem::isAvailable).toList();
    }

    @Cacheable(value = "menuItems", key = "#id")
    @Transactional(readOnly = true)
    public MenuItem getById(UUID id) {
        return menuItemRepository.findById(id).orElseThrow(() -> ApiException.notFound("Menu item not found"));
    }

    @Cacheable(value = "menuItemsBySlug", key = "#slug")
    @Transactional(readOnly = true)
    public MenuItem getBySlug(String slug) {
        return menuItemRepository.findBySlug(slug).orElseThrow(() -> ApiException.notFound("Menu item not found"));
    }

    @Transactional(readOnly = true)
    public List<MenuItem> search(String query) {
        return menuItemRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    @Caching(evict = {
            @CacheEvict(value = "menuItemLists", allEntries = true)
    })
    @Transactional
    public MenuItem create(MenuItemRequest request) {
        if (!categoryRepository.existsById(request.categoryId())) {
            throw ApiException.badRequest("Unknown category");
        }
        if (menuItemRepository.existsBySlug(request.slug())) {
            throw ApiException.conflict("A menu item with this slug already exists");
        }
        MenuItem item = new MenuItem(
                request.categoryId(), request.name(), request.slug(), request.description(),
                request.price(), request.spiceLevel(), request.vegetarian(), request.imageUrl()
        );
        item.setDisplayOrder(request.displayOrder());
        return menuItemRepository.save(item);
    }

    @Caching(evict = {
            @CacheEvict(value = "menuItems", key = "#id"),
            @CacheEvict(value = "menuItemsBySlug", allEntries = true),
            @CacheEvict(value = "menuItemLists", allEntries = true)
    })
    @Transactional
    public MenuItem update(UUID id, MenuItemRequest request) {
        MenuItem item = getById(id);
        if (!categoryRepository.existsById(request.categoryId())) {
            throw ApiException.badRequest("Unknown category");
        }
        if (!item.getSlug().equals(request.slug()) && menuItemRepository.existsBySlug(request.slug())) {
            throw ApiException.conflict("A menu item with this slug already exists");
        }
        item.setCategoryId(request.categoryId());
        item.setName(request.name());
        item.setSlug(request.slug());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setSpiceLevel(request.spiceLevel());
        item.setVegetarian(request.vegetarian());
        item.setImageUrl(request.imageUrl());
        item.setDisplayOrder(request.displayOrder());
        return menuItemRepository.save(item);
    }

    @Caching(evict = {
            @CacheEvict(value = "menuItems", key = "#id"),
            @CacheEvict(value = "menuItemsBySlug", allEntries = true),
            @CacheEvict(value = "menuItemLists", allEntries = true)
    })
    @Transactional
    public void delete(UUID id) {
        MenuItem item = getById(id);
        menuItemRepository.delete(item);
    }

    @Caching(evict = {
            @CacheEvict(value = "menuItems", key = "#id"),
            @CacheEvict(value = "menuItemsBySlug", allEntries = true),
            @CacheEvict(value = "menuItemLists", allEntries = true)
    })
    @Transactional
    public MenuItem setAvailability(UUID id, boolean available) {
        MenuItem item = getById(id);
        item.setAvailable(available);
        return menuItemRepository.save(item);
    }

    @Transactional(readOnly = true)
    public List<com.spicyeat.menu.domain.Addon> listAddons(UUID menuItemId) {
        getById(menuItemId);
        return addonRepository.findByMenuItemId(menuItemId);
    }
}
