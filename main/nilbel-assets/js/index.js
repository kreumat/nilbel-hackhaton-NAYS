$(document).ready(function () {
  //$('header').addClass('type-2');
  $(window).scroll(function () {
    if ($(window).scrollTop() > 60) {
      $("header").removeClass("type-2");
    } else {
      //$('header').addClass('type-2');
    }
  });

  $(".tabular.menu .item").tab();

  // Headline Search
  /*$('#search').keyup(function () {
    if (this.value.length > 0) {
      $('#headline .search-results').addClass('active');
      setTimeout(function () {
        $('#headline .search-results .tab').removeClass('loading');
      }, 11500);
    } else {
      $('#headline .search-results').removeClass('active');
    }
  });*/

  //   $('#search').blur(function () {
  //     $('#headline .search-results').removeClass('active');
  //   });

  /*
  
  
  // Slider
  $("#headline .slider").slick({
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 6,
    slidesToScroll: 2,
    prevArrow: '<i class="angle left icon"></i>',
    nextArrow: '<i class="angle right icon"></i>',
    autoPlay: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  });
  */
});
