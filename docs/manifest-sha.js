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
fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    console.log("Parsed YAML file 'release_artifacts/releases.yaml':", parsedData);

    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const releaseName = urlParams.get('release');
    const releaseTag = releaseName.replace(/(\.z|rc[0-9]+)$/, '');
    const imageRegistry = urlParams.get('dq'); // Should be either "quay" or "docker"

    // Define the registry domain based on the imageRegistry value
    let registryDomain = '';
    if (imageRegistry === 'docker') {
      registryDomain = 'docker.io';
    } else if (imageRegistry === 'quay') {
      registryDomain = 'quay.io';
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

    // Fill the image prefix
    const imagePrefixElement = document.getElementById('image-prefix');
    imagePrefixElement.textContent = imageRegistry;

     // Generate the code for the code box
     let codeContent = `registry:\n`;
     codeContent += `  use_digest: true\n`;
     codeContent += `  image_prefix: ${registryDomain}/noiro \n`;
 
     let imageIndex = 1;
     for (const image of releaseData.container_images) {
       let sha = '';
       if (imageRegistry === 'docker' && image.docker.length > 0) {
         sha = image.docker[0].sha.replace('sha256:', '');
       } else if (imageRegistry === 'quay' && image.quay.length > 0) {
         sha = image.quay[0].sha.replace('sha256:', '');
       }
 
       const imageNameVersion = `${image.name}_version: ${sha}\n`;
       codeContent += `  ${imageNameVersion}`;
       imageIndex++;
     }
 
     // Set the generated code to the code box
     const codeBox = document.getElementById('code-box');
     codeBox.textContent = codeContent;
  })
  .catch(error => {
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
