fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const accProvisionTable = document.querySelector('#acc-provision-table');
    const accProvisionTableBody = accProvisionTable.querySelector('tbody');
    const prevCommit = document.getElementById('previous-commits')

    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    const releaseTag = releaseName.replace(/(\.z|rc[0-9]+)$/, '');

    for (const releaseData of parsedData.releases) {
      if (releaseData.release_tag === releaseTag) {
        for (const releaseStream of releaseData.release_streams) {
          if (releaseStream.release_name === releaseName) {
            // Populate the acc-provision-table
            if (releaseStream.acc_provision && releaseStream.acc_provision.length > 0) {
              for (const accProvisionEntry of releaseStream.acc_provision) {
                  const accProvisionRow = document.createElement('tr');
                  const accProvisionTagCell = document.createElement('td');
                  const accProvisionLinkCell = document.createElement('td');

                  accProvisionTagCell.textContent = accProvisionEntry.tag;
                  accProvisionRow.appendChild(accProvisionTagCell);

                  // if commit is available, add a link to the commit
                  if (accProvisionEntry.commit) {
                      // create a link to commit
                      const commitCell = document.createElement('td');
                      const commitLink = document.createElement('a');
                      commitLink.href = accProvisionEntry.commit[0].link;
                      commitLink.textContent = accProvisionEntry.commit[0].sha.substring(0, 7);
                      commitCell.appendChild(commitLink);
                      accProvisionRow.appendChild(commitCell);
                  }

                  const accProvisionLink = document.createElement('a');
                  accProvisionLink.href = accProvisionEntry.link;
                  accProvisionLink.textContent = accProvisionEntry.link;
                  accProvisionLinkCell.appendChild(accProvisionLink);
                  accProvisionRow.appendChild(accProvisionLinkCell);

                  // if build logs are available, add a link to the build logs
                  if (accProvisionEntry['build-logs']) {
                      // create a link to build logs
                      const buildLogsCell = document.createElement('td');
                      const buildLogsLink = document.createElement('a');
                      buildLogsLink.href = accProvisionEntry['build-logs'];
                      if (accProvisionEntry['build-time'] !== undefined) {
                      buildLogsLink.textContent = accProvisionEntry['build-time'];
                      } else {
                          buildLogsLink.textContent = 'Build Logs';
                      }
                      buildLogsCell.appendChild(buildLogsLink);
                      accProvisionRow.appendChild(buildLogsCell);
                  }
                  accProvisionTableBody.appendChild(accProvisionRow);
                }
              } else {
                // If there are no acc_provision entries, display a message in a single row
                const noAccProvisionRow = document.createElement('tr');
                const noAccProvisionCell = document.createElement('td');
                noAccProvisionCell.textContent = 'No ACC-PROVISION data available';
                noAccProvisionCell.colSpan = 4;
                noAccProvisionRow.appendChild(noAccProvisionCell);
                accProvisionTableBody.appendChild(noAccProvisionRow);
              }
            // Exit the loop once the specific release is found
            break;
          }
        }
      }
    }
    if (window.location.pathname.includes('release.html')) {
      // Extract username and repository name from GitHub Pages URL
      const ghPagesUrl = window.location.origin + window.location.pathname;
      const match = ghPagesUrl.match(/https:\/\/([\w-]+)\.github\.io\/([\w-]+)\//);
      const h4Element = document.createElement('h4');
      const link = document.createElement('a');
    
      if (match) {
        const username = match[1];
        const repository = match[2];  
        link.href = `https://github.com/${username}/${repository}/commits/main`;
        link.textContent = 'Previous Commits';
      } else {
        console.log("The provided URL does not match the expected GitHub Pages format.");
        link.href = 'https://github.com/noironetworks/test-cicd-status/commits/main';
        link.textContent = 'Test Commit History URL';
      }
      h4Element.appendChild(link);
      prevCommit.appendChild(h4Element);
    }
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
