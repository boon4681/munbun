import { createHighlighter, type Highlighter } from "shiki";

export type ShikiLang = "json" | "javascript";

let highlighterPromise: Promise<Highlighter> | null = null;

const getHighlighter = () => {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ["github-light", "github-dark"],
            langs: ["json", "javascript"],
        });
    }
    return highlighterPromise;
};

/**
 * Highlight `code` to HTML. Emits both light and dark colors (light inline,
 * dark exposed via `--shiki-dark` CSS vars) so the `.dark` theme rule in
 * layout.css can switch without re-highlighting.
 */
export const highlight = async (code: string, lang: ShikiLang): Promise<string> => {
    const hl = await getHighlighter();
    return hl.codeToHtml(code, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
    });
};
