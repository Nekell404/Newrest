window.addEventListener('beforeunload', () => {
  localStorage.setItem('scrollPosition', window.scrollY.toString());
});

window.addEventListener('load', () => {
  const scrollPosition = localStorage.getItem('scrollPosition');
  if (scrollPosition) {
    window.scrollTo(0, parseInt(scrollPosition));
  }
});