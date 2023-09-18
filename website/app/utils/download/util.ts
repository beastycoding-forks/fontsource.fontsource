interface Version {
	version: string;
}

interface JSDelivrAPIVersion {
	versions?: Version[];
}

export const getAvailableVersions = async (id: string): Promise<string[]> => {
	const resp = await fetch(
		`https://data.jsdelivr.com/v1/packages/npm/@fontsource/${id}`,
	);

	if (!resp.ok) {
		throw new Response('Internal Server Error. Unable to fetch versions.', {
			status: 500,
		});
	}

	const list = (await resp.json()) as JSDelivrAPIVersion;
	if (resp.status === 404 || !list?.versions) {
		throw new Response(`Not Found. ${id} does not exist.`, { status: 404 });
	}

	const versions = list.versions.map((version) => version.version);

	return versions;
};

export const getVersion = async (id: string, tag: string): Promise<string> => {
	const versions = await getAvailableVersions(id);

	if (tag === 'latest') {
		// Get latest version in list
		const latest = versions
			.sort((a, b) => {
				const aMajor = a.split('.')[0];
				const bMajor = b.split('.')[0];
				const aMinor = a.split('.')[1];
				const bMinor = b.split('.')[1];
				const aPatch = a.split('.')[2];
				const bPatch = b.split('.')[2];
				if (aMajor > bMajor) return -1;
				if (aMajor < bMajor) return 1;
				if (aMinor > bMinor) return -1;
				if (aMinor < bMinor) return 1;
				if (aPatch > bPatch) return -1;
				if (aPatch < bPatch) return 1;
				return 0;
			})
			.shift();

		if (latest) return latest;
		throw new Response(`Not found. Version ${tag} not found for ${id}.`, {
			status: 404,
		});
	}

	const semver = tag.split('.');

	// If the tag is a full semver, return it
	if (semver.length === 3) {
		const version = versions.find((version) => version === tag);
		if (version) return version;
		throw new Response(`Not found. Version ${tag} not found for ${id}.`, {
			status: 404,
		});
	}

	// Find latest version that matches the minor version
	if (semver.length === 2) {
		const [major, minor] = semver;

		const version = versions
			// Filter out the major and minor versions that don't match
			.filter((version) => version.startsWith(`${major}.${minor}`))
			// Sort the versions in descending order
			.sort((a, b) => {
				const aPatch = a.split('.')[2];
				const bPatch = b.split('.')[2];
				if (aPatch > bPatch) return -1;
				if (aPatch < bPatch) return 1;
				return 0;
			})
			// Return the first version
			.shift();

		if (version) return version;
		throw new Response(`Not found. Version ${tag} not found for ${id}.`, {
			status: 404,
		});
	}

	// Find latest version that matches the major version
	if (semver.length === 1) {
		const [major] = semver;

		const version = versions
			.filter((version) => version.startsWith(`${major}.`))
			// Sort the versions in descending order
			.sort((a, b) => {
				const aMinor = a.split('.')[1];
				const bMinor = b.split('.')[1];
				const aPatch = a.split('.')[2];
				const bPatch = b.split('.')[2];
				if (aMinor > bMinor) return -1;
				if (aMinor < bMinor) return 1;
				if (aPatch > bPatch) return -1;
				if (aPatch < bPatch) return 1;
				return 0;
			})
			// Return the first version
			.shift();

		if (version) return version;
		throw new Response(`Not found. Version ${tag} not found for ${id}.`, {
			status: 404,
		});
	}

	throw new Response(`Bad Request. Invalid tag ${tag} for ${id}.`, {
		status: 400,
	});
};

interface Tag {
	id: string;
	version: string;
}

export const splitTag = async (tag: string): Promise<Tag> => {
	// Parse tag for version e.g roboto@1.1.1
	const [id, versionTag] = tag.split('@');
	if (!id) {
		throw new Response('Bad Request. Unable to parse font ID from tag.', {
			status: 400,
		});
	}
	if (!versionTag) {
		throw new Response('Bad Request. Unable to parse version from tag.', {
			status: 400,
		});
	}

	// Validate version tag
	const version = await getVersion(id, versionTag);

	return { id, version };
};