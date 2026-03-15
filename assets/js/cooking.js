document.addEventListener("DOMContentLoaded", function () {
  // View toggle (recipes / out on the town)
  var viewToggles = document.querySelectorAll(".view-toggle");
  var viewPanels = document.querySelectorAll("[data-view-panel]");

  // Recipe gallery elements
  var recipesView = document.querySelector(".cooking-recipes-view");
  var browseNav = document.querySelector(".cooking-browse-nav");
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
        showRestaurantGrid();
      }
    });
  });

  // Show recipe gallery (default recipes view)
  function showRecipeGallery() {
    if (recipesView) recipesView.hidden = false;
    if (browseNav) browseNav.hidden = false;
    details.forEach(function (d) { d.hidden = true; });
  }

  // Show recipe detail
  function showRecipeDetail(slug) {
    if (recipesView) recipesView.hidden = true;
    if (browseNav) browseNav.hidden = true;
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

  // Dropdown toggle behavior
  var dropdownBtns = document.querySelectorAll(".cooking-nav-btn");
  dropdownBtns.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var menu = btn.nextElementSibling;
      var wasOpen = !menu.hidden;

      // Close all dropdowns first
      document.querySelectorAll(".cooking-dropdown-menu").forEach(function (m) {
        m.hidden = true;
      });
      dropdownBtns.forEach(function (b) { b.classList.remove("open"); });

      if (!wasOpen) {
        menu.hidden = false;
        btn.classList.add("open");
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener("click", function () {
    document.querySelectorAll(".cooking-dropdown-menu").forEach(function (m) {
      m.hidden = true;
    });
    dropdownBtns.forEach(function (b) { b.classList.remove("open"); });
  });

  // Restaurant gallery elements
  var restaurantsView = document.querySelector(".cooking-restaurants-view");
  var restaurantBrowseNavs = document.querySelectorAll('.cooking-browse-nav[data-view-panel="restaurants"]');
  var restaurantDetails = document.querySelectorAll(".restaurant-detail");
  var restaurantCardElements = document.querySelectorAll(".restaurant-card");

  function showRestaurant(slug) {
    if (restaurantsView) restaurantsView.hidden = true;
    restaurantBrowseNavs.forEach(function (n) { n.hidden = true; });
    restaurantDetails.forEach(function (d) {
      d.hidden = d.id !== "restaurant-" + slug;
    });
  }

  function showRestaurantGrid() {
    if (restaurantsView) restaurantsView.hidden = false;
    restaurantBrowseNavs.forEach(function (n) { n.hidden = false; });
    restaurantDetails.forEach(function (d) {
      d.hidden = true;
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

  // Price filter via dropdown
  document.querySelectorAll("[data-price-link]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var price = link.dataset.priceLink;
      restaurantCardElements.forEach(function (card) {
        card.classList.toggle("filtered-out", card.dataset.price !== price);
      });
      // Close dropdown
      document.querySelectorAll(".cooking-dropdown-menu").forEach(function (m) {
        m.hidden = true;
      });
      dropdownBtns.forEach(function (b) { b.classList.remove("open"); });
    });
  });
});
