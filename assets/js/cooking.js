document.addEventListener("DOMContentLoaded", function () {
  var grid = document.querySelector(".photo-grid");
  var details = document.querySelectorAll(".recipe-detail");
  var cards = document.querySelectorAll(".photo-card");
  var links = document.querySelectorAll(".recipe-link");

  // View toggle (recipes / out on the town)
  var viewToggles = document.querySelectorAll(".view-toggle");
  var viewPanels = document.querySelectorAll(".cooking-view");
  var mainPanels = document.querySelectorAll(".cooking-main-view");

  viewToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var view = this.dataset.view;
      viewToggles.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");
      viewPanels.forEach(function (p) { p.hidden = p.dataset.viewPanel !== view; });
      mainPanels.forEach(function (p) { p.hidden = p.dataset.mainPanel !== view; });
      if (view === "recipes") { showGrid(); }
      if (view === "restaurants") { showRestaurantGrid(); }
    });
  });

  function showRecipe(slug) {
    grid.hidden = true;
    details.forEach(function (d) {
      d.hidden = d.id !== "recipe-" + slug;
    });
    links.forEach(function (l) {
      l.classList.toggle("active", l.dataset.recipe === slug);
    });
  }

  function showGrid() {
    grid.hidden = false;
    details.forEach(function (d) {
      d.hidden = true;
    });
    links.forEach(function (l) {
      l.classList.remove("active");
    });
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      showRecipe(card.dataset.recipe);
    });
  });

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showRecipe(link.dataset.recipe);
    });
  });

  document.querySelectorAll(".recipe-close").forEach(function (btn) {
    btn.addEventListener("click", showGrid);
  });

  // Ingredient group toggles
  document.querySelectorAll(".ingredient-group-toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      var items = toggle.nextElementSibling;
      toggle.setAttribute("aria-expanded", !expanded);
      items.hidden = expanded;
    });
  });

  // Ingredient filtering
  var activeIngredients = [];
  var recipeItems = document.querySelectorAll(".recipe-list li");
  var ingredientTags = document.querySelectorAll(".ingredient-tag");

  function applyFilter() {
    if (activeIngredients.length === 0) {
      recipeItems.forEach(function (li) { li.classList.remove("filtered-out"); });
      cards.forEach(function (c) { c.classList.remove("filtered-out"); });
      return;
    }

    recipeItems.forEach(function (li) {
      var ingredients = (li.dataset.ingredients || "").split(",");
      var match = activeIngredients.every(function (ing) {
        return ingredients.indexOf(ing) !== -1;
      });
      li.classList.toggle("filtered-out", !match);
    });

    cards.forEach(function (card) {
      var ingredients = (card.dataset.ingredients || "").split(",");
      var match = activeIngredients.every(function (ing) {
        return ingredients.indexOf(ing) !== -1;
      });
      card.classList.toggle("filtered-out", !match);
    });
  }

  function updateGroupCounts() {
    document.querySelectorAll(".ingredient-group-count").forEach(function (span) {
      var group = span.closest(".ingredient-group");
      var count = group.querySelectorAll(".ingredient-tag.active").length;
      span.textContent = count > 0 ? "(" + count + ")" : "";
    });
  }

  ingredientTags.forEach(function (tag) {
    tag.addEventListener("click", function () {
      var ing = tag.dataset.ingredient;
      var idx = activeIngredients.indexOf(ing);
      if (idx === -1) {
        activeIngredients.push(ing);
        tag.classList.add("active");
      } else {
        activeIngredients.splice(idx, 1);
        tag.classList.remove("active");
      }
      applyFilter();
      updateGroupCounts();
    });
  });

  // Restaurant detail view
  var restaurantGrid = document.querySelector(".restaurant-grid");
  var restaurantDetails = document.querySelectorAll(".restaurant-detail");
  var restaurantCardElements = document.querySelectorAll(".restaurant-card");
  var restaurantLinks = document.querySelectorAll(".restaurant-link");

  function showRestaurant(slug) {
    if (restaurantGrid) restaurantGrid.hidden = true;
    restaurantDetails.forEach(function (d) {
      d.hidden = d.id !== "restaurant-" + slug;
    });
    restaurantLinks.forEach(function (l) {
      l.classList.toggle("active", l.dataset.restaurant === slug);
    });
  }

  function showRestaurantGrid() {
    if (restaurantGrid) restaurantGrid.hidden = false;
    restaurantDetails.forEach(function (d) {
      d.hidden = true;
    });
    restaurantLinks.forEach(function (l) {
      l.classList.remove("active");
    });
  }

  restaurantCardElements.forEach(function (card) {
    card.addEventListener("click", function () {
      showRestaurant(card.dataset.restaurant);
    });
  });

  restaurantLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      showRestaurant(link.dataset.restaurant);
    });
  });

  document.querySelectorAll(".restaurant-close").forEach(function (btn) {
    btn.addEventListener("click", showRestaurantGrid);
  });

  // Cuisine filtering
  var activeCuisines = [];
  var restaurantItems = document.querySelectorAll(".restaurant-list li");
  var restaurantCards = document.querySelectorAll(".restaurant-card");
  var cuisineTags = document.querySelectorAll(".cuisine-tag");

  function applyCuisineFilter() {
    if (activeCuisines.length === 0) {
      restaurantItems.forEach(function (li) { li.classList.remove("filtered-out"); });
      restaurantCards.forEach(function (c) { c.classList.remove("filtered-out"); });
      return;
    }

    restaurantItems.forEach(function (li) {
      var cuisine = li.dataset.cuisine;
      var match = activeCuisines.indexOf(cuisine) !== -1;
      li.classList.toggle("filtered-out", !match);
    });

    restaurantCards.forEach(function (card) {
      var cuisine = card.dataset.cuisine;
      var match = activeCuisines.indexOf(cuisine) !== -1;
      card.classList.toggle("filtered-out", !match);
    });
  }

  cuisineTags.forEach(function (tag) {
    tag.addEventListener("click", function () {
      var cuisine = tag.dataset.cuisine;
      var idx = activeCuisines.indexOf(cuisine);
      if (idx === -1) {
        activeCuisines.push(cuisine);
        tag.classList.add("active");
      } else {
        activeCuisines.splice(idx, 1);
        tag.classList.remove("active");
      }
      applyCuisineFilter();
    });
  });
});
