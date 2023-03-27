const extensions = 'https://developer.chrome.com/docs/extensions'
const webstore = 'https://developer.chrome.com/docs/webstore'

chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled detected");
    chrome.action.setBadgeText({
      text: "OFF",
    });
  });

chrome.action.onClicked.addListener(async (tab) => {
  console.log("onClicked detected");
  //if (tab.url.startsWith(extensions) || tab.url.startsWith(webstore)) {
    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });
  //}

  if (nextState === "ON") {
    // Insert the CSS file when the user turns the extension on
    await chrome.scripting.insertCSS({
      files: ["css/json-utils.css"],
      target: { tabId: tab.id },
    });
    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
          allFrames: true,
        },
        files: ["jsontree/json-view.js"],
      });
    } catch (err) {
      console.error(`failed to execute script: ${err}`);
    }
    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
        },
        func: () => {
          let data = {
            "employees":[
                {"name":"dorian"},
                {"name":"monica"},
                {"name":"jill"},
                {"name":"ashley"}
            ]
          };
          data = JSON.parse(document.body.textContent);
          let newDiv = document.createElement("div");
          newDiv.id = "json_tree_div";
          document.body.appendChild(newDiv);
          const tree = jsonview_create(data);
          jsonview_render(tree, document.querySelector('#json_tree_div'));
          jsonview_expand(tree);
          //document.body.style.border = "5px solid green";
        },
      });
    } catch (err) {
      console.error(`failed to execute script: ${err}`);
    }
  } else if (nextState === "OFF") {
    // Remove the CSS file when the user turns the extension off
    await chrome.scripting.removeCSS({
      files: ["css/json-utils.css"],
      target: { tabId: tab.id },
    });
P  }
/*
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    console.log("background","sending",nextState);
    const response = await chrome.tabs.sendMessage(tab.id, {greeting: nextState});
    // do something with response here, not outside the function
    console.log("background","response",response);
  })();
*/
});
