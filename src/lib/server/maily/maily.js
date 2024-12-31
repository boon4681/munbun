import { Fragment } from 'react';
import { Text, Html, Head, Body, Font, Container, Link, Heading, Hr, Button, Img, Preview, Row, Column, Section, } from '@react-email/components';
import { renderAsync as reactEmailRenderAsync } from '@react-email/render';
import { deepMerge } from '@antfu/utils';
import { generateKey } from './utils';
import React from "react"
const allowedSpacers = ['sm', 'md', 'lg', 'xl'];
const spacers = {
    sm: '8px',
    md: '16px',
    lg: '32px',
    xl: '64px',
};
const antialiased = {
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
};
const allowedHeadings = ['h1', 'h2', 'h3'];
const headings = {
    h1: {
        fontSize: '28px',
        lineHeight: '32px',
        fontWeight: 800,
    },
    h2: {
        fontSize: '24px',
        lineHeight: '28px',
        fontWeight: 700,
    },
    h3: {
        fontSize: '20px',
        lineHeight: '24px',
        fontWeight: 600,
    },
};
const allowedLogoSizes = ['sm', 'md', 'lg'];
const logoSizes = {
    sm: '40px',
    md: '48px',
    lg: '64px',
};
const DEFAULT_RENDER_OPTIONS = {
    pretty: false,
    plainText: false,
};
const DEFAULT_THEME = {
    colors: {
        heading: '#111827',
        paragraph: '#374151',
        horizontal: '#EAEAEA',
        footer: '#64748B',
        blockquoteBorder: '#D1D5DB',
        codeBackground: '#EFEFEF',
        codeText: '#111827',
        linkCardTitle: '#111827',
        linkCardDescription: '#6B7280',
        linkCardBadgeText: '#111827',
        linkCardBadgeBackground: '#FEF08A',
        linkCardSubTitle: '#6B7280',
    },
    fontSize: {
        paragraph: '15px',
        footer: {
            size: '14px',
            lineHeight: '24px',
        },
    },
};
const CODE_FONT_FAMILY = 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
export const DEFAULT_SECTION_BACKGROUND_COLOR = '#ffffff';
export const DEFAULT_SECTION_ALIGN = 'left';
export const DEFAULT_SECTION_BORDER_WIDTH = 1;
export const DEFAULT_SECTION_BORDER_COLOR = '#000000';
export const DEFAULT_SECTION_MARGIN_TOP = 0;
export const DEFAULT_SECTION_MARGIN_RIGHT = 0;
export const DEFAULT_SECTION_MARGIN_BOTTOM = 0;
export const DEFAULT_SECTION_MARGIN_LEFT = 0;
export const DEFAULT_SECTION_PADDING_TOP = 5;
export const DEFAULT_SECTION_PADDING_RIGHT = 5;
export const DEFAULT_SECTION_PADDING_BOTTOM = 5;
export const DEFAULT_SECTION_PADDING_LEFT = 5;
export const DEFAULT_COLUMNS_WIDTH = '100%';
export const DEFAULT_COLUMNS_GAP = 8;
export const DEFAULT_COLUMN_BACKGROUND_COLOR = 'transparent';
export const DEFAULT_COLUMN_BORDER_RADIUS = 0;
export const DEFAULT_COLUMN_BORDER_WIDTH = 0;
export const DEFAULT_COLUMN_BORDER_COLOR = 'transparent';
export const DEFAULT_COLUMN_PADDING_TOP = 0;
export const DEFAULT_COLUMN_PADDING_RIGHT = 0;
export const DEFAULT_COLUMN_PADDING_BOTTOM = 0;
export const DEFAULT_COLUMN_PADDING_LEFT = 0;
export const LINK_PROTOCOL_REGEX = /https?:\/\//;
export class Maily {
    constructor(content = { type: 'doc', content: [] }) {
        this.config = {
            theme: DEFAULT_THEME,
        };
        this.variableFormatter = ({ variable, fallback }) => {
            return fallback
                ? `{{${variable},fallback=${fallback}}}`
                : `{{${variable}}}`;
        };
        this.shouldReplaceVariableValues = false;
        this.variableValues = new Map();
        this.linkValues = new Map();
        this.payloadValues = new Map();
        this.marksOrder = ['underline', 'bold', 'italic', 'textStyle', 'link'];
        this.content = content;
    }
    setPreviewText(preview) {
        this.config.preview = preview;
    }
    setTheme(theme) {
        this.config.theme = deepMerge(this.config.theme || DEFAULT_THEME, theme);
    }
    setVariableFormatter(formatter) {
        this.variableFormatter = formatter;
    }
    /**
     * `setVariableValue` will set the variable value.
     * It will also set `shouldReplaceVariableValues` to `true`.
     *
     * @param variable - The variable name
     * @param value - The variable value
     */
    setVariableValue(variable, value) {
        if (!this.shouldReplaceVariableValues) {
            this.shouldReplaceVariableValues = true;
        }
        this.variableValues.set(variable, value);
    }
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
    setVariableValues(values) {
        if (!this.shouldReplaceVariableValues) {
            this.shouldReplaceVariableValues = true;
        }
        Object.entries(values).forEach(([variable, value]) => {
            this.setVariableValue(variable, value);
        });
    }
    setLinkValue(link, value) {
        this.linkValues.set(link, value);
    }
    setLinkValues(values) {
        Object.entries(values).forEach(([link, value]) => {
            this.setLinkValue(link, value);
        });
    }
    setPayloadValue(key, value) {
        if (!this.shouldReplaceVariableValues) {
            this.shouldReplaceVariableValues = true;
        }
        this.payloadValues.set(key, value);
    }
    setPayloadValues(values) {
        Object.entries(values).forEach(([key, value]) => {
            this.setPayloadValue(key, value);
        });
    }
    /**
     * `setOpenTrackingPixel` will set the open tracking pixel.
     *
     * @param pixel - The open tracking pixel
     */
    setOpenTrackingPixel(pixel) {
        this.openTrackingPixel = pixel;
    }
    /**
     * `setShouldReplaceVariableValues` will determine whether to replace the
     * variable values or not. Otherwise, it will just return the formatted variable.
     *
     * Default: `false`
     */
    setShouldReplaceVariableValues(shouldReplace) {
        this.shouldReplaceVariableValues = shouldReplace;
    }
    getAllLinks() {
        const nodes = this.content.content || [];
        const links = new Set();
        const isValidLink = (href) => {
            return (href &&
                this.isValidUrl(href) &&
                !href.startsWith('#') &&
                !href.startsWith('mailto:') &&
                !href.startsWith('tel:') &&
                typeof href === 'string');
        };
        const extractLinksFromNode = (node) => {
            var _a;
            if (node.type === 'button') {
                const originalLink = (_a = node.attrs) === null || _a === void 0 ? void 0 : _a.url;
                if (isValidLink(originalLink) && originalLink) {
                    links.add(originalLink);
                }
            }
            else if (node.content) {
                node.content.forEach((childNode) => {
                    if (childNode.marks) {
                        childNode.marks.forEach((mark) => {
                            var _a;
                            const originalLink = (_a = mark.attrs) === null || _a === void 0 ? void 0 : _a.href;
                            if (mark.type === 'link' && isValidLink(originalLink)) {
                                links.add(originalLink);
                            }
                        });
                    }
                    if (childNode.content) {
                        extractLinksFromNode(childNode);
                    }
                });
            }
        };
        nodes.forEach((childNode) => {
            extractLinksFromNode(childNode);
        });
        return links;
    }
    isValidUrl(href) {
        try {
            const _ = new URL(href);
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async render(options = DEFAULT_RENDER_OPTIONS) {
        const markup = this.markup();
        return reactEmailRenderAsync(markup, options);
    }
    /**
     * `markup` will render the JSON content into React Email markup.
     * and return the raw React Tree.
     */
    markup() {
        const nodes = this.content.content || [];
        const jsxNodes = nodes.map((node, index) => {
            const nodeOptions = {
                prev: nodes[index - 1],
                next: nodes[index + 1],
                parent: node,
            };
            const component = this.renderNode(node, nodeOptions);
            if (!component) {
                return null;
            }
            return React.createElement(Fragment, { key: generateKey() }, component);
        });
        const { preview } = this.config;
        const markup = (React.createElement(Html, null,
            React.createElement(Head, null,
                React.createElement(Font, { fallbackFontFamily: "sans-serif", fontFamily: "Inter", fontStyle: "normal", fontWeight: 400, webFont: {
                        url: 'https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19',
                        format: 'woff2',
                    } }),
                React.createElement("style", { dangerouslySetInnerHTML: {
                        __html: `blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}@media only screen and (max-width:425px){.tab-row-full{width:100%!important}.tab-col-full{display:block!important;width:100%!important}.tab-pad{padding:0!important}}`,
                    } }),
                React.createElement("meta", { content: "width=device-width", name: "viewport" }),
                React.createElement("meta", { content: "IE=edge", httpEquiv: "X-UA-Compatible" }),
                React.createElement("meta", { name: "x-apple-disable-message-reformatting" }),
                React.createElement("meta", { 
                    // http://www.html-5.com/metatags/format-detection-meta-tag.html
                    // It will prevent iOS from automatically detecting possible phone numbers in a block of text
                    content: "telephone=no,address=no,email=no,date=no,url=no", name: "format-detection" }),
                React.createElement("meta", { content: "light", name: "color-scheme" }),
                React.createElement("meta", { content: "light", name: "supported-color-schemes" })),
            React.createElement(Body, { style: {
                    margin: 0,
                } },
                preview ? (React.createElement(Preview, { id: "__react-email-preview" }, preview)) : null,
                React.createElement(Container, { style: {
                        maxWidth: '600px',
                        minWidth: '300px',
                        width: '100%',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        padding: '0.5rem',
                    } }, jsxNodes),
                this.openTrackingPixel ? (React.createElement(Img, { alt: "", src: this.openTrackingPixel, style: {
                        display: 'none',
                        width: '1px',
                        height: '1px',
                    } })) : null)));
        return markup;
    }
    getMarginOverrideConditions(node, options) {
        const { parent, prev, next } = options || {};
        const isNextSpacer = (next === null || next === void 0 ? void 0 : next.type) === 'spacer';
        const isPrevSpacer = (prev === null || prev === void 0 ? void 0 : prev.type) === 'spacer';
        const isParentListItem = (parent === null || parent === void 0 ? void 0 : parent.type) === 'listItem';
        const isLastSectionElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'section' && !next;
        const isFirstSectionElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'section' && !prev;
        const isLastColumnElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'column' && !next;
        const isFirstColumnElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'column' && !prev;
        const isFirstForElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'for' && !prev;
        const isLastForElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'for' && !next;
        const isFirstShowElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'show' && !prev;
        const isLastShowElement = (parent === null || parent === void 0 ? void 0 : parent.type) === 'show' && !next;
        return {
            isNextSpacer,
            isPrevSpacer,
            isLastSectionElement,
            isFirstSectionElement,
            isParentListItem,
            isLastColumnElement,
            isFirstColumnElement,
            isFirstForElement,
            isLastForElement,
            isFirstShowElement,
            isLastShowElement,
            shouldRemoveTopMargin: isPrevSpacer ||
                isFirstSectionElement ||
                isFirstColumnElement ||
                isFirstForElement ||
                isFirstShowElement,
            shouldRemoveBottomMargin: isNextSpacer ||
                isLastSectionElement ||
                isLastColumnElement ||
                isLastForElement ||
                isLastShowElement,
        };
    }
    // `getMappedContent` will call corresponding node type
    // and return text content
    getMappedContent(node, options) {
        const allNodes = node.content || [];
        return allNodes
            .map((childNode, index) => {
            const component = this.renderNode(childNode, Object.assign(Object.assign({}, options), { next: allNodes[index + 1], prev: allNodes[index - 1] }));
            if (!component) {
                return null;
            }
            return React.createElement(Fragment, { key: generateKey() }, component);
        })
            .filter((n) => n !== null);
    }
    // `renderNode` will call the method of the corresponding node type
    renderNode(node, options = {}) {
        var _a;
        const type = node.type || '';
        if (type in this) {
            // @ts-expect-error - `this` is not assignable to type 'never'
            return (_a = this[type]) === null || _a === void 0 ? void 0 : _a.call(this, node, options);
        }
        throw new Error(`Node type "${type}" is not supported.`);
    }
    // `renderMark` will call the method of the corresponding mark type
    renderMark(node, options) {
        // It will wrap the text with the corresponding mark type
        const text = (node === null || node === void 0 ? void 0 : node.text) || React.createElement(React.Fragment, null, "\u00A0");
        let marks = (node === null || node === void 0 ? void 0 : node.marks) || [];
        // sort the marks by uderline, bold, italic, textStyle, link
        // so that the text will be wrapped in the correct order
        marks.sort((a, b) => {
            return this.marksOrder.indexOf(a.type) - this.marksOrder.indexOf(b.type);
        });
        return marks.reduce((acc, mark) => {
            var _a;
            const type = mark.type;
            if (type in this) {
                // @ts-expect-error - `this` is not assignable to type 'never'
                return (_a = this[type]) === null || _a === void 0 ? void 0 : _a.call(this, mark, acc);
            }
            throw new Error(`Mark type "${type}" is not supported.`);
        }, React.createElement(React.Fragment, null, text));
    }
    paragraph(node, options) {
        var _a, _b, _c, _d;
        const { attrs } = node;
        const alignment = (attrs === null || attrs === void 0 ? void 0 : attrs.textAlign) || 'left';
        const { isParentListItem, shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        return (React.createElement(Text, { style: Object.assign({ textAlign: alignment, marginBottom: isParentListItem || shouldRemoveBottomMargin ? '0px' : '20px', marginTop: '0px', fontSize: (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.fontSize) === null || _b === void 0 ? void 0 : _b.paragraph, color: (_d = (_c = this.config.theme) === null || _c === void 0 ? void 0 : _c.colors) === null || _d === void 0 ? void 0 : _d.paragraph }, antialiased) }, node.content ? (this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node }))) : (React.createElement(React.Fragment, null, "\u00A0"))));
    }
    text(node, options) {
        const text = node.text || '&nbsp';
        if (node.marks) {
            return this.renderMark(node, options);
        }
        return React.createElement(React.Fragment, null, text);
    }
    bold(_, text) {
        return React.createElement("strong", null, text);
    }
    italic(_, text) {
        return React.createElement("em", null, text);
    }
    underline(_, text) {
        return React.createElement("u", null, text);
    }
    strike(_, text) {
        return React.createElement("s", { style: { textDecoration: 'line-through' } }, text);
    }
    textStyle(mark, text) {
        var _a, _b;
        const { attrs } = mark;
        const { color = (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.paragraph } = attrs || {};
        return (React.createElement("span", { style: {
                color,
            } }, text));
    }
    link(mark, text, options) {
        var _a, _b, _c;
        const { attrs } = mark;
        let href = (attrs === null || attrs === void 0 ? void 0 : attrs.href) || '#';
        const target = (attrs === null || attrs === void 0 ? void 0 : attrs.target) || '_blank';
        const rel = (attrs === null || attrs === void 0 ? void 0 : attrs.rel) || 'noopener noreferrer nofollow';
        const isUrlVariable = (_a = attrs === null || attrs === void 0 ? void 0 : attrs.isUrlVariable) !== null && _a !== void 0 ? _a : false;
        if (isUrlVariable) {
            const linkWithoutProtocol = this.removeLinkProtocol(href);
            href = this.variableUrlValue(linkWithoutProtocol, options);
        }
        else {
            href = this.linkValues.get(href) || href;
        }
        return (React.createElement(Link, { href: href, rel: rel, style: {
                fontWeight: 500,
                textDecoration: 'none',
                color: (_c = (_b = this.config.theme) === null || _b === void 0 ? void 0 : _b.colors) === null || _c === void 0 ? void 0 : _c.heading,
            }, target: target }, text));
    }
    removeLinkProtocol(href) {
        return href.replace(LINK_PROTOCOL_REGEX, '');
    }
    variableUrlValue(href, options) {
        var _a, _b;
        const { payloadValue } = options || {};
        const linkWithoutProtocol = this.removeLinkProtocol(href);
        return ((_b = (_a = (typeof payloadValue === 'object'
            ? payloadValue[linkWithoutProtocol]
            : payloadValue)) !== null && _a !== void 0 ? _a : this.variableValues.get(linkWithoutProtocol)) !== null && _b !== void 0 ? _b : href);
    }
    heading(node, options) {
        var _a, _b;
        const { attrs } = node;
        const level = `h${Number(attrs === null || attrs === void 0 ? void 0 : attrs.level) || 1}`;
        const alignment = (attrs === null || attrs === void 0 ? void 0 : attrs.textAlign) || 'left';
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        const { fontSize, lineHeight, fontWeight } = headings[level];
        return (React.createElement(Heading
        // @ts-expect-error - `this` is not assignable to type 'never'
        , { 
            // @ts-expect-error - `this` is not assignable to type 'never'
            as: level, style: {
                textAlign: alignment,
                color: (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.heading,
                marginBottom: shouldRemoveBottomMargin ? '0' : '12px',
                marginTop: 0,
                fontSize,
                lineHeight,
                fontWeight,
            } }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node }))));
    }
    variable(node, options) {
        var _a, _b, _c;
        const { payloadValue } = options || {};
        const { id: variable, fallback } = node.attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow || !variable) {
            return React.createElement(React.Fragment, null);
        }
        let formattedVariable = this.variableFormatter({
            variable,
            fallback,
        });
        // If `shouldReplaceVariableValues` is true, replace the variable values
        // Otherwise, just return the formatted variable
        if (this.shouldReplaceVariableValues) {
            formattedVariable =
                (_c = (_b = (_a = (typeof payloadValue === 'object'
                    ? payloadValue[variable]
                    : payloadValue)) !== null && _a !== void 0 ? _a : this.variableValues.get(variable)) !== null && _b !== void 0 ? _b : fallback) !== null && _c !== void 0 ? _c : formattedVariable;
        }
        if (node === null || node === void 0 ? void 0 : node.marks) {
            return this.renderMark({
                text: formattedVariable,
                marks: node.marks,
            }, options);
        }
        return React.createElement(React.Fragment, null, formattedVariable);
    }
    horizontalRule(_, __) {
        return (React.createElement(Hr, { style: {
                marginTop: '32px',
                marginBottom: '32px',
            } }));
    }
    orderedList(node, options) {
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        return (React.createElement(Container, null,
            React.createElement("ol", { style: {
                    marginTop: '0px',
                    marginBottom: shouldRemoveBottomMargin ? '0' : '20px',
                    paddingLeft: '26px',
                    listStyleType: 'decimal',
                } }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node })))));
    }
    bulletList(node, options) {
        const { parent, next } = options || {};
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, {
            parent,
            next,
        });
        return (React.createElement(Container, { style: {
                maxWidth: '100%',
            } },
            React.createElement("ul", { style: {
                    marginTop: '0px',
                    marginBottom: shouldRemoveBottomMargin ? '0' : '20px',
                    paddingLeft: '26px',
                    listStyleType: 'disc',
                } }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node })))));
    }
    listItem(node, options) {
        return (React.createElement("li", { style: Object.assign({ marginBottom: '8px', paddingLeft: '6px' }, antialiased) }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node }))));
    }
    button(node, options) {
        const { attrs } = node;
        const { text: _text, isTextVariable, url, isUrlVariable, variant, buttonColor, textColor, borderRadius, 
        // @TODO: Update the attribute to `textAlign`
        alignment = 'left', } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        let radius = '0px';
        if (borderRadius === 'round') {
            radius = '9999px';
        }
        else if (borderRadius === 'smooth') {
            radius = '6px';
        }
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        const href = isUrlVariable
            ? this.variableUrlValue(url, options)
            : this.linkValues.get(url) || url;
        const text = isTextVariable ? this.variableUrlValue(_text, options) : _text;
        return (React.createElement(Container, { style: {
                textAlign: alignment,
                maxWidth: '100%',
                marginBottom: shouldRemoveBottomMargin ? '0px' : '20px',
            } },
            React.createElement(Button, { href: href, style: {
                    color: String(textColor),
                    backgroundColor: variant === 'filled' ? String(buttonColor) : 'transparent',
                    borderColor: String(buttonColor),
                    padding: variant === 'filled' ? '12px 34px' : '10px 34px',
                    borderWidth: '2px',
                    borderStyle: 'solid',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    borderRadius: radius,
                } }, text)));
    }
    spacer(node, options) {
        const { attrs } = node;
        const { height = 'auto' } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        return (React.createElement(Container, { style: {
                height: spacers[height] || height,
            } }));
    }
    hardBreak(_, __) {
        return React.createElement("br", null);
    }
    logo(node, options) {
        const { attrs } = node;
        let { src, isSrcVariable, alt, title, size, 
        // @TODO: Update the attribute to `textAlign`
        alignment = 'left', } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        src = isSrcVariable ? this.variableUrlValue(src, options) : src;
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        return (React.createElement(Row, { style: {
                marginTop: '0px',
                marginBottom: shouldRemoveBottomMargin ? '0px' : '32px',
            } },
            React.createElement(Column, { align: alignment },
                React.createElement(Img, { alt: alt || title || 'Logo', src: src, style: {
                        width: logoSizes[size] || size,
                        height: logoSizes[size] || size,
                    }, title: title || alt || 'Logo' }))));
    }
    image(node, options) {
        const { attrs } = node;
        let { src, isSrcVariable, alt, title, width = 'auto', alignment = 'center', externalLink = '', isExternalLinkVariable, } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        src = isSrcVariable ? this.variableUrlValue(src, options) : src;
        externalLink = isExternalLinkVariable
            ? this.variableUrlValue(externalLink, options)
            : externalLink;
        // Handle width value
        const imageWidth = width === 'auto' ? 'auto' : Number(width);
        const widthStyle = imageWidth === 'auto' ? 'auto' : `${imageWidth}px`;
        const mainImage = (React.createElement(Img, { alt: alt || title || 'Image', src: src, style: {
                width: widthStyle, // Use the calculated width
                maxWidth: '100%', // Ensure image doesn't overflow container
                outline: 'none',
                border: 'none',
                textDecoration: 'none',
                display: 'block', // Prevent unwanted spacing
            }, title: title || alt || 'Image' }));
        return (React.createElement(Row, { style: {
                marginTop: '0px',
                marginBottom: shouldRemoveBottomMargin ? '0px' : '32px',
            } },
            React.createElement(Column, { align: alignment }, externalLink ? (React.createElement("a", { href: externalLink, rel: "noopener noreferrer", style: {
                    display: 'block',
                    maxWidth: '100%',
                    textDecoration: 'none',
                }, target: "_blank" }, mainImage)) : (mainImage))));
    }
    footer(node, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const { attrs } = node;
        const { textAlign = 'left' } = attrs || {};
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        return (React.createElement(Text, { style: Object.assign({ fontSize: (_c = (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.fontSize) === null || _b === void 0 ? void 0 : _b.footer) === null || _c === void 0 ? void 0 : _c.size, lineHeight: (_f = (_e = (_d = this.config.theme) === null || _d === void 0 ? void 0 : _d.fontSize) === null || _e === void 0 ? void 0 : _e.footer) === null || _f === void 0 ? void 0 : _f.lineHeight, color: (_h = (_g = this.config.theme) === null || _g === void 0 ? void 0 : _g.colors) === null || _h === void 0 ? void 0 : _h.footer, marginTop: '0px', marginBottom: shouldRemoveBottomMargin ? '0px' : '20px', textAlign }, antialiased) }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node }))));
    }
    blockquote(node, options) {
        var _a, _b;
        const { isPrevSpacer, shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        return (React.createElement("blockquote", { style: {
                borderLeftWidth: '4px',
                borderLeftStyle: 'solid',
                borderLeftColor: (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.blockquoteBorder,
                paddingLeft: '16px',
                marginLeft: '0px',
                marginRight: '0px',
                marginTop: isPrevSpacer ? '0px' : '20px',
                marginBottom: shouldRemoveBottomMargin ? '0px' : '20px',
            } }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node }))));
    }
    code(_, text) {
        var _a, _b, _c, _d;
        return (React.createElement("code", { style: {
                backgroundColor: (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.codeBackground,
                color: (_d = (_c = this.config.theme) === null || _c === void 0 ? void 0 : _c.colors) === null || _d === void 0 ? void 0 : _d.codeText,
                padding: '2px 4px',
                borderRadius: '6px',
                fontFamily: CODE_FONT_FAMILY,
                fontWeight: 400,
                letterSpacing: 0,
            } }, text));
    }
    linkCard(node, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const { attrs } = node;
        const { shouldRemoveBottomMargin } = this.getMarginOverrideConditions(node, options);
        const { title, description, link, linkTitle, image, badgeText, subTitle } = attrs || {};
        const href = this.linkValues.get(link) || this.variableValues.get(link) || link || '#';
        return (React.createElement("a", { href: href, rel: "noopener noreferrer", style: {
                border: '1px solid #eaeaea',
                borderRadius: '10px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                marginBottom: shouldRemoveBottomMargin ? '0px' : '20px',
            }, target: "_blank" },
            image ? (React.createElement(Row, { style: {
                    marginBottom: '6px',
                } },
                React.createElement(Column, { style: {
                        width: '100%',
                        height: '100%',
                    } },
                    React.createElement(Img, { alt: title || 'Link Card', src: image, style: {
                            borderRadius: '10px 10px 0 0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }, title: title || 'Link Card' })))) : null,
            React.createElement(Row, { style: {
                    padding: '15px',
                    marginTop: 0,
                    marginBottom: 0,
                } },
                React.createElement(Column, { style: {
                        verticalAlign: 'top',
                    } },
                    React.createElement(Row, { align: undefined, style: {
                            marginBottom: '8px',
                            marginTop: '0px',
                        }, width: "auto" },
                        React.createElement(Column, null,
                            React.createElement(Text, { style: Object.assign({ fontSize: '18px', fontWeight: 600, color: (_b = (_a = this.config.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.linkCardTitle, margin: '0px' }, antialiased) }, title)),
                        badgeText || subTitle ? (React.createElement(Column, { style: {
                                paddingLeft: '6px',
                                verticalAlign: 'middle',
                            } },
                            badgeText ? (React.createElement("span", { style: {
                                    fontWeight: 600,
                                    color: (_d = (_c = this.config.theme) === null || _c === void 0 ? void 0 : _c.colors) === null || _d === void 0 ? void 0 : _d.linkCardBadgeText,
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    backgroundColor: (_f = (_e = this.config.theme) === null || _e === void 0 ? void 0 : _e.colors) === null || _f === void 0 ? void 0 : _f.linkCardBadgeBackground,
                                    fontSize: '12px',
                                    lineHeight: '12px',
                                } }, badgeText)) : null,
                            ' ',
                            subTitle && !badgeText ? (React.createElement("span", { style: {
                                    fontWeight: 'normal',
                                    color: (_h = (_g = this.config.theme) === null || _g === void 0 ? void 0 : _g.colors) === null || _h === void 0 ? void 0 : _h.linkCardSubTitle,
                                    fontSize: '12px',
                                    lineHeight: '12px',
                                } }, subTitle)) : null)) : null),
                    React.createElement(Text, { style: Object.assign({ fontSize: '16px', color: (_k = (_j = this.config.theme) === null || _j === void 0 ? void 0 : _j.colors) === null || _k === void 0 ? void 0 : _k.linkCardDescription, marginTop: '0px', marginBottom: '0px' }, antialiased) },
                        description,
                        ' ',
                        linkTitle ? (React.createElement("a", { href: href, rel: "noopener noreferrer", style: {
                                color: (_m = (_l = this.config.theme) === null || _l === void 0 ? void 0 : _l.colors) === null || _m === void 0 ? void 0 : _m.linkCardTitle,
                                fontSize: '14px',
                                fontWeight: 600,
                                textDecoration: 'underline',
                            } }, linkTitle)) : null)))));
    }
    section(node, options) {
        const { attrs } = node;
        const { borderRadius = 0, backgroundColor = DEFAULT_SECTION_BACKGROUND_COLOR, align = DEFAULT_SECTION_ALIGN, borderWidth = DEFAULT_SECTION_BORDER_WIDTH, borderColor = DEFAULT_SECTION_BORDER_COLOR, marginTop = DEFAULT_SECTION_MARGIN_TOP, marginRight = DEFAULT_SECTION_MARGIN_RIGHT, marginBottom = DEFAULT_SECTION_MARGIN_BOTTOM, marginLeft = DEFAULT_SECTION_MARGIN_LEFT, paddingTop = DEFAULT_SECTION_PADDING_TOP, paddingRight = DEFAULT_SECTION_PADDING_RIGHT, paddingBottom = DEFAULT_SECTION_PADDING_BOTTOM, paddingLeft = DEFAULT_SECTION_PADDING_LEFT, } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        return (React.createElement(Row, { style: {
                marginTop,
                marginRight,
                marginBottom,
                marginLeft,
            } },
            React.createElement(Column, { align: align, style: {
                    borderColor,
                    borderWidth,
                    borderStyle: 'solid',
                    backgroundColor,
                    borderRadius,
                    paddingTop,
                    paddingRight,
                    paddingBottom,
                    paddingLeft,
                } }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node })))));
    }
    columns(node, options) {
        const { attrs } = node;
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        const [newNode, totalWidth] = this.adjustColumnsContent(node);
        return (React.createElement(Row, { width: `${totalWidth}%`, style: {
                margin: 0,
                padding: 0,
                width: `${totalWidth}%`,
            }, className: "tab-row-full" }, this.getMappedContent(newNode, Object.assign(Object.assign({}, options), { parent: newNode }))));
    }
    adjustColumnsContent(node) {
        var _a;
        const { content = [] } = node;
        const totalWidth = 100;
        const columnsWithWidth = content.filter((c) => { var _a; return c.type === 'column' && Boolean(Number(((_a = c.attrs) === null || _a === void 0 ? void 0 : _a.width) || 0)); });
        const autoWidthColumns = content.filter((c) => { var _a, _b; return c.type === 'column' && (((_a = c.attrs) === null || _a === void 0 ? void 0 : _a.width) === 'auto' || !((_b = c.attrs) === null || _b === void 0 ? void 0 : _b.width)); });
        const totalWidthUsed = columnsWithWidth.reduce((acc, c) => { var _a; return acc + Number((_a = c.attrs) === null || _a === void 0 ? void 0 : _a.width); }, 0);
        const remainingWidth = totalWidth - totalWidthUsed;
        const measuredWidth = Math.round(remainingWidth / autoWidthColumns.length);
        const columnCount = content.filter((c) => c.type === 'column').length;
        const gap = ((_a = node.attrs) === null || _a === void 0 ? void 0 : _a.gap) || DEFAULT_COLUMNS_GAP;
        return [
            Object.assign(Object.assign({}, node), { content: content.map((c, index) => {
                    var _a, _b, _c;
                    const isAutoWidthColumn = c.type === 'column' &&
                        (((_a = c.attrs) === null || _a === void 0 ? void 0 : _a.width) === 'auto' || !((_b = c.attrs) === null || _b === void 0 ? void 0 : _b.width));
                    const isFirstColumn = index === 0;
                    const isMiddleColumn = index > 0 && index < columnCount - 1;
                    const isLastColumn = index === content.length - 1;
                    let paddingLeft = 0;
                    let paddingRight = 0;
                    // For 2 columns, apply a simple gap logic
                    if (columnCount < 3) {
                        paddingLeft = isFirstColumn ? 0 : gap / 2;
                        paddingRight = isLastColumn ? 0 : gap / 2;
                    }
                    else {
                        // For more than 2 columns, apply more gap in the first and last columns
                        // and less gap in the middle columns to make it look more balanced
                        // because the first and last columns have more space to fill
                        const leftAndRightPadding = (gap / 2) * 1.5;
                        const middleColumnPadding = leftAndRightPadding / 2;
                        paddingLeft = isFirstColumn
                            ? 0
                            : isMiddleColumn
                                ? middleColumnPadding
                                : leftAndRightPadding;
                        paddingRight = isLastColumn
                            ? 0
                            : isMiddleColumn
                                ? middleColumnPadding
                                : leftAndRightPadding;
                    }
                    paddingLeft = Math.round(paddingLeft * 100) / 100;
                    paddingRight = Math.round(paddingRight * 100) / 100;
                    return Object.assign(Object.assign({}, c), { attrs: Object.assign(Object.assign({}, c.attrs), { width: isAutoWidthColumn ? measuredWidth : (_c = c.attrs) === null || _c === void 0 ? void 0 : _c.width, isFirstColumn,
                            isLastColumn,
                            index,
                            paddingLeft,
                            paddingRight }) });
                }) }),
            autoWidthColumns.length === 0
                ? Math.min(totalWidth, totalWidthUsed)
                : totalWidth,
        ];
    }
    column(node, options) {
        const { attrs } = node;
        const { width, verticalAlign = 'top', paddingLeft = 0, paddingRight = 0, } = attrs || {};
        return (React.createElement(Column, { width: `${Number(width)}%`, style: {
                width: `${Number(width)}%`,
                margin: 0,
                verticalAlign,
            }, className: "tab-col-full" },
            React.createElement(Section, { style: {
                    margin: 0,
                    paddingLeft,
                    paddingRight,
                }, className: "tab-pad" }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node })))));
    }
    for(node, options) {
        var _a, _b;
        const { attrs } = node;
        const { each = '' } = attrs || {};
        const shouldShow = this.shouldShow(node, options);
        if (!shouldShow) {
            return React.createElement(React.Fragment, null);
        }
        let { payloadValue } = options || {};
        payloadValue = typeof payloadValue === 'object' ? payloadValue : {};
        const values = (_b = (_a = this.payloadValues.get(each)) !== null && _a !== void 0 ? _a : payloadValue[each]) !== null && _b !== void 0 ? _b : [];
        if (!Array.isArray(values)) {
            throw new Error(`Payload value for each "${each}" is not an array`);
        }
        return (React.createElement(React.Fragment, null, values.map((value) => {
            return (React.createElement(Fragment, { key: generateKey() }, this.getMappedContent(node, Object.assign(Object.assign({}, options), { parent: node, payloadValue: value }))));
        })));
    }
    shouldShow(node, options) {
        var _a, _b, _c;
        const showIfKey = (_b = (_a = node === null || node === void 0 ? void 0 : node.attrs) === null || _a === void 0 ? void 0 : _a.showIfKey) !== null && _b !== void 0 ? _b : '';
        if (!showIfKey) {
            return true;
        }
        let { payloadValue } = options || {};
        payloadValue = typeof payloadValue === 'object' ? payloadValue : {};
        return !!((_c = this.payloadValues.get(showIfKey)) !== null && _c !== void 0 ? _c : payloadValue[showIfKey]);
    }
}
