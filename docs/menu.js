fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    // Sort releases in lexicographic order based on release_name
    const sortedReleases = parsedData.releases.sort((a, b) => {
      if (a.release_name < b.release_name) return -1;
      if (a.release_name > b.release_name) return 1;
      return 0;
    });

    const tagMenu = document.getElementById('release-list');

    // Add the link to the home page
    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.textContent = 'Home';
    const homeListItem = document.createElement('li');
    homeListItem.appendChild(homeLink);
    tagMenu.appendChild(homeListItem);

    // Iterate over the sorted releases to create the other links
    for (const release of sortedReleases) {
      if (release.release_name) {
        const releaseName = release.release_name;
        const releaseLink = document.createElement('a');
        releaseLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
        releaseLink.textContent = releaseName;
        const listItem = document.createElement('li');
        listItem.appendChild(releaseLink);
        tagMenu.appendChild(listItem);
      }
    }

    if (window.location.pathname.includes('release.html')) {
      // Extract username and repository name from GitHub Pages URL
      const ghPagesUrl = window.location.origin + window.location.pathname;
      const match = ghPagesUrl.match(/https:\/\/([\w-]+)\.github\.io\/([\w-]+)\//);
      if (match) {
        const username = match[1];
        const repository = match[2];  
        // Add link to commit history called "Previous Releases"
        const previousReleasesLink = document.createElement('a');
        previousReleasesLink.href = `https://github.com/${username}/${repository}/commits/main`;
        previousReleasesLink.textContent = 'Previous Releases';
        const previousReleasesListItem = document.createElement('li');
        previousReleasesListItem.appendChild(previousReleasesLink);
        tagMenu.appendChild(previousReleasesListItem);
      } else {
        console.log("The provided URL does not match the expected GitHub Pages format.");
      // Add a link to the GitHub commit history URL
        const testCommitHistoryLink = document.createElement('a');
        testCommitHistoryLink.href = 'https://github.com/noironetworks/test-cicd-status/commits/main';
        testCommitHistoryLink.textContent = 'Test Commit History URL';
        tagMenu.appendChild(testCommitHistoryLink);
      }
    }
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });
