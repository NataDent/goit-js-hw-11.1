import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '38385479-57784bf7d17c856b0f296bf8b';
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more')
}
const lightbox = new SimpleLightbox('.gallery a', { showCounter: false });

let page = 1;
let searchQuery = '';

async function fetchImiges() {  
    const responce = await axios.get(`${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&safesearch=true&per_page=40&orientation=horizontal&page=${page}`);
    return responce;
}

refs.form.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  
  refs.gallery.innerHTML = '';
  refs.loadMore.style.display = 'none';
  page = 1;
  searchQuery = e.target.elements.searchQuery.value.replaceAll(' ', '+');
  try {
    const resp = await fetchImiges(searchQuery, page);
    const totalHits = resp.data.totalHits;

    if (!totalHits) {
      throw new Error('Sorry, there are no images matching your search query. Please try again.')
    }
    else if (!e.target.elements.searchQuery.value) {
      Notify.warning('Please, enter a query');
      return;
    }
    else {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      refs.loadMore.style.display = 'block';
    }

    const markup = resp.data.hits.map(createMarkup).join('');
      
    refs.gallery.innerHTML = markup;
    if (totalHits > 0 && totalHits <= 40) {
      Notify.info("We're sorry, but you've reached the end of search results.");
}
    
    lightbox.refresh();
      
  } catch (error) {
    Notify.failure(error.message);
    e.target.reset();
  }
}


function createMarkup({ webformatURL, tags, likes, views, comments, downloads, largeImageURL }) {
  return `<a href="${largeImageURL}" class="photo-card">
  <div class="img-container"><img class="card-img" src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> <span class="text-number">${likes}</span>
    </p>
    <p class="info-item">
      <b>Views</b> <span class="text-number">${views}</span>
    </p>
    <p class="info-item">
      <b>Comments</b> <span class="text-number">${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads</b> <span class="text-number">${downloads}</span>
    </p>
  </div>
</a>`
}

refs.loadMore.addEventListener('click', onLoadMore);

async function onLoadMore() {

  try {
    page += 1;
    searchQuery = refs.form.elements.searchQuery.value;
    const resp = await fetchImiges(searchQuery, page);
    const markup = resp.data.hits.map(createMarkup).join('');
    const totalHits = resp.data.totalHits;

    refs.gallery.insertAdjacentHTML('beforeend', markup);
   
    lightbox.refresh();

    if (page === Math.ceil(totalHits / 40)) {
      console.log(page);
      refs.loadMore.style.display = 'none';
      Notify.info("We're sorry, but you've reached the end of search results.")
}
    }
   catch (err) {
    Notify.failure(err.message);
    return;
  }
}

// window.addEventListener('scroll', async () => {
//     refs.loadMore.style.display = 'none'; 
// const documentRect = document.documentElement.getBoundingClientRect();
// if (documentRect.bottom < document.documentElement.clientHeight + 150) {
//    page += 1; 
//   searchQuery = refs.form.elements.searchQuery.value;
//   const resp = await fetchImiges(searchQuery, page);
    
//     const markup = resp.data.hits.map(createMarkup).join('');
//   refs.gallery.insertAdjacentHTML('beforeend', markup);
//   lightbox.refresh();
//   console.dir(refs.gallery.children.length)
 
//   }
//