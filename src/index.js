import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { loadMoreBtn } from './js/loadMoreBtn';
import PictureApi from './js/pictureApi';
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'simplelightbox/dist/simple-lightbox.min.js';

var throttle = require('lodash.throttle');

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
};
const pictureApi = new PictureApi();

refs.form.addEventListener('submit', onFormSubmit);
loadMoreBtn.button.addEventListener('click', onLoadMoreClick);

function onLoadMoreClick() {
  fetchMoreData();
}

function onFormSubmit(event) {
  event.preventDefault();

  if (event.currentTarget.elements.searchQuery.value.trim() === '') {
    Notify.info('Please enter your request.');
    return;
  }
  pictureApi.searchQuery = event.currentTarget.elements.searchQuery.value;

  loadMoreBtn.hide();
  pictureApi.pageReset();
  clearMarkup();
  loadMoreBtn.show();
  loadMoreBtn.disable();
  fetchData();
  refs.form.reset();
}

function fetchData() {
  pictureApi
    .fetchData()
    .then(pictures => {
      if (pictures.data.hits.length === 0) {
        loadMoreBtn.hide();
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      } else if (
        pictures.data.hits.length < 40 &&
        pictures.data.hits.length > 0
      ) {
        loadMoreBtn.hide();
        appendPictures(pictures);
        Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
        onNoScroll();
        let scrolled = 0;
        window.document.addEventListener('scroll', onscroll);

        return;
      } else {
        window.document.removeEventListener('scroll', onscroll);
        loadMoreBtn.enable();
        Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
        appendPictures(pictures);
      }
    })
    .catch(error => error);
}

// create a variable to cancel event listener later
var onscroll = throttle(onScroll, 800);

function onScroll() {
  const userViewHeight = document.documentElement.clientHeight;
  const totalHeight = document.documentElement.scrollHeight;
  let scrolled = window.pageYOffset;
  console.log(scrolled);
  if (totalHeight - scrolled - 1 < userViewHeight) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function onNoScroll() {
  if (
    document.documentElement.clientHeight ===
    document.documentElement.scrollHeight
  ) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
  return;
}

function fetchMoreData() {
  pictureApi
    .fetchData()
    .then(pictures => {
      if (pictures.data.hits.length < 40 && pictures.data.hits.length > 0) {
        loadMoreBtn.hide();
        appendPictures(pictures);
        let scrolled = 0;
        window.document.addEventListener('scroll', onscroll);
        return;
      }
      loadMoreBtn.enable();
      appendPictures(pictures);
    })
    .catch(error => error);
}

function appendPictures({ data: { hits } }) {
  const markupPictures = hits.reduce((markup, picture) => {
    return createMarkup(picture) + markup;
  }, '');

  refs.gallery.insertAdjacentHTML('beforeend', markupPictures);
  lightbox.refresh();
}

function createMarkup({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return ` <div class="photo-card">
     <div class="picture-container"> <a class="gallery__item" href=${largeImageURL}><img class="gallery__image" src=${webformatURL} alt=""  loading="lazy" /></a></div>
      <div class="info">
        <p class="info-item">
          <b>Likes ${likes}</b>
        </p>
        <p class="info-item">
          <b>Views ${views}</b>
        </p>
        <p class="info-item">
          <b>Comments ${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads ${downloads}</b>
        </p>
      </div>
    </div>`;
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

var lightbox = new SimpleLightbox('.gallery a', {});
