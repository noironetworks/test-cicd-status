fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    // Sort releases based on release_name
    const sortedReleases = parsedData.releases.sort((a, b) => {
      const aFirstDigit = parseInt(a.release_name.charAt(0));
      const bFirstDigit = parseInt(b.release_name.charAt(0));

      // Sort releases starting with the same digit `a` in lexicographic order
      if (aFirstDigit === bFirstDigit) {
        if (a.release_name < b.release_name) return -1;
        if (a.release_name > b.release_name) return 1;
        return 0;
      }

      // Sort releases of different `a`'s in reverse lexicographic order
      if (aFirstDigit > bFirstDigit) return -1;
      if (aFirstDigit < bFirstDigit) return 1;
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
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });
