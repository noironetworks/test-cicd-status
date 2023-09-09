fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const releaseTable = document.querySelector('#release-table tbody');

    // Sort releases based on release_tag
    const sortedReleases = parsedData.releases.sort((a, b) => {
      if (a.release_tag > b.release_tag) return -1;
      if (a.release_tag < b.release_tag) return 1;
      return 0;
    });

    for (const release of sortedReleases) {
      // Sort release_streams lexicographically by release_name
      const sortedReleaseStreams = release.release_streams.sort((a, b) => {
        if (a.release_name < b.release_name) return -1;
        if (a.release_name > b.release_name) return 1;
        return 0;
      });

      // Loop through the sorted release_streams
      for (const releaseStream of sortedReleaseStreams) {
        if (releaseStream && releaseStream.release_name) {
          const releaseName = releaseStream.release_name;
          // Check releaseName
          if (releaseName.endsWith('.z') || releaseName.match(/rc[0-9]+$/) || releaseStream.released === true) {
            // Add the release information to the table
            const releaseRow = document.createElement('tr');

            const tagCell = document.createElement('td');
            const releaseLink = document.createElement('a');
            releaseLink.href = `release.html?release=${encodeURIComponent(releaseName)}`;
            releaseLink.textContent = releaseName;
            tagCell.appendChild(releaseLink);
            releaseRow.appendChild(tagCell);

            const lastUpdatedCell = document.createElement('td');
            // Assuming you have a property named "last_updated" in your release.yaml for each release_stream
            lastUpdatedCell.textContent = releaseStream.last_updated || 'N/A';
            releaseRow.appendChild(lastUpdatedCell);

            releaseTable.appendChild(releaseRow);
          }
        }
      }
    }
  })
  .catch(error => {
    console.error('Error loading YAML file:', error);
  });
