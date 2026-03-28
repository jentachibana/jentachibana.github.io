document.addEventListener("DOMContentLoaded", function () {
  // View toggle (recipes / out on the town)
  var viewToggles = document.querySelectorAll(".view-toggle");
  var viewPanels = document.querySelectorAll("[data-view-panel]");

  // Recipe gallery elements
  var detailInline = document.getElementById("recipe-detail-inline");
  var recipeGalleryCards = document.querySelectorAll(".recipe-gallery-card");
  var details = document.querySelectorAll("#recipe-detail-inline .recipe-detail");
  var recipeGrid = document.querySelector(".recipe-grid");
  var activeCardSlug = null;

  // Gallery / expanded view toggle
  var galleryView = document.querySelector(".cooking-recipes-view");
  var expandedView = document.querySelector(".expanded-recipes-view");
  var expandedCards = document.querySelectorAll(".expanded-recipe-card");
  var modeBtns = document.querySelectorAll(".recipe-mode-btn");

  modeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      modeBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var mode = btn.dataset.mode;

      if (mode === "gallery") {
        if (galleryView) galleryView.hidden = false;
        if (expandedView) expandedView.hidden = true;
        closeRecipeDetail();
      } else {
        if (galleryView) galleryView.hidden = true;
        if (expandedView) { expandedView.hidden = false; fadeIn(expandedView); }
        closeRecipeDetail();
      }
    });
  });

  // Shuffle recipe grid on page load
  if (recipeGrid) {
    var cards = Array.from(recipeGrid.children);
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      recipeGrid.appendChild(cards[j]);
      cards.splice(j, 1, cards[i]);
    }
  }

  viewToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var view = this.dataset.view;
      viewToggles.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");

      viewPanels.forEach(function (p) {
        p.hidden = p.dataset.viewPanel !== view;
      });

      if (view === "recipes") {
        closeRecipeDetail();
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
    void el.offsetWidth;
    el.classList.add("cooking-fade-in");
  }

  // Close recipe detail and restore card in grid
  function closeRecipeDetail() {
    if (detailInline) detailInline.hidden = true;
    details.forEach(function (d) { d.hidden = true; });
    if (activeCardSlug) {
      var card = document.querySelector('.recipe-gallery-card[data-recipe="' + activeCardSlug + '"]');
      if (card) card.classList.remove("hidden-active");
      activeCardSlug = null;
    }
  }

  // Get the number of grid columns from the computed style
  function getGridColumns() {
    if (!recipeGrid) return 3;
    // Temporarily remove the detail from the grid so it doesn't affect column count
    var detailWasInGrid = detailInline && detailInline.parentNode === recipeGrid;
    if (detailWasInGrid) detailInline.hidden = true;
    var style = getComputedStyle(recipeGrid);
    var cols = style.gridTemplateColumns.split(" ").length;
    if (detailWasInGrid) detailInline.hidden = false;
    return cols;
  }

  // Show recipe detail inline
  function showRecipeDetail(slug, clickedCard) {
    // Restore previously hidden card first
    if (activeCardSlug && activeCardSlug !== slug) {
      var prevCard = document.querySelector('.recipe-gallery-card[data-recipe="' + activeCardSlug + '"]');
      if (prevCard) prevCard.classList.remove("hidden-active");
    }

    // Hide detail temporarily so it doesn't interfere with position calculations
    if (detailInline) detailInline.hidden = true;

    // Get visible cards in current DOM order (before hiding clicked card)
    var visibleCards = Array.from(recipeGrid.querySelectorAll(".recipe-gallery-card")).filter(function (c) {
      return !c.classList.contains("filtered-out") && !c.classList.contains("hidden-active");
    });

    var cols = getGridColumns();
    var clickedPos = visibleCards.indexOf(clickedCard);

    // After removing the clicked card, we want complete rows above the detail.
    // Cards before clicked: clickedPos cards. Round down to nearest multiple of cols.
    var cardsBefore = Math.floor(clickedPos / cols) * cols;

    activeCardSlug = slug;

    // Hide clicked card from grid
    if (clickedCard) clickedCard.classList.add("hidden-active");

    // Insert detail into the grid after the last card of the complete row block
    if (recipeGrid && detailInline) {
      if (cardsBefore === 0) {
        recipeGrid.prepend(detailInline);
      } else {
        // visibleCards[cardsBefore - 1] is the last card completing the rows above
        visibleCards[cardsBefore - 1].after(detailInline);
      }
    }

    // Show detail hidden first to measure position, then scroll, then fade in
    details.forEach(function (d) { d.hidden = d.id !== "recipe-" + slug; });
    if (detailInline) {
      detailInline.hidden = false;
      fadeIn(detailInline);
    }
  }

  // Recipe gallery card clicks
  recipeGalleryCards.forEach(function (card) {
    card.addEventListener("click", function () {
      showRecipeDetail(card.dataset.recipe, card);
    });
  });

  // Recipe close buttons
  document.querySelectorAll(".recipe-close").forEach(function (btn) {
    btn.addEventListener("click", closeRecipeDetail);
  });

  // Recipe cuisine pill filters
  var recipePills = document.querySelectorAll(".cooking-recipes-header .category-pill");

  function applyFilter(filterValue) {
    recipeGalleryCards.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
    expandedCards.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
  }

  recipePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      recipePills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      applyFilter(pill.dataset.value);
      closeRecipeDetail();
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
