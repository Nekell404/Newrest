(function($) {
  "use strict";

  new WOW().init();

  $(window).scroll(function() {
    if ($(this).scrollTop() > 45) {
      $('.navbar').addClass('bg-dark');
      $('.navbar-brand').addClass('text-primary-gradient');
      $('.btn-get-started').addClass('btn-primary-gradient');
    } else {
      $('.navbar').removeClass('bg-dark');
      $('.navbar-brand').removeClass('text-primary-gradient');
      $('.btn-get-started').removeClass('btn-primary-gradient');
    }
  });

  $(".navbar-nav a").on('click', function(event) {
    if (this.hash !== "") {
      event.preventDefault();

      $('html, body').animate({
        scrollTop: $(this.hash).offset().top - 45
      }, 1500, 'easeInOutExpo');

      if ($(this).parents('.navbar-nav').length) {
        $('.navbar-nav .active').removeClass('active');
        $(this).closest('a').addClass('active');
      }
    }
  });

  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.btn-back-to-top').fadeIn('slow');
    } else {
      $('.btn-back-to-top').fadeOut('slow');
    }
  });

  $('.back-to-top').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });

})(jQuery);