import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { useMemo } from 'react';

import type { FrontMatter } from '@/utils/mdx/esbuild.server';
import { getMDXComponent } from '@/utils/mdx/getMdxComponent';
import { fetchMdx } from '@/utils/mdx/mdx.server';
import { ogMeta } from '@/utils/meta';

interface LoaderData {
	code: string;
	frontmatter: FrontMatter;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const route = params['*'];
	if (!route) {
		throw new Response('Not found', { status: 404 });
	}

	// Redirect sections to their first child
	if (route === 'getting-started' || route === 'getting-started/')
		return redirect('/docs/getting-started/introduction');
	if (route === 'guides' || route === 'guides/')
		return redirect('/docs/guides/angular');
	if (route === 'api' || route === 'api/')
		return redirect('/docs/api/introduction');

	const mdx = await fetchMdx(route);
	if (!mdx) {
		throw new Response('Not found', { status: 404 });
	}

	return json<LoaderData>({ code: mdx.code, frontmatter: mdx.frontmatter });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const frontmatter = data?.frontmatter as FrontMatter | undefined;
	const title = frontmatter?.title
		? `${frontmatter.title} | Documentation | Fontsource`
		: 'Documentation | Fontsource';
	const description = frontmatter?.description;

	return ogMeta({ title, description });
};

export default function Docs() {
	const mdxComponents = useOutletContext();
	const { code } = useLoaderData<LoaderData>();

	const Content = useMemo(() => getMDXComponent(code), [code]);
	return (
		<>
			<Content components={mdxComponents} />
		</>
	);
}
