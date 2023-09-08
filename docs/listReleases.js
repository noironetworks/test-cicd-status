fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const releaseTable = document.querySelector('#release-table tbody');

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


    for (const release of sortedReleases) {
      if (release.release_name) {
        const releaseName = release.release_name;

        // Add the release information to the table
        const releaseRow = document.createElement('tr');

        const tagCell = document.createElement('td');
        const releaseLink = document.createElement('a');
        releaseLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
        releaseLink.textContent = releaseName;
        tagCell.appendChild(releaseLink);
        releaseRow.appendChild(tagCell);

        const lastUpdatedCell = document.createElement('td');
        // Assuming you have a property named "last_updated" in your release.yaml
        lastUpdatedCell.textContent = release.last_updated || 'N/A';
        releaseRow.appendChild(lastUpdatedCell);

        releaseTable.appendChild(releaseRow);
      }
    }
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });
