// Fetch the YAML file and load the data
fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    const imageRegistry = urlParams.get('dq'); // Should be either "quay" or "docker"

    // Find the specific release data
    const releaseData = parsedData.releases.find(release => release.release_name === releaseName);
    if (!releaseData) {
      console.error(`Release with name "${releaseName}" not found.`);
      return;
    }

    // Fill the image prefix
    const imagePrefixElement = document.getElementById('image-prefix');
    imagePrefixElement.textContent = imageRegistry;

    // Populate the SHA256 manifest table
    const manifestTableBody = document.getElementById('manifest-sha-table-body');
    for (const image of releaseData.container_images) {
      if (imageRegistry === 'docker' && image.docker.length > 0) {
        const sha256 = image.docker[0].sha.replace('sha256:', '');
        const manifestRow = document.createElement('tr');
        const manifestShaCell = document.createElement('td');
        const manifestShaLink = document.createElement('a');
        manifestShaLink.href = image.docker[0].link;
        manifestShaLink.textContent = `${image.name}@sha256:${sha256}`;
        manifestShaCell.appendChild(manifestShaLink);
        manifestRow.appendChild(manifestShaCell);
        manifestTableBody.appendChild(manifestRow);
      } else if (imageRegistry === 'quay' && image.quay.length > 0) {
        const sha256 = image.quay[0].sha.replace('sha256:', '');
        const manifestRow = document.createElement('tr');
        const manifestShaCell = document.createElement('td');
        const manifestShaLink = document.createElement('a');
        manifestShaLink.href = image.quay[0].link;
        manifestShaLink.textContent = `${image.name}@sha256:${sha256}`;
        manifestShaCell.appendChild(manifestShaLink);
        manifestRow.appendChild(manifestShaCell);
        manifestTableBody.appendChild(manifestRow);
      }
    }
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
