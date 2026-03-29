document.addEventListener("DOMContentLoaded", function () {
  // Sticky header: visible while sticky, hides after scrolling past bar height
  var topBar = document.querySelector(".cooking-top-bar");
  if (topBar) {
    var barHeight = topBar.offsetHeight;
    var lastScrollY = 0;
    window.addEventListener("scroll", function () {
      var currentY = window.scrollY;
      if (currentY > barHeight) {
        topBar.classList.add("bar-hidden");
      } else {
        topBar.classList.remove("bar-hidden");
      }
      lastScrollY = currentY;
    });
  }

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

  // Set theme based on active view
  var cookingEl = document.querySelector(".cooking");
  function setViewTheme(view) {
    if (!cookingEl) return;
    cookingEl.classList.remove("theme-olive", "theme-navy", "theme-rust", "theme-plum", "theme-charcoal");
    if (view === "recipes") cookingEl.classList.add("theme-olive");
    if (view === "restaurants") cookingEl.classList.add("theme-rust");
  }
  setViewTheme("recipes");

  viewToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var view = this.dataset.view;
      viewToggles.forEach(function (t) { t.classList.remove("active"); });
      this.classList.add("active");
      setViewTheme(view);

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

  // Two-tier recipe filters: top-level (all/cuisine/type) + sub-filters
  var topFilterBtns = document.querySelectorAll(".top-filter-btn");
  var subFilterRows = document.querySelectorAll(".cooking-sub-filters");

  function applyFilter(filterType, filterValue) {
    recipeGalleryCards.forEach(function (card) {
      if (!filterType || filterValue === "all") {
        card.classList.remove("filtered-out");
      } else {
        card.classList.toggle("filtered-out", card.dataset[filterType] !== filterValue);
      }
    });
    expandedCards.forEach(function (card) {
      if (!filterType || filterValue === "all") {
        card.classList.remove("filtered-out");
      } else {
        card.classList.toggle("filtered-out", card.dataset[filterType] !== filterValue);
      }
    });
  }

  topFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      topFilterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var category = btn.dataset.category;

      subFilterRows.forEach(function (row) {
        row.hidden = true;
        row.querySelectorAll(".category-pill").forEach(function (p) { p.classList.remove("active"); });
      });

      if (category !== "all") {
        var targetRow = document.querySelector('.cooking-sub-filters[data-sub="' + category + '"]');
        if (targetRow) targetRow.hidden = false;
      }

      applyFilter(null, "all");
      closeRecipeDetail();
    });
  });

  subFilterRows.forEach(function (row) {
    var pills = row.querySelectorAll(".category-pill");
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.classList.remove("active"); });
        pill.classList.add("active");
        applyFilter(pill.dataset.filter, pill.dataset.value);
        closeRecipeDetail();
      });
    });
  });

  // Restaurant gallery elements
  var restaurantsView = document.querySelector(".cooking-restaurants-view");
  var expandedRestaurantsView = document.querySelector(".expanded-restaurants-view");
  var expandedRestaurantCards = document.querySelectorAll(".expanded-restaurant-card");
  var restaurantCardElements = document.querySelectorAll(".restaurant-card");
  var restaurantGrid = document.querySelector(".restaurant-grid");
  var restaurantDetailInline = document.getElementById("restaurant-detail-inline");
  var restaurantDetails = document.querySelectorAll("#restaurant-detail-inline .recipe-detail");
  var activeRestaurantSlug = null;

  // Restaurant gallery/expanded toggle
  var restaurantModeBtns = document.querySelectorAll(".restaurant-mode-btn");

  restaurantModeBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      restaurantModeBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var mode = btn.dataset.mode;

      if (mode === "gallery") {
        if (restaurantsView) restaurantsView.hidden = false;
        if (expandedRestaurantsView) expandedRestaurantsView.hidden = true;
        closeRestaurantDetail();
      } else {
        if (restaurantsView) restaurantsView.hidden = true;
        if (expandedRestaurantsView) {
          expandedRestaurantsView.hidden = false;
          fadeIn(expandedRestaurantsView);
          setTimeout(function () {
            expandedRestaurantsView.querySelectorAll(".restaurant-gallery").forEach(function (g) {
              if (g._slideToIndex) g._slideToIndex(g._currentIndex());
            });
          }, 50);
        }
        closeRestaurantDetail();
      }
    });
  });

  function getRestaurantGridColumns() {
    if (!restaurantGrid) return 3;
    var detailWasInGrid = restaurantDetailInline && restaurantDetailInline.parentNode === restaurantGrid;
    if (detailWasInGrid) restaurantDetailInline.hidden = true;
    var style = getComputedStyle(restaurantGrid);
    var cols = style.gridTemplateColumns.split(" ").length;
    if (detailWasInGrid) restaurantDetailInline.hidden = false;
    return cols;
  }

  function closeRestaurantDetail() {
    if (restaurantDetailInline) restaurantDetailInline.hidden = true;
    restaurantDetails.forEach(function (d) { d.hidden = true; });
    if (activeRestaurantSlug) {
      var card = document.querySelector('.restaurant-card[data-restaurant="' + activeRestaurantSlug + '"]');
      if (card) card.classList.remove("hidden-active");
      activeRestaurantSlug = null;
    }
  }

  function showRestaurantDetail(slug, clickedCard) {
    if (activeRestaurantSlug && activeRestaurantSlug !== slug) {
      var prevCard = document.querySelector('.restaurant-card[data-restaurant="' + activeRestaurantSlug + '"]');
      if (prevCard) prevCard.classList.remove("hidden-active");
    }

    if (restaurantDetailInline) restaurantDetailInline.hidden = true;

    var visibleCards = Array.from(restaurantGrid.querySelectorAll(".restaurant-card")).filter(function (c) {
      return !c.classList.contains("filtered-out") && !c.classList.contains("hidden-active");
    });

    var cols = getRestaurantGridColumns();
    var clickedPos = visibleCards.indexOf(clickedCard);
    var cardsBefore = Math.floor(clickedPos / cols) * cols;

    activeRestaurantSlug = slug;

    if (clickedCard) clickedCard.classList.add("hidden-active");

    if (restaurantGrid && restaurantDetailInline) {
      if (cardsBefore === 0) {
        restaurantGrid.prepend(restaurantDetailInline);
      } else {
        visibleCards[cardsBefore - 1].after(restaurantDetailInline);
      }
    }

    restaurantDetails.forEach(function (d) { d.hidden = d.id !== "restaurant-" + slug; });
    if (restaurantDetailInline) {
      restaurantDetailInline.hidden = false;
      fadeIn(restaurantDetailInline);

      // Initialize gallery slideshow once visible
      setTimeout(function () {
        var detail = document.getElementById("restaurant-" + slug);
        if (detail) {
          detail.querySelectorAll(".restaurant-gallery").forEach(function (g) {
            if (g._slideToIndex) g._slideToIndex(g._currentIndex());
          });
        }
      }, 50);
    }
  }

  restaurantCardElements.forEach(function (card) {
    card.addEventListener("click", function () {
      showRestaurantDetail(card.dataset.restaurant, card);
    });
  });

  document.querySelectorAll(".restaurant-close").forEach(function (btn) {
    btn.addEventListener("click", closeRestaurantDetail);
  });

  // Cuisine pill filters
  var cuisinePills = document.querySelectorAll(".cuisine-pill");

  function applyCuisineFilter(filterValue) {
    restaurantCardElements.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
    expandedRestaurantCards.forEach(function (card) {
      var match = filterValue === "all" || card.dataset.cuisine === filterValue;
      card.classList.toggle("filtered-out", !match);
    });
  }

  cuisinePills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      cuisinePills.forEach(function (p) { p.classList.remove("active"); });
      pill.classList.add("active");
      applyCuisineFilter(pill.dataset.value);
      closeRestaurantDetail();
    });
  });

  var activeCuisinePill = document.querySelector(".cuisine-pill.active");
  if (activeCuisinePill) applyCuisineFilter(activeCuisinePill.dataset.value);

  // Restaurant photo gallery carousel (skip on mobile — uses stacked layout)
  if (!window.matchMedia("(max-width: 768px)").matches) {
  document.querySelectorAll(".restaurant-gallery").forEach(function (gallery) {
    var imgs = Array.from(gallery.querySelectorAll("img"));
    if (imgs.length === 0) return;

    var wrapper = gallery.closest(".restaurant-gallery-wrapper");
    var totalOriginal = imgs.length;
    if (totalOriginal === 0) return;

    // Clone images enough times to fill both sides for infinite scroll
    var cloneSets = 3;
    for (var c = 0; c < cloneSets; c++) {
      imgs.forEach(function (img) {
        var clone = img.cloneNode(true);
        gallery.appendChild(clone);
      });
    }
    // Also prepend clones
    for (var c = 0; c < cloneSets; c++) {
      for (var j = totalOriginal - 1; j >= 0; j--) {
        var clone = imgs[j].cloneNode(true);
        gallery.insertBefore(clone, gallery.firstChild);
      }
    }

    var allImgs = Array.from(gallery.querySelectorAll("img"));
    // The originals start at index (cloneSets * totalOriginal)
    var centerOffset = cloneSets * totalOriginal;
    var currentIndex = centerOffset; // start on first original image

    function slideToIndex(idx, animate) {
      currentIndex = idx;
      allImgs.forEach(function (img) { img.classList.remove("focused"); });
      allImgs[currentIndex].classList.add("focused");

      var wrapperWidth = wrapper ? wrapper.offsetWidth : gallery.parentElement.offsetWidth;
      var imgEl = allImgs[0];
      var imgWidth = imgEl.offsetWidth;
      var gap = parseFloat(getComputedStyle(gallery).gap) || 12;
      var focusedLeft = currentIndex * (imgWidth + gap);
      var offset = (wrapperWidth / 2) - (imgWidth / 2) - focusedLeft;

      if (animate === false) {
        gallery.style.transition = "none";
        gallery.style.transform = "translateX(" + offset + "px)";
        void gallery.offsetWidth;
        gallery.style.transition = "";
      } else {
        gallery.style.transform = "translateX(" + offset + "px)";
      }

      // After transition, silently reset to center range if near edges
      if (animate !== false) {
        setTimeout(function () {
          var posInOriginal = currentIndex % totalOriginal;
          var centerEquivalent = centerOffset + posInOriginal;
          if (currentIndex !== centerEquivalent) {
            slideToIndex(centerEquivalent, false);
          }
        }, 1100);
      }
    }

    // Click on any image to focus it
    allImgs.forEach(function (img, i) {
      img.addEventListener("click", function () {
        slideToIndex(i);
      });
    });

    // Store slideToIndex on the gallery element so we can call it when detail opens
    gallery._slideToIndex = slideToIndex;
    gallery._currentIndex = function () { return currentIndex; };
  });
  } // end mobile check

});
