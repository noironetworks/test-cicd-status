fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    const releaseTable = document.querySelector('#container-release-table');
    const accProvisionTable = document.querySelector('#acc-provision-table');
    const tableBody = releaseTable.querySelector('tbody');
    const accProvisionTableBody = accProvisionTable.querySelector('tbody');
    const prevCommit = document.getElementById('previous-commits')

    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    for (const releaseData of parsedData.releases) {
      if (releaseData.release_name === releaseName) {
        for (const image of releaseData.container_images) {
          const releaseRow = document.createElement('tr');

          const imageNameCell = document.createElement('td');
          imageNameCell.textContent = image.name;
          releaseRow.appendChild(imageNameCell);

          // create a link to commit
          const commitCell = document.createElement('td');
          if (image.hasOwnProperty('commit') === false) {
            commitCell.textContent = '';
          } else {
          const commitLink = document.createElement('a');
          commitLink.href = image.commit[0].link;
          commitLink.textContent = image.commit[0].sha.substring(0, 7);
          commitCell.appendChild(commitLink);
          }
          releaseRow.appendChild(commitCell);

          // create a link for quay tags
          const quayTagsCell = document.createElement('td');
          const quayTagsList = document.createElement('ul');
          if (image.hasOwnProperty('quay') === false) {
            quayTagsCell.textContent = '';
          } else {
          for (const quayTag of image.quay) {
            const quayTagItem = document.createElement('li');
            const quayTagLink = document.createElement('a');
            quayTagLink.href = quayTag.link;
            quayTagLink.textContent = quayTag.tag;
            quayTagItem.appendChild(quayTagLink);
            quayTagsList.appendChild(quayTagItem);
          }
          quayTagsCell.appendChild(quayTagsList);
          }
          releaseRow.appendChild(quayTagsCell);

          const quaySHACell = document.createElement('td');
          if (image.quay[0].hasOwnProperty('sha') === false) {
            releaseRow.appendChild(quaySHACell.textContent = '');
          } else {
          const quaySHALink = document.createElement('a');
          const quay = "quay";
          quaySHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseData.release_name)}&dq=${encodeURIComponent(quay)}`
          quaySHALink.textContent = image.quay[0].sha.replace('sha256:', '').substring(0, 12);
          quaySHACell.appendChild(quaySHALink);
          releaseRow.appendChild(quaySHACell);
          }

          // create a link for docker tags
          const dockerTagsCell = document.createElement('td');
          const dockerTagsList = document.createElement('ul');
          if (!image.hasOwnProperty('docker')) {
            dockerTagsCell.textContent = '';
          } else {
          for (const dockerTag of image.docker) {
            const dockerTagItem = document.createElement('li');
            const dockerTagLink = document.createElement('a');
            dockerTagLink.href = dockerTag.link;
            dockerTagLink.textContent = dockerTag.tag;
            dockerTagItem.appendChild(dockerTagLink);
            dockerTagsList.appendChild(dockerTagItem);
          }
          dockerTagsCell.appendChild(dockerTagsList);
          }
          releaseRow.appendChild(dockerTagsCell);

          const dockerSHACell = document.createElement('td');
          if (!image.docker[0].hasOwnProperty('sha')) {
            releaseRow.appendChild(dockerSHACell.textContent = '');
          } else {
            const dockerSHALink = document.createElement('a');
            const docker = "docker";
            dockerSHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseData.release_name)}&dq=${encodeURIComponent(docker)}`
            dockerSHALink.textContent = image.docker[0].sha.replace('sha256:', '').substring(0, 12);
            dockerSHACell.appendChild(dockerSHALink);
          }
          releaseRow.appendChild(dockerSHACell);

          const baseImageCVECell = document.createElement('td');
          const baseImageCVELink = document.createElement('a');

          if (!image['base-image'] || !image['base-image'][0] || !image['base-image'][0].hasOwnProperty('cve')) {
            baseImageCVECell.textContent = '';
          } else {
            baseImageCVELink.href = image['base-image'][0].cve;
            const baseImageC = image['base-image'][0].severity[0].C.toString();
            const baseImageH = image['base-image'][0].severity[0].H.toString();
            const baseImageM = image['base-image'][0].severity[0].M.toString();
            const baseImageL = image['base-image'][0].severity[0].L.toString();
            const baseImageU = image['base-image'][0].severity[0].U.toString();

            const baseImageCVEText = `<span class="cve-letter cve-c">C:${baseImageC}</span><br>
            <span class="cve-letter cve-h">H:${baseImageH}</span><br>
            <span class="cve-letter cve-m">M:${baseImageM}</span><br>
            <span class="cve-letter cve-l">L:${baseImageL}</span><br>
            <span class="cve-letter cve-u">U:${baseImageU}</span>`;
            
            baseImageCVELink.innerHTML = baseImageCVEText;
            baseImageCVECell.appendChild(baseImageCVELink);
          }
          releaseRow.appendChild(baseImageCVECell);

          const baseImageSHACell = document.createElement('td');
          const baseImageSHALink = document.createElement('a');
          if (!image['base-image'] || !image['base-image'][0] || !image['base-image'][0].hasOwnProperty('cve')) {
            baseImageSHACell.textContent = '';
          } else {
          baseImageSHALink.textContent = image['base-image'][0].sha.replace('sha256:', '').substring(0, 12);
          baseImageSHACell.appendChild(baseImageSHALink);
          }
          releaseRow.appendChild(baseImageSHACell);

          const sbomCell = document.createElement('td');
          const sbomLink = document.createElement('a');
          sbomLink.href = image.sbom;
          sbomLink.textContent = 'SBoM';
          sbomCell.appendChild(sbomLink);
          releaseRow.appendChild(sbomCell);

          const cveCell = document.createElement('td');
          const cveLink = document.createElement('a');
          cveLink.href = image.cve;
          const C = image.severity[0].C.toString();
          const H = image.severity[0].H.toString();
          const M = image.severity[0].M.toString();
          const L = image.severity[0].L.toString();
          const U = image.severity[0].U.toString();
          const cveText = `<span class="cve-letter cve-c">C:${C}</span><br>
                <span class="cve-letter cve-h">H:${H}</span><br>
                <span class="cve-letter cve-m">M:${M}</span><br>
                <span class="cve-letter cve-l">L:${L}</span><br>
                <span class="cve-letter cve-u">U:${U}</span>`;
          cveLink.innerHTML = cveText;
          cveCell.appendChild(cveLink);
          releaseRow.appendChild(cveCell);

          const buildLogsCell = document.createElement('td');
          const buildLogsLink = document.createElement('a');
          buildLogsLink.href =  image['build-logs'];
          if (image['build-time'] !== undefined) {
          buildLogsLink.textContent = image['build-time'];
          } else {
            buildLogsLink.textContent = 'Build Logs';
          }
          buildLogsCell.appendChild(buildLogsLink);
          releaseRow.appendChild(buildLogsCell);

          tableBody.appendChild(releaseRow);
        }
   // Populate the acc-provision-table
   if (releaseData.acc_provision && releaseData.acc_provision.length > 0) {
    for (const accProvisionEntry of releaseData.acc_provision) {
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
    const noAccProvisionCell = document.createElement('td');
    noAccProvisionCell.textContent = 'No ACC-PROVISION data available';
    noAccProvisionCell.colSpan = 2;
    noAccProvisionRow.appendChild(noAccProvisionCell);
    accProvisionTableBody.appendChild(noAccProvisionRow);
  }

        // Exit the loop once the specific release is found
        break;
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
