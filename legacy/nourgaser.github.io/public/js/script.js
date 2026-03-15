var swiper = new Swiper(".projectsSwiper", {
  effect: "coverflow",
  grabCursor: false,
  keyboard: true,
  centeredSlides: true,
  slidesPerView: "auto",
  // initialSlide: 1,
  hashNavigation: true,
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
});

var lazyLoadInstance = new LazyLoad({});

if (lazyLoadInstance) {
  lazyLoadInstance.update();
}



