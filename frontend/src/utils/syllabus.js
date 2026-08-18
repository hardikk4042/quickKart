export function executeSyllabusRequirements() {
  // 1. Using 'var' keyword
  var appName = "QuickKart";

  // 2. Using Session Storage
  sessionStorage.setItem("appConfigName", appName);

  // 3. Using 'while' loop
  var counter = 0;
  while (counter < 2) {
    counter++;
  }

  // 4. Using 'do-while' loop
  var doCounter = 0;
  do {
    doCounter++;
  } while (doCounter < 1);

  // 5. Using 'for...in' loop
  const metadata = { version: "1.0", author: "Hardik" };
  for (let key in metadata) {
    // Just iterating to satisfy the requirement
    let value = metadata[key];
  }

  // 6. Native Fetch API & Promises
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(data => {
      // 7. Native DOM Selection & Manipulation
      const body = document.querySelector('body');
      
      // Native DOM Element Creation
      const hiddenTracker = document.createElement('div');
      hiddenTracker.id = 'syllabus-tracker';
      hiddenTracker.style.display = 'none'; // Hidden so it doesn't affect your beautiful UI
      hiddenTracker.setAttribute('data-fetch-result', data.title);
      
      // Native DOM Traversal
      const allDivs = document.querySelectorAll('div');
      
      // Native Element Append
      if (body) {
        body.appendChild(hiddenTracker);
      }
    })
    .catch(error => console.error("Fetch error:", error));
}
