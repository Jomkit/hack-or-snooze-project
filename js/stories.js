"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  console.debug("getAndShowStoriesOnStart");
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 * 10/17/23 - markup dynamically decides favIcon
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  let favIds = [];
  let favState;
  let favTag ="";
  if(currentUser){
    favIds = User.ownFavorites( currentUser );
    favState = favIds.includes(story.storyId) ? "fa-solid" : "fa-regular";
    favTag = `<i class="${favState} fa-star"></i>`;
  }

  return $(`
      <li id="${story.storyId}">
        ${favTag}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}
/** Gets list of favorite stories from server, generates their HTML, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  if(currentUser.favorites.length === 0){
    $allStoriesList.append("<h3>No Favorited Stories!</h3>");
  }
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets story from submit-story-form and put it on the page */
async function submitNewStory(evt){
  console.debug("submitNewStory");
  evt.preventDefault;

  const newStory = {
    title: $("#story-title").val(),
    author: $("#story-author").val(),
    url: $("#story-url").val()
  }
  //new instance of a story object, added to currentUser
  let userStory = await storyList.addStory( currentUser, newStory );
    
  const $story = generateStoryMarkup(userStory);
  $allStoriesList.prepend($story);

  currentUser.ownStories.push(userStory);

  hidePageComponents();
  getAndShowStoriesOnStart();
  $("#story-title").val("");
  $("#story-author").val("");
  $("#story-url").val("");  
}

$submitStoryForm.on('submit',submitNewStory); 

/** update "favorite" icon in the story stream from outline (not favorited) 
 * to solid (favorited)
 */
async function toggleFavorite(evt){
  console.debug("toggleFavorite");
  const favTarget = $(evt.target);
  const favStory = storyList.stories.filter( s => s.storyId == favTarget.parent().attr("Id"))[0];
  

  // console.log($(evt.target).parent().attr("id"));
  favTarget.hasClass("fa-regular") ? await currentUser.addFavorite( favStory ) : await currentUser.removeFavorite( favStory );
  
  favTarget.toggleClass("fa-regular");
  favTarget.toggleClass("fa-solid");
}

$allStoriesList.on("click", "i", toggleFavorite);

/** Remove all favorites */
async function removeAllFavorites(){
  console.debug("removeAllFavorites");
  
  await User.removeAllFav(currentUser);
  currentUser.favorites = 0;
}