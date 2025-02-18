fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);

    const releaseTable = document.querySelector('#container-release-table');
    const tableBody = releaseTable.querySelector('tbody');
    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    const releaseTag = releaseName.replace(/(\.z|.rc[0-9]+)$/, '');
    var accProcOpRow = document.createElement('tr');
    var aciConWeb = document.createElement('tr');
    var aciConCert = document.createElement('tr');
    var aciConHostOvscni = document.createElement('tr');

    for (const releaseData of parsedData.releases) {
      if (releaseData.release_tag === releaseTag) {
        for (const releaseStream of releaseData.release_streams) {
          if (releaseStream.release_name === releaseName) {
            if (releaseName === releaseTag) {
              if (releaseStream.released === false) {
                const releaseRow = document.createElement('tr');
                const releaseNameCell = document.createElement('td');
                const releaseLink = document.createElement('a');
                releaseLink.href = `release.html?release=${encodeURIComponent(releaseName+'.z')}`;
                releaseLink.textContent = "The final release for this version is not yet available, check out the z-stream for the latest continous release.";
                if (releaseName.match(/\.z/) || releaseName.match(/rc[0-9]+$/)) {
                  releaseLink.textContent = "Please check other existing releases.";
                  releaseLink.href = 'index.html';
                }

                releaseNameCell.appendChild(releaseLink);
                releaseNameCell.colSpan = 11;

                releaseRow.appendChild(releaseNameCell);
                tableBody.appendChild(releaseRow);
                break;
              }
            }

            // Sort the images by name
            const sortedImages = releaseStream.container_images.sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              return 0;
            });
            for (const image of sortedImages) {
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
              if (!image.quay[0].hasOwnProperty('sha')) {
                releaseRow.appendChild(quaySHACell.textContent = '');
              } else if (image.quay[0].sha === "error") {
                  quaySHACell.textContent = 'N/A';
              } else {
                const quaySHALink = document.createElement('a');
                const quay = "quay";
                quaySHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseName)}&dq=${encodeURIComponent(quay)}`
                quaySHALink.textContent = image.quay[0].sha.replace('sha256:', '').substring(0, 12);
                quaySHACell.appendChild(quaySHALink);
              }
              releaseRow.appendChild(quaySHACell);

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
              } else if (image.docker[0].sha === "error") {
                  dockerSHACell.textContent = 'N/A';
              } else {
                  const dockerSHALink = document.createElement('a');
                  const docker = "docker";
                  dockerSHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseName)}&dq=${encodeURIComponent(docker)}`
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
              
                if (image.hasOwnProperty('base-image') && image['base-image'].length > 0 && image['base-image'][0].hasOwnProperty('severity') && image['base-image'][0].severity && image['base-image'][0].severity.length > 0) {
                  const baseImageC = image['base-image'][0].severity[0].C.toString();
                  const baseImageH = image['base-image'][0].severity[0].H.toString();
                  const baseImageM = image['base-image'][0].severity[0].M.toString();
                  const baseImageL = image['base-image'][0].severity[0].L.toString();
                  const baseImageU = image['base-image'][0].severity[0].U.toString();

                  let severityType = 'GRYPE';
                  let severityTypeClass = 'severity_type_grype';
                  if (image['base-image'][0].hasOwnProperty('severity_type')) {
                    severityType = image['base-image'][0].severity_type;
                    if (severityType.toLowerCase() === 'quay') {
                      severityTypeClass = 'severity_type_quay';
                      if (image['base-image'][0].severity_link) {
                        baseImageCVELink.href = image['base-image'][0].severity_link;
                      }
                    }
                  }
                  severityType = severityType.toUpperCase()
                  const baseImageCVEText = ` <div class="${severityTypeClass}">${severityType}</div>
                  <hr>
                  <span class="cve-letter cve-c">C:${baseImageC}</span><br>
                  <span class="cve-letter cve-h">H:${baseImageH}</span><br>
                  <span class="cve-letter cve-m">M:${baseImageM}</span><br>
                  <span class="cve-letter cve-l">L:${baseImageL}</span><br>
                  <span class="cve-letter cve-u">U:${baseImageU}</span>`;
                  
                  baseImageCVELink.innerHTML = baseImageCVEText;
                  baseImageCVECell.appendChild(baseImageCVELink);
                } else if (image['base-image'][0].hasOwnProperty('base_cve_error') && image['base-image'][0].base_cve_error === 'Scanning Queued in Quay'){
                  if (image['base-image'][0].hasOwnProperty('severity_type')) {
                    severityType = image['base-image'][0].severity_type;
                    if (severityType.toLowerCase() === 'quay') {
                      severityTypeClass = 'severity_type_quay';
                      if (image['base-image'][0].severity_link) {
                        baseImageCVELink.href = image['base-image'][0].severity_link;
                      }
                    }
                  }
                  severityType = severityType.toUpperCase()
                  const cveText = ` <div class="${severityTypeClass}">${severityType}</div>
                                    <hr>
                                    <span>Queued</span><br>`;
                  baseImageCVELink.innerHTML = cveText;
                  baseImageCVECell.appendChild(baseImageCVELink);
                }
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
              if (image.hasOwnProperty('severity') && image.severity !== null && image.severity.length > 0) {
                const C = image.severity[0].C.toString();
                const H = image.severity[0].H.toString();
                const M = image.severity[0].M.toString();
                const L = image.severity[0].L.toString();
                const U = image.severity[0].U.toString();
                
                let severityType = 'GRYPE';
                let severityTypeClass = 'severity_type_grype';
                if (image.hasOwnProperty('severity_type')) {
                  severityType = image.severity_type;
                  if (severityType.toLowerCase() === 'quay') {
                    severityTypeClass = 'severity_type_quay';
                    if (image.severity_link) {
                      cveLink.href = image.severity_link;
                    }
                  }
                }
                severityType = severityType.toUpperCase()
                const cveText = ` <div class="${severityTypeClass}">${severityType}</div>
                                  <hr>
                                  <span class="cve-letter cve-c">C:${C}</span><br>
                                  <span class="cve-letter cve-h">H:${H}</span><br>
                                  <span class="cve-letter cve-m">M:${M}</span><br>
                                  <span class="cve-letter cve-l">L:${L}</span><br>
                                  <span class="cve-letter cve-u">U:${U}</span>`;
                cveLink.innerHTML = cveText;
                cveCell.appendChild(cveLink);
              } else if (image.cve_error === 'Scanning Queued in Quay'){
                if (image.hasOwnProperty('severity_type')) {
                  severityType = image.severity_type;
                  if (severityType.toLowerCase() === 'quay') {
                    severityTypeClass = 'severity_type_quay';
                    if (image.severity_link) {
                      cveLink.href = image.severity_link;
                    }
                  }
                }
                severityType = severityType.toUpperCase()
                const cveText = ` <div class="${severityTypeClass}">${severityType}</div>
                                  <hr>
                                  <span>Queued</span><br>`;
                cveLink.innerHTML = cveText;
                cveCell.appendChild(cveLink);
              }
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

              if (image.name == "acc-provision-operator") {
                accProcOpRow = releaseRow;
              } else if (image.name == "aci-containers-webhook") {
                aciConWeb = releaseRow;
              } else if (image.name == "aci-containers-certmanager") {
                aciConCert = releaseRow;
              } else if (image.name == "aci-containers-host-ovscni") {
                aciConHostOvscni = releaseRow;
              } else {
                tableBody.appendChild(releaseRow);
              }
            }
            tableBody.appendChild(aciConCert);
            tableBody.appendChild(aciConWeb);
            tableBody.appendChild(aciConHostOvscni);
            tableBody.appendChild(accProcOpRow);
            // Exit the loop once the specific release is found
            break;
          }
        }
      }
    }
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
