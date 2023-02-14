export default loadMoreBtn = {
  button: document.querySelector('.load-more'),


    hide() {
        this.button.classList.add("is-hidden")
    },

    show() {
      this.button.classList.remove('is-hidden')  
  },
    
  enable() {
    this.button.textContent = 'Load more';
    this.button.disabled = false;
  },
  disable() {
    this.button.textContent = 'wait...';
    this.button.disabled = true;
  }
}