# SPICYEAT --- COMPLETE FRONTEND DESIGN PLAN FOR CLAUDE CODE

## 0. Mission

Build SpicyEat as a **single-brand food ordering platform**, not a
marketplace.

SpicyEat is one food brand, similar in product model to a KFC/Burger
King direct-ordering website.

There are exactly three roles: 1. CUSTOMER 2. ADMIN 3. DELIVERY PARTNER

There are NO restaurants as a marketplace concept. Do not build
restaurant listings, restaurant profiles, restaurant discovery,
restaurant-owner UX, restaurant cards, cuisine marketplace search,
cost-for-two, or restaurant-admin pages.

SpicyEat itself is the brand and kitchen.

------------------------------------------------------------------------

## 1. Frontend design inspiration

The primary visual inspiration is the **Sunbeam Bagels & Coffee**
website and its Awwwards presentation:

-   https://sunbeambagels.com/
-   https://www.awwwards.com/sites/sunbeam-bagels-coffee

Use Sunbeam for its: - editorial design thinking - oversized
typography - whitespace - food storytelling - premium photography -
experimental layouts - product-focused composition - playful microcopy -
scroll choreography - rotating/interactive products - playful footer
interaction - visual rhythm

Do NOT copy: - Sunbeam logo - exact text - exact images - proprietary
brand assets - source code - pixel-identical layouts

Target:

> **Sunbeam's design philosophy × SpicyEat's original brand identity.**

------------------------------------------------------------------------

## 2. Brand DNA

The product must feel:

**Editorial + Playful + Premium + Experimental + Food-Focused +
Interactive**

It must NOT feel like: - Zomato - Swiggy - a generic food-delivery
template - a SaaS dashboard - a marketplace

Desired reaction:

> "Damn, I want to eat that."

------------------------------------------------------------------------

## 3. Design system

### Colors

  Token           Hex       Use
  --------------- --------- --------------------
  warm-canvas     #F5F0E8   primary background
  sun-orange      #FA7E3B   CTAs, heat, energy
  soft-lavender   #C3ABC6   editorial sections
  deep-ink        #1A1A1A   primary text
  muted-ink       #68625D   secondary text
  chili-red       #D94A32   very-hot/error
  herb-green      #687A52   veg/success
  white           #FFFFFF   clean surfaces

Visual ratio: - 60% cream - 20% charcoal - 10% orange - 10%
lavender/secondary

Do not make the whole site orange.

### Typography

Display: **Anton**

Body: **Manrope**

Use extreme contrast:

> HUGE DISPLAY TYPE + QUIET SUPPORTING TEXT

------------------------------------------------------------------------

## 4. Locked food categories

Food only. No beverages. No Chinese category.

1.  BURGERS
2.  FRIED CHICKEN
3.  PIZZA
4.  WRAPS & ROLLS
5.  LOADED
6.  PASTA
7.  SIDES
8.  DESSERTS

Example dishes:

**BURGERS** - Fire Smash Burger - Crispy Chicken Burger - Double Cheese
Smash - BBQ Chicken Burger - Jalapeño Melt - Peri Peri Burger - Spicy
Paneer Burger - Loaded Cheese Burger

**FRIED CHICKEN** - Nashville Hot Chicken - Fire Wings - Crispy Chicken
Bucket - Chicken Tenders - Chicken Popcorn - Spicy Chicken Bites -
Garlic Butter Wings - Loaded Chicken Box

**PIZZA** - Fire Chicken Pizza - BBQ Chicken Pizza - Pepperoni Pizza -
Four Cheese Pizza - Jalapeño Melt Pizza - Classic Margherita - Loaded
Chicken Pizza - Veggie Supreme

**WRAPS & ROLLS** - Crispy Chicken Wrap - Fire Chicken Roll - BBQ
Chicken Wrap - Peri Peri Wrap - Paneer Tikka Wrap - Loaded Cheese Wrap

**LOADED** - Loaded Cheese Fries - Fire Chicken Fries - Chicken Nachos -
Crispy Sharing Box - Mozzarella Sticks - Onion Rings Deluxe

**PASTA** - Chicken Alfredo - Fire Arrabbiata - Pink Sauce Chicken -
Four Cheese Pasta - Spicy Grilled Chicken Pasta - Creamy Veg Pasta

**SIDES** - Classic Fries - Peri Peri Fries - Cheese Fries - Garlic
Bread - Cheese Garlic Bread - Mozzarella Sticks - Onion Rings

**DESSERTS** - Chocolate Lava Cake - Brownie & Ice Cream - New York
Cheesecake - Chocolate Mousse - Cookie Skillet

------------------------------------------------------------------------

## 5. Brand copy

Use attractive microcopy instead of generic UI labels.

Approved direction: - COME HUNGRY. LEAVE OBSESSED. - SPICY. CRISPY.
GOOD. - PICK YOUR POISON. - BUILT TO DRIP. - CRUNCH LOUDER. - SLICE.
PULL. REPEAT. - WRAP IT. BITE IT. - SHARING IS OPTIONAL. - TWIRL
RESPONSIBLY. - SAVE ROOM. - REAL HEAT. - MELT MODE. - HOW BRAVE ARE
YOU? - STILL HUNGRY? - WE GOT MORE. - DROP A CHILLI. OR 20. - GOOD
CHOICES. - MAKE IT MINE. - LET'S EAT. - COOKING SOMETHING GOOD... - THIS
FEELS A LITTLE TOO HEALTHY. - EVERYBODY GOT HERE FIRST.

------------------------------------------------------------------------

## 6. Spice system

Create a reusable 4-level spice component:

1.  🌶 --- MILD --- A little heat
2.  🌶🌶 --- HOT --- Getting serious
3.  🌶🌶🌶 --- FIRE --- No mercy
4.  🌶🌶🌶🌶 --- NO MERCY / INSANE --- Call your mom

Selected states must animate subtly.

------------------------------------------------------------------------

# 7. Customer pages --- implement these exact page concepts

## 7.1 Register / Login

Reference: `01_auth_register_login_4k.jpg`

Split editorial layout: - food visual side - cream auth panel - WELCOME
BACK - login/register toggle - email/password - recovery/social
options - orange primary CTA

Register copy: \> LET'S GET YOU FED.

Login copy: \> WELCOME BACK. \> Your cravings missed you.

------------------------------------------------------------------------

## 7.2 Post-login entry animation

Reference: `02_login_entry_animation_storyboard_4k.jpg`

One continuous 3--4 second animation:

``` text
LOGIN SUCCESS
→ HANG TIGHT. GOOD FOOD IS ON THE WAY.
→ CHILLI / SPICE BURST
→ INGREDIENT VORTEX
→ SPICYEAT LOGO
→ LET'S EAT!
→ HOME REVEAL
```

Do not make these separate routes.

Use Framer Motion or equivalent. Respect `prefers-reduced-motion`.

------------------------------------------------------------------------

## 7.3 Home / Landing

Reference: `03_home_landing_4k.jpg`

Hero:

> SPICY. CRISPY. GOOD.

Supporting:

> Crafted for people who think one burger is never enough.

CTA:

> EXPLORE MENU

Sections: 1. Hero 2. Ingredient story 3. Signature product 4. Food
categories 5. Spice experience 6. Best sellers 7. Brand story 8. Order
CTA 9. Interactive footer

Ingredient copy:

> CHICKEN. CHEESE. CHILLI. CRUNCH.

Footer:

> DROP A CHILLI. OR 20.

------------------------------------------------------------------------

## 7.4 Explore

Reference: `04_explore_4k.jpg`

Hero:

> WHAT'S YOUR CRAVING?

Supporting:

> Pick a mood. We'll handle the hunger.

Include: - visual category rail - featured food - popular dishes - spice
selector - collections - editorial promos

Categories: BURGERS / FRIED CHICKEN / PIZZA / WRAPS & ROLLS / LOADED /
PASTA / SIDES / DESSERTS

------------------------------------------------------------------------

## 7.5 Menu

Reference: `05_menu_4k.jpg`

Hero:

> WHAT'S YOUR CRAVING?

Navigation: ALL / BURGERS / FRIED CHICKEN / PIZZA / WRAPS & ROLLS /
LOADED / PASTA / SIDES / DESSERTS

Include: - food-first cards - large editorial feature cards - smaller
supporting cards - spice filters - veg indicators - price - MAKE IT MINE
CTA

Avoid dense marketplace grids.

------------------------------------------------------------------------

## 7.6 Menu Item

Reference: `06_menu_item_4k.jpg`

Example:

# FIRE SMASH BURGER

> BUILT TO DRIP.

Include: - hero food image - gallery - description - spice level -
price - quantity - customization - add-ons - special instructions - MAKE
IT MINE - related foods

Related heading:

> YOU MIGHT ALSO CRAVE...

------------------------------------------------------------------------

## 7.7 Cart

Reference: `07_cart_4k.jpg`

Headline:

> YOUR CART. GOOD CHOICES.

Include: - item image - quantity - price - remove - customization
summary - savings - delivery progress - order summary - recommended
add-ons

CTA:

> LET'S EAT.

------------------------------------------------------------------------

## 7.8 Search

Reference: `08_search_4k.jpg`

Headline:

> FIND YOUR CRAVING.

Include: - dominant search input - recent searches - popular searches -
category shortcuts - spice filter - veg filter - price filter - sort -
results - pagination/infinite loading

Search is for food/menu items, not restaurants.

------------------------------------------------------------------------

## 7.9 Collections / Offers / Rewards

Reference: `09_collections_offers_rewards_4k.jpg`

### Collections

-   Fire Mode
-   Late Night Cravings
-   Cheese Pull
-   Chicken Lovers
-   Under ₹299
-   Best Sellers

### Offers

-   20% OFF
-   FREE DELIVERY
-   COMBO DEALS
-   FIRST ORDER
-   WEEKEND HEAT

### Rewards

Spicy Coins: - balance - progress - earning history - redeemable
rewards - milestones

Copy:

> MORE HEAT. MORE COINS.

------------------------------------------------------------------------

## 7.10 Checkout

Reference: `10_checkout_4k.jpg`

Two-column layout.

Left: - address - delivery option - contact - payment - coupon - special
instructions

Right: - order summary - items - savings - fees - total

CTA:

> PLACE ORDER

Reassurance:

> SECURE PAYMENT. ZERO DRAMA.

------------------------------------------------------------------------

## 7.11 Order Confirmed

Reference: `11_order_confirmed_4k.jpg`

Headline:

> ORDER CONFIRMED!

Supporting:

> Your cravings are officially in motion.

Show: - order ID - items - total - payment - ETA - delivery information

CTA:

> VIEW ORDER

------------------------------------------------------------------------

## 7.12 Order Details / Live Tracking

Reference: `12_order_details_tracking_4k.jpg`

Status examples: - PREPARING - ON THE WAY - ALMOST THERE

Timeline:

``` text
PLACED
→ CONFIRMED
→ PREPARING
→ READY
→ OUT FOR DELIVERY
→ DELIVERED
```

Include: - order items - total - address - payment - delivery partner -
ETA - map/live tracking - contact/help - reorder

------------------------------------------------------------------------

## 7.13 Profile

Reference: `13_profile_4k.jpg`

Headline:

> HEY, FOODIE.

Include: - profile information - Spicy Coins - favourites - order
history - addresses - payment methods - preferences - security - logout

------------------------------------------------------------------------

# 8. Admin pages

Admin is operational, not editorial.

Pages: - Admin Login - Dashboard - Orders - Menu Management -
Categories - Menu Item Management - Customers - Delivery Partners -
Offers - Rewards - Analytics - Settings

Dashboard metrics: - orders today - revenue - active orders -
preparation queue - active deliveries - customers - popular items

Order states: PLACED → CONFIRMED → PREPARING → READY → ASSIGNED → OUT
FOR DELIVERY → DELIVERED

------------------------------------------------------------------------

# 9. Delivery Partner pages

Pages: - Delivery Login - Delivery Dashboard - Available Orders - Order
Details - Active Delivery - Navigation - Delivery History - Earnings -
Profile

Dashboard copy:

> READY TO GET SPICY?

Flow: AVAILABLE → ACCEPT → NAVIGATE TO SPICYEAT → PICKED UP → NAVIGATE
TO CUSTOMER → DELIVERED

Optimize for mobile operation and fast actions.

------------------------------------------------------------------------

# 10. Global component system

Create reusable components:

``` text
Navigation
Footer
EditorialHeading
FoodCard
FeaturedFoodCard
FoodImage
SpiceIndicator
CategoryRail
PromoBanner
OfferCard
RewardCard
Button
Input
Modal
Toast
CartItem
OrderSummary
AddressCard
PaymentOption
OrderStatus
OrderTimeline
LoadingState
EmptyState
ErrorState
```

Do not duplicate page-specific versions of the same primitive.

------------------------------------------------------------------------

# 11. Animation system

Use: - page entrance transitions - image reveal masks - typography
stagger - scroll parallax - food rotation - floating chilli elements -
hover/tap interactions - cart transitions - order-status transitions -
login entry animation - interactive footer

Do not animate everything. Use motion to guide attention.

Always support reduced motion.

------------------------------------------------------------------------

# 12. Responsive rules

Explicitly design for: - 1440+ - 1280 - 1024 - 768 - 390 - 320

Desktop: - large editorial compositions - asymmetry - large food
imagery - generous whitespace

Mobile: - intentional stacking - horizontal food rails - touch-friendly
controls - compact navigation - simplified motion - sticky CTAs only
where useful

Do not merely shrink the desktop layout.

------------------------------------------------------------------------

# 13. Accessibility

Required: - semantic HTML - keyboard navigation - visible focus -
accessible labels - alt text - adequate contrast - reduced motion -
\~44px touch targets - no hover-only essential interactions

------------------------------------------------------------------------

# 14. Performance

Use: - AVIF/WebP when appropriate - responsive image sizes - lazy
loading below fold - hero preload - transform/opacity animations - avoid
layout thrashing - skeleton states - prevent layout shift - avoid
unnecessary dependencies

------------------------------------------------------------------------

# 15. State design

Every page needs: - loading state - empty state - error state - success
state - disabled state where applicable

Approved examples:

Loading: \> COOKING SOMETHING GOOD...

Empty cart: \> THIS FEELS A LITTLE TOO HEALTHY.

No results: \> NOTHING HIT THE SPOT. \> TRY SOMETHING SPICIER.

Unavailable: \> EVERYBODY GOT HERE FIRST.

Error: \> SOMETHING GOT A LITTLE TOO HOT. \> TRY AGAIN.

------------------------------------------------------------------------

# 16. Backend integration readiness

Frontend must be built for real APIs, not permanent mock data.

Expected API domains:

``` text
/auth
/users
/menu
/categories
/cart
/orders
/payments
/delivery
/offers
/rewards
/search
/favourites
/notifications
```

Use typed API clients, loading states, error handling, optimistic UI
only where safe, and clean separation between API/data state and
presentational components.

------------------------------------------------------------------------

# 17. Recommended frontend structure

``` text
frontend/
  src/
    app/
      router/
      providers/
    pages/
      customer/
      admin/
      delivery/
    components/
      layout/
      navigation/
      typography/
      buttons/
      forms/
      food/
      cart/
      checkout/
      order/
      rewards/
      offers/
      animations/
    features/
      auth/
      home/
      explore/
      search/
      menu/
      cart/
      checkout/
      orders/
      profile/
      collections/
      offers/
      rewards/
      admin/
      delivery/
    api/
    hooks/
    state/
    types/
    utils/
    animations/
    assets/
    styles/
```

Use feature-based organization and reusable primitives.

------------------------------------------------------------------------

# 18. Build order

### Phase 1

Design system + frontend foundation

### Phase 2

Register/Login + auth + login entry animation

### Phase 3

Home + Explore + Menu + Search

### Phase 4

Menu Item + Cart

### Phase 5

Checkout + Payment + Order Confirmation

### Phase 6

Order Details + Live Tracking

### Phase 7

Collections + Offers + Rewards + Profile

### Phase 8

Admin

### Phase 9

Delivery Partner

### Phase 10

Animation polish + responsive QA + accessibility + performance

Build vertically where practical so real APIs can be integrated as each
flow becomes usable.

------------------------------------------------------------------------

# 19. Non-negotiable rules

1.  No marketplace restaurants.
2.  No beverages.
3.  No Chinese category.
4.  No Zomato/Swiggy visual language.
5.  No generic template cards everywhere.
6.  No excessive borders.
7.  No excessive orange backgrounds.
8.  No copied Sunbeam assets/text/source.
9.  No screenshot-as-UI implementation.
10. Every customer page must feel like the same SpicyEat brand.
11. Food photography is a major part of the design.
12. Typography is a major visual element.
13. Motion must be polished but purposeful.
14. Mobile must be intentionally designed.
15. Do not leave lorem ipsum or generic placeholder copy in the final
    UI.

------------------------------------------------------------------------

# 20. Definition of done

The frontend is done when: - all specified pages exist - the pages
closely follow the supplied reference boards - the pages feel like one
cohesive SpicyEat experience - Sunbeam-inspired editorial thinking is
clearly visible - the UI is original - responsive behavior is
intentional - animations are polished - authentication works - customer
flows connect end-to-end - APIs are integration-ready - admin flows are
operational - delivery flows are operational - no marketplace restaurant
concept exists - no placeholder content remains - loading/error/empty
states exist - accessibility is respected - reduced-motion support
exists - performance is acceptable

## North star

If a design decision is unclear, ask:

> **Does this feel like a premium food brand experience, or another
> food-delivery dashboard?**

Always choose the premium food-brand experience.
