import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL = 'https://api.tvmaze.com';
const MISSING_URL = 'https://tinyurl.com/missing-tv';

interface Show {
  id: number;
  name: string;
  summary: string;
  image: string;
}

interface Episode {
  id: number;
  name: string;
  season: string;
  number: string;
}


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let results = await axios.get(`${BASE_URL}/search/shows?q=${term}`);
  console.log(results);
  return results.data.map(r => (
    {
      id: r.show.id, 
      name: r.show.name, 
      summary: r.show.summary, 
      image: r.show.image ? r.show.image.medium : MISSING_URL
    }
  ));
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: Show[]): void {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt="Bletchly Circle San Francisco"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term :string = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<Episode[]> {
  let results = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  console.log(results);
  return results.data.map(r => (
    {
      id: r.id, 
      name: r.name, 
      season: r.season,
      number: r.number
    }
  ));
}

/** Write a clear docstring for this function... */

// function populateEpisodes(episodes) { }