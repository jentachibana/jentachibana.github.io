document.addEventListener("DOMContentLoaded", function () {
  // View toggle (recipes / out on the town)
  var viewToggles = document.querySelectorAll(".view-toggle");
  var viewPanels = document.querySelectorAll("[data-view-panel]");

  // Recipe gallery elements
  var recipesView = document.querySelector(".cooking-recipes-view");
  var recipeDetailsContainer = document.querySelector(".cooking-recipe-details");
  var recipeGalleryCards = document.querySelectorAll(".recipe-gallery-card");
  var details = document.querySelectorAll(".recipe-detail");

  viewToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var view = this.dataset.view;
      viewToggles.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");

      viewPanels.forEach(function (p) {
        p.hidden = p.dataset.viewPanel !== view;
      });

      if (view === "recipes") {
        showRecipeGallery();
      }
      if (view === "restaurants") {
        cuisinePills.forEach(function (p) { p.classList.remove("active"); });
        var allPill = document.querySelector('.cuisine-pill[data-value="all"]');
        if (allPill) allPill.classList.add("active");
        applyCuisineFilter("all");
        showRestaurantGrid();
      }
    });
  });

  function fadeIn(el) {
    if (!el) return;
    el.classList.remove("cooking-fade-in");
    void el.offsetWidth; // reflow to restart animation
    el.classList.add("cooking-fade-in");
  }

  // Show recipe gallery (default recipes view)
  function showRecipeGallery() {
    if (recipesView) { recipesView.hidden = false; fadeIn(recipesView); }
    if (recipeDetailsContainer) recipeDetailsContainer.hidden = true;
    details.forEach(function (d) { d.hidden = true; });
  }

  // Show recipe detail
  function showRecipeDetail(slug) {
    if (recipesView) recipesView.hidden = true;
    if (recipeDetailsContainer) { recipeDetailsContainer.hidden = false; fadeIn(recipeDetailsContainer); }
    details.forEach(function (d) {
      d.hidden = d.id !== "recipe-" + slug;
    });
  }

  // Recipe gallery card clicks
  recipeGalleryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      showRecipeDetail(card.dataset.recipe);
    });
  });

  // Recipe close buttons
  document.querySelectorAll(".recipe-close").forEach(function (btn) {
    btn.addEventListener("click", showRecipeGallery);
  });

  // Recipe cuisine pill filters
  var recipePills = document.querySelectorAll(".cooking-recipes-header .category-pill");

  function applyFilter(filterValue) {
    recipeGalleryCards.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
  }

  recipePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      recipePills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      applyFilter(pill.dataset.value);
      showRecipeGallery();
    });
  });

  // Apply initial filter from the default active pill
  var activePill = document.querySelector(".cooking-recipes-header .category-pill.active");
  if (activePill) applyFilter(activePill.dataset.value);

  // Restaurant gallery elements
  var restaurantsView = document.querySelector(".cooking-restaurants-view");
  var restaurantDetailsContainer = document.querySelector(".cooking-restaurant-details");
  var restaurantDetails = document.querySelectorAll(".restaurant-detail");
  var restaurantCardElements = document.querySelectorAll(".restaurant-card");

  function showRestaurantGrid() {
    if (restaurantsView) { restaurantsView.hidden = false; fadeIn(restaurantsView); }
    if (restaurantDetailsContainer) restaurantDetailsContainer.hidden = true;
    restaurantDetails.forEach(function (d) { d.hidden = true; });
  }

  function showRestaurant(slug) {
    if (restaurantsView) restaurantsView.hidden = true;
    if (restaurantDetailsContainer) { restaurantDetailsContainer.hidden = false; fadeIn(restaurantDetailsContainer); }
    restaurantDetails.forEach(function (d) {
      d.hidden = d.id !== "restaurant-" + slug;
    });
  }

  restaurantCardElements.forEach(function (card) {
    card.addEventListener("click", function () {
      showRestaurant(card.dataset.restaurant);
    });
  });

  document.querySelectorAll(".restaurant-close").forEach(function (btn) {
    btn.addEventListener("click", showRestaurantGrid);
  });

  // Cuisine pill filters
  var cuisinePills = document.querySelectorAll(".cuisine-pill");

  function applyCuisineFilter(filterValue) {
    restaurantCardElements.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
  }

  cuisinePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      cuisinePills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      applyCuisineFilter(pill.dataset.value);
      showRestaurantGrid();
    });
  });

  var activeCuisinePill = document.querySelector(".cuisine-pill.active");
  if (activeCuisinePill) applyCuisineFilter(activeCuisinePill.dataset.value);

});
