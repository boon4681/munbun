import type { JSONContent } from '@tiptap/core';
export interface MarkType {
    [key: string]: any;
    type: string;
    attrs?: Record<string, any> | undefined;
}
declare const allowedSpacers: readonly ["sm", "md", "lg", "xl"];
export type AllowedSpacers = (typeof allowedSpacers)[number];
export interface ThemeOptions {
    colors?: Partial<{
        heading: string;
        paragraph: string;
        horizontal: string;
        footer: string;
        blockquoteBorder: string;
        codeBackground: string;
        codeText: string;
        linkCardTitle: string;
        linkCardDescription: string;
        linkCardBadgeText: string;
        linkCardBadgeBackground: string;
        linkCardSubTitle: string;
    }>;
    fontSize?: Partial<{
        paragraph: string;
        footer: {
            size: string;
            lineHeight: string;
        };
    }>;
}
export interface MailyConfig {
    /**
     * The preview text is the snippet of text that is pulled into the inbox
     * preview of an email client, usually right after the subject line.
     *
     * Default: `undefined`
     */
    preview?: string;
    /**
     * The theme object allows you to customize the colors and font sizes of the
     * rendered email.
     *
     * Default:
     * ```js
     * {
     *   colors: {
     *     heading: '#111827',
     *     paragraph: '#374151',
     *     horizontal: '#EAEAEA',
     *     footer: '#64748B',
     *   },
     *   fontSize: {
     *     paragraph: '15px',
     *     footer: {
     *       size: '14px',
     *       lineHeight: '24px',
     *     },
     *   },
     * }
     * ```
     *
     * @example
     * ```js
     * const maily = new Maily(content, {
     *   theme: {
     *     colors: {
     *       heading: '#111827',
     *     },
     *     fontSize: {
     *       footer: {
     *         size: '14px',
     *         lineHeight: '24px',
     *       },
     *     },
     *   },
     * });
     * ```
     */
    theme?: Partial<ThemeOptions>;
}
export declare const DEFAULT_SECTION_BACKGROUND_COLOR = "#ffffff";
export declare const DEFAULT_SECTION_ALIGN = "left";
export declare const DEFAULT_SECTION_BORDER_WIDTH = 1;
export declare const DEFAULT_SECTION_BORDER_COLOR = "#000000";
export declare const DEFAULT_SECTION_MARGIN_TOP = 0;
export declare const DEFAULT_SECTION_MARGIN_RIGHT = 0;
export declare const DEFAULT_SECTION_MARGIN_BOTTOM = 0;
export declare const DEFAULT_SECTION_MARGIN_LEFT = 0;
export declare const DEFAULT_SECTION_PADDING_TOP = 5;
export declare const DEFAULT_SECTION_PADDING_RIGHT = 5;
export declare const DEFAULT_SECTION_PADDING_BOTTOM = 5;
export declare const DEFAULT_SECTION_PADDING_LEFT = 5;
export declare const DEFAULT_COLUMNS_WIDTH = "100%";
export declare const DEFAULT_COLUMNS_GAP = 8;
export declare const DEFAULT_COLUMN_BACKGROUND_COLOR = "transparent";
export declare const DEFAULT_COLUMN_BORDER_RADIUS = 0;
export declare const DEFAULT_COLUMN_BORDER_WIDTH = 0;
export declare const DEFAULT_COLUMN_BORDER_COLOR = "transparent";
export declare const DEFAULT_COLUMN_PADDING_TOP = 0;
export declare const DEFAULT_COLUMN_PADDING_RIGHT = 0;
export declare const DEFAULT_COLUMN_PADDING_BOTTOM = 0;
export declare const DEFAULT_COLUMN_PADDING_LEFT = 0;
export declare const LINK_PROTOCOL_REGEX: RegExp;
export interface RenderOptions {
    /**
     * The options object allows you to customize the output of the rendered
     * email.
     * - `pretty` - If `true`, the output will be formatted with indentation and
     *  line breaks.
     * - `plainText` - If `true`, the output will be plain text instead of HTML.
     * This is useful for testing purposes.
     *
     * Default: `pretty` - `false`, `plainText` - `false`
     */
    pretty?: boolean;
    plainText?: boolean;
}
export type VariableFormatter = (options: {
    variable: string;
    fallback?: string;
}) => string;
export type VariableValues = Map<string, string>;
export type LinkValues = Map<string, string>;
export type PayloadValue = Record<string, any> | boolean;
export type PayloadValues = Map<string, PayloadValue>;
export declare class Maily {
    private readonly content;
    private config;
    private variableFormatter;
    private shouldReplaceVariableValues;
    private variableValues;
    private linkValues;
    private openTrackingPixel;
    private payloadValues;
    private marksOrder;
    constructor(content?: JSONContent);
    setPreviewText(preview?: string): void;
    setTheme(theme: Partial<ThemeOptions>): void;
    setVariableFormatter(formatter: VariableFormatter): void;
    /**
     * `setVariableValue` will set the variable value.
     * It will also set `shouldReplaceVariableValues` to `true`.
     *
     * @param variable - The variable name
     * @param value - The variable value
     */
    setVariableValue(variable: string, value: string): void;
    /**
     * `setVariableValues` will set the variable values.
     * It will also set `shouldReplaceVariableValues` to `true`.
     *
     * @param values - The variable values
     *
     * @example
     * ```js
     * const maily = new Maily(content);
     * maily.setVariableValues({
     *  name: 'John Doe',
     *  email: 'john@doe.com',
     * });
     * ```
     */
    setVariableValues(values: Record<string, string>): void;
    setLinkValue(link: string, value: string): void;
    setLinkValues(values: Record<string, string>): void;
    setPayloadValue(key: string, value: PayloadValue): void;
    setPayloadValues(values: Record<string, PayloadValue>): void;
    /**
     * `setOpenTrackingPixel` will set the open tracking pixel.
     *
     * @param pixel - The open tracking pixel
     */
    setOpenTrackingPixel(pixel?: string): void;
    /**
     * `setShouldReplaceVariableValues` will determine whether to replace the
     * variable values or not. Otherwise, it will just return the formatted variable.
     *
     * Default: `false`
     */
    setShouldReplaceVariableValues(shouldReplace: boolean): void;
    getAllLinks(): Set<string>;
    private isValidUrl;
    render(options?: RenderOptions): Promise<string>;
    /**
     * `markup` will render the JSON content into React Email markup.
     * and return the raw React Tree.
     */
    markup(): import("react").JSX.Element;
    private getMarginOverrideConditions;
    private getMappedContent;
    private renderNode;
    private renderMark;
    private paragraph;
    private text;
    private bold;
    private italic;
    private underline;
    private strike;
    private textStyle;
    private link;
    private removeLinkProtocol;
    private variableUrlValue;
    private heading;
    private variable;
    private horizontalRule;
    private orderedList;
    private bulletList;
    private listItem;
    private button;
    private spacer;
    private hardBreak;
    private logo;
    private image;
    private footer;
    private blockquote;
    private code;
    private linkCard;
    private section;
    private columns;
    private adjustColumnsContent;
    private column;
    private for;
    private shouldShow;
}
export {};
