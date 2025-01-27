import type { CodeProps } from '@mantine/core';
import { Tabs } from '@mantine/core';

import { CodeHighlight, CodeWrapper } from './Code';
import classes from './PackageManagerCode.module.css';

interface PackageManagerProps extends Partial<CodeProps> {
	cmd: string;
}

export const PackageManagerCode = ({ cmd, ...props }: PackageManagerProps) => {
	const language = 'sh';
	return (
		<Tabs defaultValue="npm" className={classes.wrapper}>
			<Tabs.List>
				<Tabs.Tab value="npm">npm</Tabs.Tab>
				<Tabs.Tab value="yarn">yarn</Tabs.Tab>
				<Tabs.Tab value="pnpm">pnpm</Tabs.Tab>
			</Tabs.List>

			<div className={classes.panels}>
				<Tabs.Panel value="npm" pt="xs">
					{/* @ts-expect-error - Invalid typing for new v7 */}
					<CodeWrapper
						language={language}
						code={'npm install ' + cmd}
						{...props}
					>
						<CodeHighlight language={language} code={'npm install ' + cmd} />
					</CodeWrapper>
				</Tabs.Panel>
				<Tabs.Panel value="yarn" pt="xs">
					{/* @ts-expect-error - Invalid typing for new v7 */}
					<CodeWrapper language={language} code={'yarn add ' + cmd} {...props}>
						<CodeHighlight language={language} code={'yarn add ' + cmd} />
					</CodeWrapper>
				</Tabs.Panel>
				<Tabs.Panel value="pnpm" pt="xs">
					{/* @ts-expect-error - Invalid typing for new v7 */}
					<CodeWrapper language={language} code={'pnpm add ' + cmd} {...props}>
						<CodeHighlight language={language} code={'pnpm add ' + cmd} />
					</CodeWrapper>
				</Tabs.Panel>
			</div>
		</Tabs>
	);
};
