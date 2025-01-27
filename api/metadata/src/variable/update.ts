import {
	type VariableMetadata,
	type VariableMetadataWithVariants,
} from 'common-api/types';
import { StatusError } from 'itty-router';

import {
	AXIS_REGISTRY_URL,
	KV_TTL,
	VARIABLE_ICONS_URL,
	VARIABLE_URL,
} from '../utils';
import { type AxisRegistry, type AxisRegistryDownload } from './types';

export const updateVariableList = async (env: Env, ctx: ExecutionContext) => {
	const resp = await fetch(VARIABLE_URL);
	if (!resp.ok) {
		const text = await resp.text();
		throw new StatusError(
			resp.status,
			`Failed to fetch variable metadata list. ${text}`,
		);
	}
	const data = (await resp.json()) as Record<
		string,
		VariableMetadataWithVariants
	>;

	const respIcons = await fetch(VARIABLE_ICONS_URL);
	if (!respIcons.ok) {
		const text = await respIcons.text();
		throw new StatusError(
			respIcons.status,
			`Failed to fetch variable icons metadata list. ${text}`,
		);
	}
	const dataIcons = (await respIcons.json()) as Record<
		string,
		VariableMetadataWithVariants
	>;

	const dataMerged = { ...data, ...dataIcons };

	// Remove variants property from all fonts
	const noVariants: Record<string, VariableMetadata> = {};
	for (const [key, value] of Object.entries(dataMerged)) {
		const { axes, family } = value;
		noVariants[key] = { axes, family };
	}

	// Save entire metadata into KV first
	ctx.waitUntil(
		env.VARIABLE_LIST.put('metadata', JSON.stringify(noVariants), {
			metadata: {
				// We need to set a custom ttl for a stale-while-revalidate strategy
				ttl: Date.now() / 1000 + KV_TTL,
			},
		}),
	);

	return noVariants;
};

export const updateVariable = async (
	id: string,
	env: Env,
	ctx: ExecutionContext,
) => {
	// Fetch from KV store
	let data = await env.VARIABLE_LIST.get<Record<string, VariableMetadata>>(id, {
		type: 'json',
	});
	if (!data) {
		data = await updateVariableList(env, ctx);
	}

	const dataId = data[id];
	if (!dataId) {
		throw new StatusError(404, `Variable ${id} not found.`);
	}

	const noVariants: VariableMetadata = {
		family: dataId.family,
		axes: dataId.axes,
	};

	// Save entire metadata into KV first
	ctx.waitUntil(
		env.VARIABLE.put(id, JSON.stringify(noVariants), {
			metadata: {
				// We need to set a custom ttl for a stale-while-revalidate strategy
				ttl: Date.now() / 1000 + KV_TTL,
			},
		}),
	);

	return noVariants;
};

export const updateAxisRegistry = async (env: Env, ctx: ExecutionContext) => {
	const resp = await fetch(AXIS_REGISTRY_URL);
	if (!resp.ok) {
		const text = await resp.text();
		throw new StatusError(
			resp.status,
			`Failed to fetch axis registry metadata. ${text}`,
		);
	}
	const data = (await resp.json()) as AxisRegistryDownload;

	const registry: AxisRegistry = {};
	// Remove tag property from all fonts and use it as a key
	for (const item of data) {
		const { tag, ...rest } = item;
		registry[tag] = rest;
	}

	// Save entire metadata into KV first
	ctx.waitUntil(
		env.VARIABLE.put('axis_registry', JSON.stringify(registry), {
			metadata: {
				// We need to set a custom ttl for a stale-while-revalidate strategy
				ttl: Date.now() / 1000 + KV_TTL,
			},
		}),
	);

	return registry;
};
