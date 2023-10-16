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
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
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

/** Gets story from submit-story-form and put it on the page */
async function submitNewStory(evt){
  console.debug("submitNewStory");
  evt.preventDefault;

  const newStory = {
    title: $("#story-title").val(),
    author: $("#story-author").val(),
    url: $("#story-url").val()
  }
  console.log(newStory);
  //new instance of a story object, added to currentUser
  let userStory = await storyList.addStory( currentUser, newStory );
  
  const $story = generateStoryMarkup(userStory);
  $allStoriesList.prepend($story);

  currentUser.ownStories.push(userStory);
  console.log(currentUser.ownStories);

  hidePageComponents();
  getAndShowStoriesOnStart();
}

$submitStoryForm.on('submit',submitNewStory); 