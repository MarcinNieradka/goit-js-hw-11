import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import MoveTo from 'moveto';

const searchEl = document.getElementById('search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
// const scrollSentinel = document.getElementById('scroll-sentinel');
const moveTo = new MoveTo({ duration: 2000, container: window });

const API_KEY = '35576958-fcdd23cb6f9ed7de7f6f808c6';
const API_URL = 'https://pixabay.com/api/?';
const MAX = 40;
let currPage = 1;
let maxPages = 0;
let inputSearch = '';
let lightbox;

const searchParams = () =>
  new URLSearchParams({
    key: API_KEY,
    q: inputSearch,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currPage,
    per_page: MAX,
  });

loadMoreBtn.style.display = 'none';

const createImg = element => {
  //   console.log(element);
  loadMoreBtn.style.display = 'initial'; //-------------- SOLUTION WITH LOAD MORE BTN
  loadMoreBtn.innerHTML = 'Load more'; //-------------- SOLUTION WITH LOAD MORE BTN
  loadMoreBtn.disabled = false; //-------------- SOLUTION WITH LOAD MORE BTN
  const galleryItem = document.createElement('div');
  galleryItem.classList.add('gallery__item-container');
  galleryItem.innerHTML = `
    <a class="gallery__link" href="${element.largeImageURL}">
      <img class="gallery__image" src="${element.webformatURL}" alt="${element.tags}" />
    </a>
    <div class="gallery__numbers">
      <p><b>Likes</b></br> ${element.likes}</p>
      <p><b>Views</b></br> ${element.views}</p>
      <p><b>Comments</b></br> ${element.comments}</p>
      <p><b>Downloads</b></br> ${element.downloads}</p>
    </div>
`;
  galleryEl.append(galleryItem);
};

const fetchPhotos = async () => {
  try {
    const response = await axios.get(API_URL + searchParams());
    // console.log(response);
    console.log(response.data);
    maxPages = Math.ceil(response.data.totalHits / MAX);
    // console.log(maxPages);
    if (response.data.hits.length === 0) {
      throw new Error('Nothing found');
    }
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    throw error;
  }
};

const fetchMorePhotos = async () => {
  try {
    const response = await axios.get(API_URL + searchParams());
    if (response.data.hits.length === 0) {
      throw new Error();
    }
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    throw error;
  }
};

const renderPhotos = data => {
  try {
    data.hits.forEach(element => {
      createImg(element);
      //   console.log(element.largeImageURL);
    });
    lightbox = new SimpleLightbox('.gallery a');
    moveTo.move(loadMoreBtn); //-------------- SOLUTION WITH LOAD MORE BTN
  } catch (error) {
    console.log(error);
  }
};

searchEl.addEventListener('submit', async e => {
  e.preventDefault();
  loadMoreBtn.style.display = 'none';
  currPage = 1;
  galleryEl.innerHTML = '';
  inputSearch = e.currentTarget.elements.searchQuery.value;
  console.log(inputSearch);
  try {
    const data = await fetchPhotos();
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    renderPhotos(data);
  } catch (error) {
    console.log(error);
  }
});

////////// SOLUTION WITH LOAD MORE BTN ----- START ////////////

loadMoreBtn.addEventListener('click', async e => {
  currPage++;
  if (currPage > maxPages) {
    loadMoreBtn.innerHTML = 'No more pics';
    loadMoreBtn.disabled = true;
  } else {
    lightbox.destroy();
  }
  try {
    const data = await fetchMorePhotos();
    renderPhotos(data);
  } catch (error) {
    console.log(error);
  }
  console.log(currPage);
});

////////// SOLUTION WITH LOAD MORE BTN ----- END ////////////

// const isScrollAtBottom = () => {
//   const bodyEl = document.body;
//   const htmlEl = document.documentElement;
//   const scrollTop = Math.max(bodyEl.scrollTop, htmlEl.scrollTop);
//   const windowHeight = window.innerHeight;
//   const docHeight = Math.max(bodyEl.scrollHeight, htmlEl.scrollHeight);

//   return scrollTop >= docHeight - windowHeight - 100;
// };

// window.addEventListener('scroll', async () => {
//   if (isScrollAtBottom()) {
//     currPage++;
//     if (currPage > maxPages) {
//       return;
//     } else {
//       lightbox.destroy();
//     }
//     try {
//       const data = await fetchMorePhotos();
//       renderPhotos(data);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// });
