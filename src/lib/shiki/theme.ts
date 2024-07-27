import type { ThemeRegistration } from "shiki";

// How to get theme:
// 1. In VS Code: Show Commands (ctrl+shift+p) > Developer: Generate Color Theme from Current Settings
// 2. Copy theme into this file
// 3. Give credit to theme authors
// 4. Make sure to add a name property to the object
// 5. semanticHighlighting: true

// This theme has small modifications from the Sublime Material Theme fo VS Code, which is a port of an older
// version of what would turn into the community material theme.

export const syntaxTheme: ThemeRegistration = {
  $schema: "vscode://schemas/color-theme",
  type: "dark",
  colors: {
    "editor.background": "#252526",
    "editor.foreground": "#eeffff",
    "editor.lineHighlightBackground": "#00000050",
    "editor.selectionBackground": "#80cbc420",
    "editorBracketHighlight.foreground1": "#89ddff",
    "editorBracketHighlight.foreground2": "#89ddff",
    "editorBracketHighlight.foreground3": "#89ddff",
    "editorBracketHighlight.foreground4": "#89ddff",
    "editorBracketHighlight.foreground5": "#89ddff",
    "editorBracketHighlight.foreground6": "#89ddff",
    "editorCursor.foreground": "#eeffff",
    "editorIndentGuide.activeBackground1": "#80cbc470",
    "editorIndentGuide.background1": "#37474f80",
    "editorMultiCursor.secondary.foreground": "#a6adad",
    "editorOverviewRuler.infoForeground": "#3794ff40",
    "editorWhitespace.foreground": "#65737e",
    "minimap.infoHighlight": "#00000000",
  },
  tokenColors: [
    {
      scope: "comment, punctuation.definition.comment",
      settings: {
        foreground: "#546E7A",
        fontStyle: "italic",
      },
    },
    {
      scope: "variable, string constant.other.placeholder",
      settings: {
        foreground: "#EEFFFF",
      },
    },
    {
      scope: "constant.other.color",
      settings: {
        foreground: "#FFFFFF",
      },
    },
    {
      scope: "invalid, invalid.illegal, invalid.broken",
      settings: {
        foreground: "#FFFFFF",
        background: "#FF5370",
      },
    },
    {
      scope: "invalid.unimplemented",
      settings: {
        foreground: "#FFFFFF",
        background: "#C3E88D",
      },
    },
    {
      scope: "invalid.deprecated",
      settings: {
        foreground: "#FFFFFF",
        background: "#C792EA",
      },
    },
    {
      scope: "keyword, storage.type, storage.modifier",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "storage.type, keyword.control",
      settings: {
        fontStyle: "italic",
      },
    },
    {
      scope:
        "keyword.operator, constant.other.color, punctuation, meta.tag, punctuation.definition.tag, punctuation.separator.inheritance.php, punctuation.definition.tag.html, punctuation.definition.tag.begin.html, punctuation.definition.tag.end.html, punctuation.section.embedded, keyword.other.template, keyword.other.substitution",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "entity.name.tag, meta.tag.sgml, markup.deleted.git_gutter",
      settings: {
        foreground: "#F07178",
      },
    },
    {
      scope:
        "entity.name.function, meta.function-call, variable.function, support.function, keyword.other.special-method, meta.block-level",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope: "support.other.variable, string.other.link",
      settings: {
        foreground: "#F07178",
      },
    },
    {
      scope:
        "constant.numeric, constant.language, support.constant, constant.character, variable.parameter, keyword.other.unit",
      settings: {
        foreground: "#F78C6C",
      },
    },
    {
      scope:
        "string, constant.other.symbol, constant.other.key, entity.other.inherited-class, markup.heading, markup.inserted.git_gutter, meta.group.braces.curly constant.other.object.key.js string.unquoted.label.js",
      settings: {
        foreground: "#C3E88D",
        fontStyle: "normal",
      },
    },
    {
      scope:
        "entity.name.class, entity.name.type.class, support.type, support.class, support.orther.namespace.use.php, meta.use.php, support.other.namespace.php, markup.changed.git_gutter, support.type.sys-types",
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope:
        "source.css support.type, source.sass support.type, source.scss support.type, source.less support.type, source.stylus support.type",
      settings: {
        foreground: "#B2CCD6",
      },
    },
    {
      scope:
        "entity.name.module.js, variable.import.parameter.js, variable.other.class.js",
      settings: {
        foreground: "#FF5370",
      },
    },
    {
      scope: "variable.language",
      settings: {
        foreground: "#FF5370",
        fontStyle: "italic",
      },
    },
    {
      scope: "entity.name.method.js",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope:
        "meta.class-method.js entity.name.function.js, variable.function.constructor",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope: "entity.other.attribute-name",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope:
        "text.html.basic entity.other.attribute-name.html, text.html.basic entity.other.attribute-name",
      settings: {
        foreground: "#FFCB6B",
        fontStyle: "italic",
      },
    },
    {
      scope: "entity.other.attribute-name.class",
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope: "source.sass keyword.control",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope: "markup.inserted",
      settings: {
        foreground: "#C3E88D",
      },
    },
    {
      scope: "markup.deleted",
      settings: {
        foreground: "#FF5370",
      },
    },
    {
      scope: "markup.changed",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "string.regexp",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "constant.character.escape",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "*url*, *link*, *uri*",
      settings: {
        fontStyle: "underline",
      },
    },
    {
      scope: "constant.numeric.line-number.find-in-files - match",
      settings: {
        foreground: "#C17E70",
      },
    },
    {
      scope: "entity.name.filename.find-in-files",
      settings: {
        foreground: "#C3E88D",
      },
    },
    {
      scope:
        "tag.decorator.js entity.name.tag.js, tag.decorator.js punctuation.definition.tag.js",
      settings: {
        foreground: "#82AAFF",
        fontStyle: "italic",
      },
    },
    {
      scope: "source.js constant.other.object.key.js string.unquoted.label.js",
      settings: {
        foreground: "#FF5370",
        fontStyle: "italic",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#C3E88D",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#F07178",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#C17E70",
      },
    },
    {
      scope:
        "source.json meta meta meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#FF5370",
      },
    },
    {
      scope:
        "source.json meta meta meta meta.structure.dictionary.json string.quoted.double.json - meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta meta meta.structure.dictionary.json punctuation.definition.string - meta meta meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#F78C6C",
      },
    },
    {
      scope:
        "source.json meta meta.structure.dictionary.json string.quoted.double.json - meta meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta meta.structure.dictionary.json punctuation.definition.string - meta meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope:
        "source.json meta.structure.dictionary.json string.quoted.double.json - meta.structure.dictionary.json meta.structure.dictionary.value.json string.quoted.double.json, source.json meta.structure.dictionary.json punctuation.definition.string - meta.structure.dictionary.json meta.structure.dictionary.value.json punctuation.definition.string",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "text.html.markdown, punctuation.definition.list_item.markdown",
      settings: {
        foreground: "#EEFFFF",
      },
    },
    {
      scope: "text.html.markdown markup.raw.inline",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "text.html.markdown punctuation.definition.raw.markdown",
      settings: {
        foreground: "#65737E",
      },
    },
    {
      scope: "text.html.markdown meta.dummy.line-break",
      settings: {},
    },
    {
      scope:
        "markdown.heading, markup.heading | markup.heading entity.name, markup.heading.markdown punctuation.definition.heading.markdown",
      settings: {
        foreground: "#C3E88D",
      },
    },
    {
      scope: "markup.italic",
      settings: {
        foreground: "#F07178",
        fontStyle: "italic",
      },
    },
    {
      scope: "markup.bold, markup.bold string",
      settings: {
        foreground: "#F07178",
        fontStyle: "bold",
      },
    },
    {
      scope:
        "markup.bold markup.italic, markup.italic markup.bold, markup.quote markup.bold, markup.bold markup.italic string, markup.italic markup.bold string, markup.quote markup.bold string",
      settings: {
        fontStyle: "bold italic",
      },
    },
    {
      scope: "markup.underline",
      settings: {
        foreground: "#F78C6C",
        fontStyle: "underline",
      },
    },
    {
      scope: "markup.strike",
      settings: {
        fontStyle: "strike",
      },
    },
    {
      scope: "markup.quote punctuation.definition.blockquote.markdown",
      settings: {
        foreground: "#65737E",
        background: "#65737E",
      },
    },
    {
      scope: "markup.quote",
      settings: {
        fontStyle: "italic",
      },
    },
    {
      scope: "string.other.link.title.markdown",
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope: "string.other.link.description.title.markdown",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "constant.other.reference.link.markdown",
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope: "markup.raw.block",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "markup.raw.block.fenced.markdown",
      settings: {
        background: "#00000050",
      },
    },
    {
      scope: "punctuation.definition.fenced.markdown",
      settings: {
        background: "#00000050",
      },
    },
    {
      scope:
        "markup.raw.block.fenced.markdown, variable.language.fenced.markdown, punctuation.section.class.end",
      settings: {
        foreground: "#EEFFFF",
      },
    },
    {
      scope: "variable.language.fenced.markdown",
      settings: {
        foreground: "#65737E",
        fontStyle: "",
      },
    },
    {
      scope: "text.html.markdown punctuation.definition",
      settings: {
        foreground: "#546E7A",
      },
    },
    {
      scope: "text.html.markdown meta.disable-markdown punctuation.definition",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "meta.separator",
      settings: {
        foreground: "#65737E",
        background: "#00000050",
        fontStyle: "bold",
      },
    },
    {
      scope: "markup.table",
      settings: {
        foreground: "#EEFFFF",
      },
    },
    {
      scope: "string.regexp",
      settings: {
        foreground: "#EEFFFF",
      },
    },
    {
      scope: "string.regexp keyword.operator",
      settings: {
        foreground: "#C792EA",
      },
    },
    {
      scope: "string.regexp keyword.control.anchor.regexp",
      settings: {
        foreground: "#C792EA",
        fontStyle: "",
      },
    },
    {
      scope: "string.regexp keyword.operator.quantifier",
      settings: {
        foreground: "#F78C6C",
      },
    },
    {
      scope: "string.regexp punctuation.definition.group",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "string.regexp punctuation.definition.group variable.other.regexp",
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "string.regexp constant.character.escape",
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope: ["string.regexp constant.other.character-class.set"],
      settings: {
        foreground: "#C3E88D",
      },
    },
    {
      scope: ["string.regexp constant.other.character-class.range"],
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope: ["string.regexp constant.other.character-class"],
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope:
        "string.regexp constant.other.character-class keyword.operator.negation",
      settings: {
        foreground: "#FF5370",
      },
    },
    {
      scope: [
        "keyword.control.flow.block-scalar.literal.yaml",
        "keyword.control.flow.block-scalar.folded.yaml",
      ],
      settings: {
        fontStyle: "",
      },
    },
    {
      scope: ["comment.rainbow4"],
      settings: {
        foreground: "#B2CCD6",
        fontStyle: "",
      },
    },
    {
      scope: ["variable.parameter.rainbow6"],
      settings: {
        foreground: "#FFCB6B",
      },
    },
    {
      scope: ["entity.name.type.rainbow8"],
      settings: {
        foreground: "#82AAFF",
      },
    },
    {
      scope: ["markup.bold.rainbow9"],
      settings: {
        fontStyle: "",
      },
    },
    {
      scope: ["invalid.rainbow10"],
      settings: {
        foreground: "#89DDFF",
      },
    },
    {
      scope: "token.info-token",
      settings: {
        foreground: "#6796E6",
      },
    },
    {
      scope: "token.warn-token",
      settings: {
        foreground: "#CD9731",
      },
    },
    {
      scope: "token.error-token",
      settings: {
        foreground: "#F44747",
      },
    },
    {
      scope: "token.debug-token",
      settings: {
        foreground: "#B267E6",
      },
    },
  ],
};
