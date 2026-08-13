// Function to copy the code in the code box to the clipboard
function copyCodeToClipboard() {
    const codeBox = document.getElementById('code-box');
    const textToCopy = codeBox.textContent;
  
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
  }

// Fetch the YAML file and load the data
fetch('release_artifacts/releases.yaml', { cache: 'no-store' })
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    if (!releaseName) {
      throw new Error('Missing required release query parameter.');
    }
    const releaseTag = releaseName.replace(/(\.z|.rc[0-9]+)$/, '');
    console.log('releaseTag', releaseTag);
    const imageRegistry = urlParams.get('dq'); // Should be either "quay" or "docker"

    if (imageRegistry !== 'docker' && imageRegistry !== 'quay') {
      throw new Error('Registry query parameter must be either "quay" or "docker".');
    }
 
    // Find the specific release data
    const releaseTagData = parsedData.releases.find(release => release.release_tag === releaseTag);
    if (!releaseTagData) {
      console.error(`Release with tag "${releaseTag}" not found.`);
      return;
    }
    const releaseData = releaseTagData.release_streams.find(release => release.release_name === releaseName);
    if (!releaseData) {
      console.error(`Release with name "${releaseName}" not found.`);
      return;
    }

    const legacyRegistryPrefixes = {
      docker: 'docker.io/noiro',
      quay: 'quay.io/noiro'
    };
    const configuredRegistryPrefixes = releaseData.registry_prefixes || {};
    const configuredRegistryPrefix = configuredRegistryPrefixes[imageRegistry];
    const registryPrefix = (typeof configuredRegistryPrefix === 'string' && configuredRegistryPrefix.trim())
      ? configuredRegistryPrefix.trim().replace(/\/$/, '')
      : legacyRegistryPrefixes[imageRegistry];

    // Fill the image prefix
    const imagePrefixElement = document.getElementById('image-prefix');
    imagePrefixElement.textContent = registryPrefix;

     // Generate the code for the code box
     let codeContent = `registry:\n`;
     codeContent += `  use_digest: true\n`;
     codeContent += `  image_prefix: ${registryPrefix} \n`;
 
     for (const image of (releaseData.container_images || [])) {
       const dockerTags = Array.isArray(image.docker) ? image.docker : [];
       const quayTags = Array.isArray(image.quay) ? image.quay : [];
       let sha = '';
       if (imageRegistry === 'docker' && dockerTags[0] && dockerTags[0].sha) {
         sha = dockerTags[0].sha.replace('sha256:', '');
       } else if (imageRegistry === 'quay' && quayTags[0] && quayTags[0].sha) {
         sha = quayTags[0].sha.replace('sha256:', '');
       }

       if (sha && sha !== 'error') {
         const imageNameVersion = `${image.name}_version: ${sha}\n`;
         codeContent += `  ${imageNameVersion}`;
       }
     }
 
     // Set the generated code to the code box
     const codeBox = document.getElementById('code-box');
     codeBox.textContent = codeContent;
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
