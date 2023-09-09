fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const sortedReleases = parsedData.releases.sort((a, b) => {
      if (a.release_tag > b.release_tag) return -1;
      if (a.release_tag < b.release_tag) return 1;
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

    // Iterate over the sorted releases
    for (const release of sortedReleases) {
        const releaseListItem = document.createElement('li');
        const releaseLink = document.createElement('a');
        releaseLink.href = `release.html?release=${encodeURIComponent(release.release_tag)}`;
        releaseLink.textContent = release.release_tag;
        // Create a sub-menu for release streams
        const subMenu = document.createElement('ul');
        for (const releaseStream of (release.release_streams || []).sort((a, b) => {
            if (a.release_name < b.release_name) return -1;
            if (a.release_name > b.release_name) return 1;
            return 0;
        })) {
            const releaseName = releaseStream.release_name;
            if (releaseName.endsWith('.z') || releaseName.match(/rc[0-9]+$/)) {
                const subMenuItem = document.createElement('li');
                const subMenuLink = document.createElement('a');
                subMenuLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
                subMenuLink.textContent = releaseName;
                subMenuItem.appendChild(subMenuLink);
                subMenu.appendChild(subMenuItem);
            } else if (releaseStream.released === true) {
                //releaseLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
            }
        }
        releaseListItem.appendChild(releaseLink);
        if (subMenu.childNodes.length > 0) {
            releaseListItem.appendChild(subMenu);
        }

        tagMenu.appendChild(releaseListItem);
    }
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });
