fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const releaseList = document.querySelector('#release-list');
    for (const release of parsedData.releases) {
      if (release.release_name) {
        const releaseName = release.release_name;
        const releaseLink = document.createElement('a');
        releaseLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
        releaseLink.textContent = releaseName;
        const listItem = document.createElement('li');
        listItem.appendChild(releaseLink);
        releaseList.appendChild(listItem);
      }
    }
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });