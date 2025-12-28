$(document).ready(function () {
  // Headline Search
  $("#header-search").click(function () {
    $("header").removeClass("type-2");
    $("#search-modal").modal("show");
  });

  // Modal Search İnput
  /*$("#modal-search-input")[0].addEventListener("input", function () {
    if (this.value.length > 0) {
      $("#search-modal .search-results").addClass("active");
      $("#search-modal .popular-words").addClass("hide");
    } else {
      $("#search-modal .search-results").removeClass("active");
      $("#search-modal .popular-words").removeClass("hide");
    }
  });*/

  $(".ui.accordion").accordion();

  // Mobile Navbar
  $(".target-burger").click(function () {
    $(this).toggleClass("toggled");
    $(".mobile-navbar .main-nav").toggleClass("toggled");
  });
  $(".ui.dropdown").dropdown();

  if ($("[data-lightbox='gallery']").length > 0) {
    lightbox.option({
      alwaysShowNavOnTouchDevices: true,
      disableScrolling: true,
      wrapAround: true,
    });
  }
});
