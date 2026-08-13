fetch('release_artifacts/releases.yaml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);

    const releaseTable = document.querySelector('#container-release-table');
    const tableBody = releaseTable.querySelector('tbody');
    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    if (!releaseName) {
      throw new Error('Missing required release query parameter.');
    }
    const releaseTag = releaseName.replace(/(\.z|.rc[0-9]+)$/, '');
    let accProcOpRow = null;
    let aciConWeb = null;
    let aciConCert = null;
    let aciConHostOvscni = null;

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
            const sortedImages = (releaseStream.container_images || []).sort((a, b) => {
              if (a.name > b.name) return 1;
              if (a.name < b.name) return -1;
              return 0;
            });
            for (const image of sortedImages) {
              const quayTags = Array.isArray(image.quay) ? image.quay : [];
              const dockerTags = Array.isArray(image.docker) ? image.docker : [];
              const baseImages = Array.isArray(image['base-image']) ? image['base-image'] : [];
              const baseImage = baseImages[0];
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
              if (quayTags.length === 0) {
                quayTagsCell.textContent = '';
              } else {
              for (const quayTag of quayTags) {
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
              if (!quayTags[0] || !quayTags[0].sha) {
                quaySHACell.textContent = '';
              } else if (quayTags[0].sha === "error") {
                quaySHACell.textContent = 'N/A';
              } else {
                const quaySHALink = document.createElement('a');
                const quay = "quay";
                quaySHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseName)}&dq=${encodeURIComponent(quay)}`
                quaySHALink.textContent = quayTags[0].sha.replace('sha256:', '').substring(0, 12);
                quaySHACell.appendChild(quaySHALink);
              }
              releaseRow.appendChild(quaySHACell);

              // create a link for docker tags
              const dockerTagsCell = document.createElement('td');
              const dockerTagsList = document.createElement('ul');
              if (dockerTags.length === 0) {
                dockerTagsCell.textContent = '';
              } else {
              for (const dockerTag of dockerTags) {
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
              if (!dockerTags[0] || !dockerTags[0].sha) {
                dockerSHACell.textContent = '';
              } else if (dockerTags[0].sha === "error") {
                dockerSHACell.textContent = 'N/A';
              } else {
                  const dockerSHALink = document.createElement('a');
                  const docker = "docker";
                  dockerSHALink.href = `manifest-sha.html?release=${encodeURIComponent(releaseName)}&dq=${encodeURIComponent(docker)}`
                  dockerSHALink.textContent = dockerTags[0].sha.replace('sha256:', '').substring(0, 12);
                  dockerSHACell.appendChild(dockerSHALink);
              }
              releaseRow.appendChild(dockerSHACell);

              const baseImageCVECell = document.createElement('td');
              const baseImageCVELink = document.createElement('a');

              if (!baseImage || (!baseImage.cve && !baseImage.severity_link)) {
                baseImageCVECell.textContent = '';
              } else {
                baseImageCVELink.href = baseImage.severity_link || baseImage.cve;
              
                if (Array.isArray(baseImage.severity) && baseImage.severity.length > 0) {
                  const baseImageC = String(baseImage.severity[0].C ?? 0);
                  const baseImageH = String(baseImage.severity[0].H ?? 0);
                  const baseImageM = String(baseImage.severity[0].M ?? 0);
                  const baseImageL = String(baseImage.severity[0].L ?? 0);
                  const baseImageU = String(baseImage.severity[0].U ?? 0);

                  let severityType = 'GRYPE';
                  let severityTypeClass = 'severity_type_grype';
                  if (baseImage.severity_type) {
                    severityType = baseImage.severity_type;
                    if (severityType.toLowerCase() === 'quay') {
                      severityTypeClass = 'severity_type_quay';
                      if (baseImage.severity_link) {
                        baseImageCVELink.href = baseImage.severity_link;
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
                } else if (baseImage.base_cve_error === 'Scanning Queued in Quay'){
                  let severityType = 'QUAY';
                  let severityTypeClass = 'severity_type_quay';
                  if (baseImage.severity_type) {
                    severityType = baseImage.severity_type;
                    if (severityType.toLowerCase() === 'quay') {
                      severityTypeClass = 'severity_type_quay';
                      if (baseImage.severity_link) {
                        baseImageCVELink.href = baseImage.severity_link;
                      }
                    }
                  }
                  severityType = severityType.toUpperCase()
                  const cveText = ` <div class="${severityTypeClass}">${severityType}</div>
                                    <hr>
                                    <span>Queued</span><br>`;
                  baseImageCVELink.innerHTML = cveText;
                  baseImageCVECell.appendChild(baseImageCVELink);
                } else if (baseImage.cve) {
                  baseImageCVELink.textContent = 'CVE';
                  baseImageCVECell.appendChild(baseImageCVELink);
                }
              }
              releaseRow.appendChild(baseImageCVECell);

              const baseImageSHACell = document.createElement('td');
              const baseImageSHALink = document.createElement('a');
              if (!baseImage || !baseImage.sha) {
                baseImageSHACell.textContent = '';
              } else {
              baseImageSHALink.textContent = baseImage.sha.replace('sha256:', '').substring(0, 12);
              baseImageSHACell.appendChild(baseImageSHALink);
              }
              releaseRow.appendChild(baseImageSHACell);

              const sbomCell = document.createElement('td');
              if (image.sbom) {
                const sbomLink = document.createElement('a');
                sbomLink.href = image.sbom;
                sbomLink.textContent = 'SBoM';
                sbomCell.appendChild(sbomLink);
              }
              releaseRow.appendChild(sbomCell);

              const cveCell = document.createElement('td');
              if (image.cve || image.severity_link) {
                const cveLink = document.createElement('a');
                cveLink.href = image.severity_link || image.cve;
                if (Array.isArray(image.severity) && image.severity.length > 0) {
                  const C = String(image.severity[0].C ?? 0);
                  const H = String(image.severity[0].H ?? 0);
                  const M = String(image.severity[0].M ?? 0);
                  const L = String(image.severity[0].L ?? 0);
                  const U = String(image.severity[0].U ?? 0);
                
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
                let severityType = 'QUAY';
                let severityTypeClass = 'severity_type_quay';
                if (image.severity_type) {
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
                } else if (image.cve) {
                  cveLink.textContent = 'CVE';
                  cveCell.appendChild(cveLink);
                }
              }
              releaseRow.appendChild(cveCell);
              

              const buildLogsCell = document.createElement('td');
              if (image['build-logs']) {
                const buildLogsLink = document.createElement('a');
                buildLogsLink.href = image['build-logs'];
                if (image['build-time'] !== undefined) {
                  buildLogsLink.textContent = image['build-time'];
                } else {
                  buildLogsLink.textContent = 'Build Logs';
                }
                buildLogsCell.appendChild(buildLogsLink);
              }
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
            for (const specialRow of [aciConCert, aciConWeb, aciConHostOvscni, accProcOpRow]) {
              if (specialRow) {
                tableBody.appendChild(specialRow);
              }
            }
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
