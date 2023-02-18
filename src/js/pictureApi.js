import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const API_KEY = '33613325-290fbadf3efc3d533d0ce9ce0';
const URL = 'https://pixabay.com/api/';

export default class PictureApi {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  async fetchData() {
    try {
      if (this.page === 14) {
        Notify.warning(
          `We're sorry, but you've reached a limit of API Pixabay`
        );
        return;
      }
      const data = await axios.get(
        `${URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.page}`
      );
      this.pageIncrement();
      return data;
    } catch (error) {
      console.dir(error);
    }
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.query = newQuery;
  }

  pageIncrement() {
    this.page += 1;
  }

  pageReset() {
    this.page = 1;
  }
}
