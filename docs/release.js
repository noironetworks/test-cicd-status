fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const releaseTable = document.querySelector('#release-table');
    const tableBody = releaseTable.querySelector('tbody');

    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');

    for (const releaseData of parsedData.releases) {
      if (releaseData.release_name === releaseName) {
        for (const image of releaseData.images) {
          const releaseRow = document.createElement('tr');

          const imageNameCell = document.createElement('td');
          imageNameCell.textContent = image.name;
          releaseRow.appendChild(imageNameCell);

          const commitCell = document.createElement('td');
          commitCell.textContent = image.commit;
          releaseRow.appendChild(commitCell);

          const quayTagsCell = document.createElement('td');
          const quayTags = image.quay.map(tag => tag.tag).join('\n ');
          quayTagsCell.textContent = quayTags;
          releaseRow.appendChild(quayTagsCell);

          const quaySHACell = document.createElement('td');
          const quaySHAs = image.quay.map(tag => tag.sha).join('\n ');
          quaySHACell.textContent = quaySHAs;
          releaseRow.appendChild(quaySHACell);

          const dockerTagsCell = document.createElement('td');
          const dockerTags = image.docker.map(tag => tag.tag).join('\n ');
          dockerTagsCell.textContent = dockerTags;
          releaseRow.appendChild(dockerTagsCell);

          const dockerSHACell = document.createElement('td');
          const dockerSHAs = image.docker.map(tag => tag.sha).join('\n ');
          dockerSHACell.textContent = dockerSHAs;
          releaseRow.appendChild(dockerSHACell);
 
          /*const quayTagCell = document.createElement('td');
          quayTagCell.textContent = `Tag: ${image.tags.quay.tag}`;
          releaseRow.appendChild(quayTagCell);

          const quayShaCell = document.createElement('td');
          quayShaCell.textContent = `SHA: ${image.tags.quay.sha}`;
          releaseRow.appendChild(quayShaCell);

          const dockerTagCell = document.createElement('td');
          dockerTagCell.textContent = `Tag: ${image.tags.docker.tag}`;
          releaseRow.appendChild(dockerTagCell);

          const dockerShaCell = document.createElement('td');
          dockerShaCell.textContent = `SHA: ${image.tags.docker.sha}`;
          releaseRow.appendChild(dockerShaCell);*/

          const sbomCell = document.createElement('td');
          sbomCell.textContent = image.sbom;
          releaseRow.appendChild(sbomCell);

          const cveCell = document.createElement('td');
          cveCell.textContent = image.cve;
          releaseRow.appendChild(cveCell);

          const buildLogsCell = document.createElement('td');
          buildLogsCell.textContent = image['build-logs'];
          releaseRow.appendChild(buildLogsCell);

          tableBody.appendChild(releaseRow);
        }
        // Exit the loop once the specific release is found
        break;
      }
    }
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });