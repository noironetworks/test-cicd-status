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

fetch('release_artifacts/releases.yaml')
  .then(response => response.text())
  .then(data => {
    const parsedData = jsyaml.load(data);
    const params = new URLSearchParams(window.location.search);
    const release = params.get('release');
    const releaseTag = release?.replace(/(\.z|\.rc[0-9]+)$/, '');
    const registry = params.get('dq');
    const stream = parsedData.releases
      .find(item => item.release_tag === releaseTag)
      ?.release_streams.find(item => item.release_name === release);
    const manifest = release !== releaseTag || stream?.released !== false
      ? registryEvidence.manifest(stream?.container_images, registry)
      : null;
    const codeBox = document.getElementById('code-box');
    if (!manifest) {
      codeBox.textContent = 'Manifest unavailable. This release needs a digest for every image from the same registry namespace.';
      return;
    }

    document.getElementById('image-prefix').textContent = manifest.prefix;
    const lines = ['registry:', '  use_digest: true', `  image_prefix: ${manifest.prefix}`];
    for (const record of manifest.records) {
      lines.push(`  ${record.name}_version: ${record.digest}`);
    }
    codeBox.textContent = lines.join('\n') + '\n';
    document.getElementById('copy-manifest').disabled = false;
  })
  .catch(error => {
    document.getElementById('code-box').textContent = 'Manifest unavailable. Release data could not be loaded.';
    console.error("Error loading YAML file 'release_artifacts/releases.yaml':", error);
  });
