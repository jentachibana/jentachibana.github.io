document.addEventListener("DOMContentLoaded", function () {
  var toggles = document.querySelectorAll(".movement-toggle");
  var cards = document.querySelectorAll(".movement-card");
  var danceSubnav = document.querySelector(".dance-subnav");
  var danceToggle = document.querySelector('[data-activity="dance"]');

  function setActive(button) {
    toggles.forEach(function (t) {
      t.classList.remove("active");
    });
    button.classList.add("active");
  }

  function filterCards(activity) {
    cards.forEach(function (card) {
      var cardActivity = card.dataset.activity;
      var cardParent = card.dataset.parent;

      if (activity === "all") {
        card.classList.remove("filtered-out");
      } else if (activity === "dance") {
        if (cardParent === "dance") {
          card.classList.remove("filtered-out");
        } else {
          card.classList.add("filtered-out");
        }
      } else {
        if (cardActivity === activity) {
          card.classList.remove("filtered-out");
        } else {
          card.classList.add("filtered-out");
        }
      }
    });
  }

  function showDanceSubnav() {
    danceSubnav.hidden = false;
  }

  function hideDanceSubnav() {
    danceSubnav.hidden = true;
    danceSubnav.querySelectorAll(".movement-toggle").forEach(function (t) {
      t.classList.remove("active");
    });
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var activity = this.dataset.activity;

      if (activity === "dance") {
        if (danceSubnav.hidden) {
          showDanceSubnav();
          setActive(this);
          danceToggle.classList.add("active");
          filterCards("dance");
        } else if (this.classList.contains("active")) {
          hideDanceSubnav();
          var allToggle = document.querySelector('[data-activity="all"]');
          setActive(allToggle);
          filterCards("all");
        } else {
          setActive(this);
          danceToggle.classList.add("active");
          filterCards("dance");
        }
        return;
      }

      if (this.classList.contains("sub")) {
        setActive(this);
        danceToggle.classList.add("active");
        filterCards(activity);
        return;
      }

      hideDanceSubnav();
      setActive(this);
      filterCards(activity);
    });
  });
});
