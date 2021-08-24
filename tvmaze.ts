import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $episodesList = $("#episodesList");

const BASE_URL = 'https://api.tvmaze.com';
const MISSING_URL = 'https://tinyurl.com/missing-tv';

interface Show {
  id: number;
  name: string;
  summary: string;
  image: { medium: string };
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
  let results = await axios.get(`${BASE_URL}/search/shows?q=${term}`);
  console.log(results);

  return results.data.map((r: { show: Show }) => (
    {
      id: r.show.id,
      name: r.show.name,
      summary: r.show.summary,
      image: r.show.image ? r.show.image.medium : MISSING_URL
    }
  ));
}


/** Given list of shows, create markup for each and append to DOM */

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

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay(): Promise<void> {
  const term: string = $("#searchForm-term").val() as string; 
  // "as string" is TypeScript way of type-casting

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

  return results.data.map((r: Episode) => (
    {
      id: r.id,
      name: r.name,
      season: r.season,
      number: r.number
    }
  ));
}

/** Given list of episodes, create markup for each and append to DOM. */

function populateEpisodes(episodes: Episode[]) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>
        ${episode.name} (season ${episode.season}, number ${episode.number})
      </li>
      `);

    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/** Handle Episodes button: get episodes of show from API and display.*/

// specifies event comes from a JQuery click event
async function searchForEpisodesAndDisplay(evt: JQuery.ClickEvent): Promise<void> {
  // get show id from button
  const showID = $(evt.target).closest("[data-show-id]").data("show-id");

  const episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);