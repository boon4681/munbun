import { createTheme } from 'thememirror';
import { tags as t } from '@lezer/highlight';

export const github_dark_fake = createTheme({
	variant: 'dark',
	settings: {
		background: '#27272a',
		foreground: '#b3b3bd',
		caret: '#ffffff',
		selection: '#036dd626',
		lineHighlight: '#8a91991a',
		gutterBackground: '#27272a',
		gutterForeground: '#8e8e8e',
	},
	styles: [
		{
			tag: t.comment,
			color: '#707070',
		},
		{
			tag: t.variableName,
			color: '#a1a2aa',
		},
		{
			tag: [t.string, t.special(t.brace)],
			color: '#73b3f2',
		},
		{
			tag: t.number,
			color: '#57abff',
		},
		{
			tag: t.bool,
			color: '#5ba1ec',
		},
		{
			tag: t.null,
			color: '#d25b5b',
		},
		{
			tag: t.keyword,
			color: '#ce5a5a',
		},
		{
			tag: t.operator,
			color: '#d26565',
		},
		{
			tag: t.className,
			color: '#dda169',
		},
		{
			tag: t.definition(t.typeName),
			color: '#73a8de',
		},
		{
			tag: t.typeName,
			color: '#619edb',
		},
		{
			tag: t.angleBracket,
			color: '#e6e6e6',
		},
		{
			tag: t.tagName,
			color: '#bfbfbf',
		},
		{
			tag: t.attributeName,
			color: '#b8b8b8',
		},
	],
});