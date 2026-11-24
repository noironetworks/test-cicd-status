const registryEvidence = {
  tags(image, registry) {
    if (registry === 'quay' && Array.isArray(image.rehearsal) && image.rehearsal.length) {
      return image.rehearsal;
    }
    return Array.isArray(image[registry]) ? image[registry] : [];
  },

  digest(tag) {
    const sha = typeof tag?.sha === 'string' ? tag.sha.replace(/^sha256:/, '') : '';
    return /^[a-f0-9]{64}$/.test(sha) ? sha : null;
  },

  manifest(images, registry) {
    if (!['quay', 'docker'].includes(registry) || !Array.isArray(images) || !images.length) {
      return null;
    }
    const records = images.map(image => {
      const tag = registryEvidence.tags(image, registry)[0];
      let prefix = registry === 'quay' ? 'quay.io/noiro' : 'docker.io/noiro';
      if (registry === 'quay' && tag && tag === image.rehearsal?.[0]) {
        const link = /^https:\/\/(quay\.io\/[a-z0-9_-]+)\/([^/:?#]+):/.exec(tag.link);
        prefix = link && link[2] === image.name ? link[1] : null;
      }
      return { name: image.name, digest: registryEvidence.digest(tag), prefix };
    });
    const prefix = records[0].prefix;
    if (!prefix || records.some(record => !record.digest || record.prefix !== prefix)) {
      return null;
    }
    return { prefix, records };
  }
};
