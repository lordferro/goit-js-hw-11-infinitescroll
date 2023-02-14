import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PictureApi from './js/pictureApi';
import loadMoreBtn from './js/loadMoreBtn';

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
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        appendPictures(pictures);
        return
        } else {
                    loadMoreBtn.enable();
        Notify.success(`Hooray! We found ${pictures.data.totalHits} images.`);
        appendPictures(pictures);
      }
    })
    .catch(error => error);
}
function fetchMoreData() {
  pictureApi
    .fetchData()
    .then(pictures => {
      if (pictures.data.hits.length < 40 && pictures.data.hits.length > 0) {
        loadMoreBtn.hide();
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
        appendPictures(pictures);
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
      <img src=${webformatURL} alt="" style="width: 300px" loading="lazy" />
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
