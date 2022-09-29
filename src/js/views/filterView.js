import * as model from '../model.js';
import {
  DOGS_LIST,
  SELECT_BUTTON,
  MODAL,
  PAGINATION_CONTAINER,
} from '../config.js';
import { generateMarkup, getImgUrl, centerDogsListGrid } from './view.js';
import { showPaginationMarkup } from './paginationView.js';
import { getOccurrence } from '../helpers.js';

const getCharList = async function (char) {
  const fetchedData = await model.state.temporary;

  const inputDogsData = fetchedData.map((element) =>
    char === 'temperament' ? element.temperament : element.breed_group
  );

  const rawCharsArray = inputDogsData.join(', ').replace(/ /g, '').split(',');
  const charsSet = new Set(rawCharsArray);
  const cleanedCharsArray = Array.from(charsSet).sort().slice(1);

  return cleanedCharsArray.map(
    (el) => `${el} (${getOccurrence(rawCharsArray, el)})`
  );
};

function addFilterOption(element, DOMElement, nameValue) {
  const markup = `
  <div class='fieldset__input'>
    <label class="filter--control">
      <input type="checkbox" id="${element
        .split(' ')[0]
        .toLowerCase()}" name="${nameValue}" value="${element.split(' ')[0]}">
    ${element}</label>
  </div>
`;

  document
    .querySelector(`${DOMElement}`)
    .insertAdjacentHTML('beforeend', markup);
}

function checkSelectedFilteredValues() {
  const selectedTemperamentChars = [
    ...document
      .querySelector('.fieldset__list--temperament')
      .querySelectorAll('input[name=temperament]:checked'),
  ].map((char) => char.value);
  const selectedBreedGroupChars = [
    ...document
      .querySelector('.fieldset__list--breed-group')
      .querySelectorAll('input[name=breed-group]:checked'),
  ].map((char) => char.value);

  console.log('this', selectedTemperamentChars);
  return {
    temperament: selectedTemperamentChars,
    breedGroup: selectedBreedGroupChars,
  };
}

function selectFilteredBreeds() {
  const { breedGroup, temperament } = checkSelectedFilteredValues();

  const fetchedData = model.state.temporary;

  console.log(fetchedData);

  console.log(breedGroup, temperament);

  let filteredData = '';

  if (!breedGroup.length) {
    filteredData = fetchedData
      .filter((dog) => dog.temperament !== undefined)
      .filter((dog) => temperament.every((el) => dog.temperament.includes(el)));
  } else {
    filteredData = fetchedData
      .filter((dog) => dog.temperament !== undefined)
      .filter((dog) => temperament.every((el) => dog.temperament.includes(el)))
      .filter((dog) => dog.breed_group !== undefined)
      .filter((dog) => breedGroup.includes(dog.breed_group));
  }

  console.log(filteredData);

  model.state.filteredData = filteredData;

  DOGS_LIST.textContent = '';

  showPaginationMarkup(model.state.filteredData);

  const searchResultsPage = model.getSearchResultsPage(
    model.state.filteredData
  );

  model.state.dogs = searchResultsPage;

  generateMarkup(model.state.dogs);
  getImgUrl(model.state.dogs);
  DOGS_LIST.classList.remove('centered--one');

  document.querySelector('.modal__filter').remove();

  MODAL.classList.add('hidden');
  document.body.classList.remove('sticky__body');
  Array.from(DOGS_LIST.children).forEach((element) => {
    element.tabIndex = 0;
  });
  centerDogsListGrid();
  console.log(model.state.filteredData);
}

export async function showFilterModal() {
  const filterBox = document.createElement('div');
  filterBox.classList.add('modal__filter');
  filterBox.innerHTML = `
  <div class='filter__top'>
    <span>Filter breeds</span>
    <button class="modal__button">❎</button>
  </div>
  <div class="fieldset__wrapper">
    <fieldset class='fieldset__list fieldset__list--temperament'>
      <legend>temperament:</legend>
    </fieldset>
  </div>
  <div class="fieldset__wrapper">
    <fieldset class='fieldset__list fieldset__list--breed-group'>
      <legend>breed group:</legend>
    </fieldset>
  </div>
  <button class='filter__search-btn'>Show dogs</button>
    `;

  MODAL.insertAdjacentElement('afterbegin', filterBox);
  const charsListTemperament = await getCharList('temperament');

  charsListTemperament.forEach((el) =>
    addFilterOption(el, '.fieldset__list--temperament', 'temperament')
  );

  const charsListBreedGroup = await getCharList();

  charsListBreedGroup.forEach((el) =>
    addFilterOption(el, '.fieldset__list--breed-group', 'breed-group')
  );

  document
    .querySelector('.filter__search-btn')
    .addEventListener('click', selectFilteredBreeds);
}

SELECT_BUTTON.addEventListener('click', () => {
  MODAL.classList.remove('hidden');
  document.body.classList.add('sticky__body');
  PAGINATION_CONTAINER.textContent = '';
});
