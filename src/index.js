import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
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

function onFormSubmit(event) {
  event.preventDefault();

  if (event.currentTarget.elements.searchQuery.value.trim() === '') {
    Notify.info('Please enter your request.');
    return;
  }

  pictureApi.searchQuery = event.currentTarget.elements.searchQuery.value;

  pictureApi.pageReset();
  clearMarkup();
  fetchData();
  refs.form.reset();
}

async function fetchData() {
  pictureApi
    .fetchData()
    .then(pictures => {
      window.document.removeEventListener('scroll', onscroll);
      window.document.removeEventListener('scroll', infScroll);
      if (pictures.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      } else if (
        pictures.data.hits.length < 40 &&
        pictures.data.hits.length > 0
      ) {
        appendPictures(pictures);
        Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
        onNoScroll();

        window.document.addEventListener('scroll', onscroll);

        return;
      } else {
        Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
        appendPictures(pictures);

        window.document.addEventListener('scroll', infScroll);
      }
    })
    .catch(error => {
      Notify.failure(`there is an error ${error}`);
    });
}

// create a variable to cancel event listener later
const onscroll = throttle(() => {
  if (
    window.scrollY + window.innerHeight + 1 >=
    document.documentElement.scrollHeight
  ) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }

}, 800);

const infScroll = throttle(() => {
  if (
    window.scrollY + window.innerHeight + 1 >=
    document.documentElement.scrollHeight
  ) {
    fetchMoreData();
    Loading.remove();
  }
}, 800);

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
  Loading.dots();
  pictureApi
    .fetchData()
    .then(pictures => {
      if (pictures.data.hits.length < 40 && pictures.data.hits.length > 0) {
        appendPictures(pictures);
        window.document.addEventListener('scroll', onscroll);
        return;
        // one more check, if we try to get more pictures, but there is no more data
      } else if (pictures.data.hits.length === 0) {
        window.document.removeEventListener('scroll', infScroll);
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }
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
