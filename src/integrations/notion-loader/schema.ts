import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { z } from "astro/zod";
import type { BlockInfo, PageInfo } from "./api";

const emojiSchema = z.object({
  type: z.literal("emoji"),
  emoji: z.string() as unknown as z.ZodLiteral<"👍">, // Any emoji works
});
const fileSchema = z.object({
  type: z.literal("file"),
  file: z.object({
    url: z.string(),
    expiry_time: z.string(),
  }),
});
const externalSchema = z.object({
  type: z.literal("external"),
  external: z.object({
    url: z.string(),
  }),
});
const userPartialSchema = z.object({
  object: z.literal("user"),
  id: z.string().uuid(),
});

const parentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("database_id"), database_id: z.string().uuid() }),
  z.object({ type: z.literal("page_id"), page_id: z.string().uuid() }),
  z.object({ type: z.literal("workspace"), workspace: z.literal(true) }),
  z.object({ type: z.literal("block_id"), block_id: z.string().uuid() }),
]);

const textColorsSchema = z.union([
  z.literal("default"),
  z.literal("blue"),
  z.literal("brown"),
  z.literal("gray"),
  z.literal("green"),
  z.literal("orange"),
  z.literal("pink"),
  z.literal("purple"),
  z.literal("red"),
  z.literal("yellow"),
]);
const backgroundColorsSchema = z.union([
  z.literal("default"),
  z.literal("blue_background"),
  z.literal("brown_background"),
  z.literal("gray_background"),
  z.literal("green_background"),
  z.literal("orange_background"),
  z.literal("pink_background"),
  z.literal("purple_background"),
  z.literal("red_background"),
  z.literal("yellow_background"),
]);

const baseTextSchema = z.object({
  annotations: z.object({
    bold: z.boolean(),
    italic: z.boolean(),
    strikethrough: z.boolean(),
    underline: z.boolean(),
    code: z.boolean(),
    color: z.union([textColorsSchema, backgroundColorsSchema]),
  }),
  plain_text: z.string(),
  href: z.string().nullable(),
});

const datePropertyValueSchema = z.object({
  start: z.string(),
  end: z.string().nullable(),
  time_zone: (
    z.string() as unknown as z.ZodLiteral<"Antarctica/South_Pole">
  ).nullable(),
});
const selectPropertyValueSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: textColorsSchema,
});

const richTextSchema: z.ZodType<RichTextItemResponse> = z.discriminatedUnion(
  "type",
  [
    baseTextSchema.extend({
      type: z.literal("text"),
      text: z.object({
        content: z.string(),
        link: z.object({ url: z.string() }).nullable(),
      }),
    }),
    baseTextSchema.extend({
      type: z.literal("equation"),
      equation: z.object({
        expression: z.string(),
      }),
    }),
    baseTextSchema.extend({
      type: z.literal("mention"),
      mention: z.discriminatedUnion("type", [
        z.object({
          type: z.literal("database"),
          database: z.object({ id: z.string() }),
        }),
        z.object({
          type: z.literal("date"),
          date: datePropertyValueSchema,
        }),
        z.object({
          type: z.literal("link_preview"),
          link_preview: z.object({ url: z.string() }),
        }),
        z.object({
          type: z.literal("page"),
          page: z.object({ id: z.string() }),
        }),
        z.object({
          type: z.literal("template_mention"),
          template_mention: z.discriminatedUnion("type", [
            z.object({
              type: z.literal("template_mention_user"),
              template_mention_user: z.literal("me"),
            }),
          ]),
        }),
        z.object({
          type: z.literal("user"),
          user: userPartialSchema,
        }),
      ]),
    }),
  ],
) satisfies z.ZodType<RichTextItemResponse>;

const basePropertySchema = z.object({ id: z.string() });
const titlePropertySchema = basePropertySchema.extend({
  type: z.literal("title"),
  title: z.array(richTextSchema),
});
const richTextPropertySchema = basePropertySchema.extend({
  type: z.literal("rich_text"),
  rich_text: z.array(richTextSchema),
});
const numberPropertySchema = basePropertySchema.extend({
  type: z.literal("number"),
  number: z.number().nullable(),
});
const selectPropertySchema = basePropertySchema.extend({
  type: z.literal("select"),
  select: selectPropertyValueSchema.nullable(),
});
const statusPropertySchema = basePropertySchema.extend({
  type: z.literal("status"),
  status: selectPropertyValueSchema.nullable(),
});
const multiSelectPropertySchema = basePropertySchema.extend({
  type: z.literal("multi_select"),
  multi_select: z.array(selectPropertyValueSchema),
});
const datePropertySchema = basePropertySchema.extend({
  type: z.literal("date"),
  date: datePropertyValueSchema.nullable(),
});
const formulaPropertySchema = basePropertySchema.extend({
  type: z.literal("formula"),
  formula: z.discriminatedUnion("type", [
    z.object({ type: z.literal("string"), string: z.string() }),
    z.object({ type: z.literal("number"), number: z.number() }),
    z.object({ type: z.literal("boolean"), boolean: z.boolean() }),
    z.object({ type: z.literal("date"), date: datePropertyValueSchema }),
  ]),
});
const relationPropertySchema = basePropertySchema.extend({
  type: z.literal("relation"),
  relation: z.array(z.object({ id: z.string() })),
});
const rollupPropertySchema = basePropertySchema.extend({
  type: z.literal("rollup"),
  rollup: z.never({ message: "Rollup schema not implemented" }),
});
const peoplePropertySchema = basePropertySchema.extend({
  type: z.literal("people"),
  people: z.array(userPartialSchema),
});
const filesPropertySchema = basePropertySchema.extend({
  type: z.literal("files"),
  files: z.array(
    z.discriminatedUnion("type", [
      externalSchema.extend({ name: z.string() }),
      fileSchema.extend({ name: z.string() }),
    ]),
  ),
});
const checkboxPropertySchema = basePropertySchema.extend({
  type: z.literal("checkbox"),
  checkbox: z.boolean(),
});
const urlPropertySchema = basePropertySchema.extend({
  type: z.literal("url"),
  url: z.string().nullable(),
});
const emailPropertySchema = basePropertySchema.extend({
  type: z.literal("email"),
  email: z.string().nullable(),
});
const phoneNumberPropertySchema = basePropertySchema.extend({
  type: z.literal("phone_number"),
  phone_number: z.string().nullable(),
});
const createdTimePropertySchema = basePropertySchema.extend({
  type: z.literal("created_time"),
  created_time: z.string(),
});
const createdByPropertySchema = basePropertySchema.extend({
  type: z.literal("created_by"),
  created_by: userPartialSchema,
});
const lastEditedTimePropertySchema = basePropertySchema.extend({
  type: z.literal("last_edited_time"),
  last_edited_time: z.string(),
});
const lastEditedByPropertySchema = basePropertySchema.extend({
  type: z.literal("last_edited_by"),
  last_edited_by: userPartialSchema,
});

const propertiesSchema: z.ZodType<PageObjectResponse["properties"][string]> =
  z.discriminatedUnion("type", [
    titlePropertySchema,
    richTextPropertySchema,
    numberPropertySchema,
    selectPropertySchema,
    statusPropertySchema,
    multiSelectPropertySchema,
    datePropertySchema,
    formulaPropertySchema,
    relationPropertySchema,
    rollupPropertySchema,
    peoplePropertySchema,
    filesPropertySchema,
    checkboxPropertySchema,
    urlPropertySchema,
    emailPropertySchema,
    phoneNumberPropertySchema,
    createdTimePropertySchema,
    createdByPropertySchema,
    lastEditedTimePropertySchema,
    lastEditedByPropertySchema,
  ]) satisfies z.ZodType<PageObjectResponse["properties"][string]>;

const pageSchema: z.ZodType<PageObjectResponse> = z.object({
  object: z.literal("page"),
  id: z.string().uuid(),
  created_time: z.string().datetime(),
  last_edited_time: z.string().datetime(),
  created_by: userPartialSchema,
  last_edited_by: userPartialSchema,
  cover: z.discriminatedUnion("type", [externalSchema, fileSchema]).nullable(),
  icon: z
    .discriminatedUnion("type", [externalSchema, fileSchema, emojiSchema])
    .nullable(),
  parent: parentSchema,
  archived: z.boolean(),
  in_trash: z.boolean(),
  properties: z.object({}).catchall(propertiesSchema),
  url: z.string(),
  public_url: z.string().nullable(),
}) satisfies z.ZodType<PageObjectResponse>;

const baseBlockExtends = {
  object: z.literal("block"),
  id: z.string().uuid(),
  parent: parentSchema,
  created_time: z.string().datetime(),
  last_edited_time: z.string().datetime(),
  created_by: userPartialSchema,
  last_edited_by: userPartialSchema,
  has_children: z.boolean(),
  archived: z.boolean(),
  in_trash: z.boolean(),
};

const bookmarkBlockSchema = z
  .object({
    type: z.literal("bookmark"),
    bookmark: z.object({
      caption: z.array(richTextSchema),
      url: z.string(),
    }),
  })
  .extend(baseBlockExtends);
const breadcrumbBlockSchema = z
  .object({ type: z.literal("breadcrumb"), breadcrumb: z.object({}) })
  .extend(baseBlockExtends);
const bulletedListBlockSchema = z
  .object({
    type: z.literal("bulleted_list_item"),
    bulleted_list_item: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const calloutBlockSchema = z
  .object({
    type: z.literal("callout"),
    callout: z.object({
      rich_text: z.array(richTextSchema),
      icon: z.discriminatedUnion("type", [
        externalSchema,
        fileSchema,
        emojiSchema,
      ]),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
    }),
  })
  .extend(baseBlockExtends);
const childDatabaseBlockSchema = z
  .object({
    type: z.literal("child_database"),
    child_database: z.object({ title: z.string() }),
  })
  .extend(baseBlockExtends);
const childPageBlockSchema = z
  .object({
    type: z.literal("child_page"),
    child_page: z.object({ title: z.string() }),
  })
  .extend(baseBlockExtends);
const codeBlockSchema = z
  .object({
    type: z.literal("code"),
    code: z.object({
      caption: z.array(richTextSchema),
      rich_text: z.array(richTextSchema),
      language: z.string() as unknown as z.ZodLiteral<"typescript">,
    }),
  })
  .extend(baseBlockExtends);
const columnListBlockSchema = z
  .object({ type: z.literal("column_list"), column_list: z.object({}) })
  .extend(baseBlockExtends);
const columnBlockSchema = z
  .object({ type: z.literal("column"), column: z.object({}) })
  .extend(baseBlockExtends);
const dividerBlockSchema = z
  .object({ type: z.literal("divider"), divider: z.object({}) })
  .extend(baseBlockExtends);
const embedBlockSchema = z
  .object({
    type: z.literal("embed"),
    embed: z.object({
      caption: z.array(richTextSchema),
      url: z.string(),
    }),
  })
  .extend(baseBlockExtends);
const equationBlockSchema = z
  .object({
    type: z.literal("equation"),
    equation: z.object({ expression: z.string() }),
  })
  .extend(baseBlockExtends);
const fileBlockSchema = z
  .object({
    type: z.literal("file"),
    file: z.discriminatedUnion("type", [
      externalSchema.extend({
        caption: z.array(richTextSchema),
        name: z.string(),
      }),
      fileSchema.extend({ caption: z.array(richTextSchema), name: z.string() }),
    ]),
  })
  .extend(baseBlockExtends);
const heading1BlockSchema = z
  .object({
    type: z.literal("heading_1"),
    heading_1: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      is_toggleable: z.boolean(),
    }),
  })
  .extend(baseBlockExtends);
const heading2BlockSchema = z
  .object({
    type: z.literal("heading_2"),
    heading_2: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      is_toggleable: z.boolean(),
    }),
  })
  .extend(baseBlockExtends);
const heading3BlockSchema = z
  .object({
    type: z.literal("heading_3"),
    heading_3: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      is_toggleable: z.boolean(),
    }),
  })
  .extend(baseBlockExtends);
const imageBlockSchema = z
  .object({
    type: z.literal("image"),
    image: z.discriminatedUnion("type", [
      externalSchema.extend({ caption: z.array(richTextSchema) }),
      fileSchema.extend({ caption: z.array(richTextSchema) }),
    ]),
  })
  .extend(baseBlockExtends);
const linkPreviewBlockSchema = z
  .object({
    type: z.literal("link_preview"),
    link_preview: z.object({ url: z.string() }),
  })
  .extend(baseBlockExtends);
const numberedListItemBlockSchema = z
  .object({
    type: z.literal("numbered_list_item"),
    numbered_list_item: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const paragraphBlockSchema = z
  .object({
    type: z.literal("paragraph"),
    paragraph: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const pdfBlockSchema = z
  .object({
    type: z.literal("pdf"),
    pdf: z.discriminatedUnion("type", [
      externalSchema.extend({ caption: z.array(richTextSchema) }),
      fileSchema.extend({ caption: z.array(richTextSchema) }),
    ]),
  })
  .extend(baseBlockExtends);
const quoteBlockSchema = z
  .object({
    type: z.literal("quote"),
    quote: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const syncedBlockBlockSchema = z
  .object({
    type: z.literal("synced_block"),
    synced_block: z.never({
      message: "Synced block schema is not implemented",
    }),
  })
  .extend(baseBlockExtends);
const tableBlockSchema = z
  .object({
    type: z.literal("table"),
    table: z.object({
      table_width: z.number(),
      has_column_header: z.boolean(),
      has_row_header: z.boolean(),
    }),
  })
  .extend(baseBlockExtends);
const tableRowBlockSchema = z
  .object({
    type: z.literal("table_row"),
    table_row: z.object({ cells: z.array(z.array(richTextSchema)) }),
  })
  .extend(baseBlockExtends);
const tableOfContentsBlockSchema = z
  .object({
    type: z.literal("table_of_contents"),
    table_of_contents: z.object({
      color: z.union([textColorsSchema, backgroundColorsSchema]),
    }),
  })
  .extend(baseBlockExtends);
const todoBlockSchema = z
  .object({
    type: z.literal("to_do"),
    to_do: z.object({
      rich_text: z.array(richTextSchema),
      checked: z.boolean(),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const toggleBlockSchema = z
  .object({
    type: z.literal("toggle"),
    toggle: z.object({
      rich_text: z.array(richTextSchema),
      color: z.union([textColorsSchema, backgroundColorsSchema]),
      children: z.array(z.any()).optional(),
    }),
  })
  .extend(baseBlockExtends);
const videoBlockSchema = z
  .object({
    type: z.literal("video"),
    video: z.discriminatedUnion("type", [
      externalSchema.extend({ caption: z.array(richTextSchema) }),
      fileSchema.extend({ caption: z.array(richTextSchema) }),
    ]),
  })
  .extend(baseBlockExtends);

const blockSchema: z.ZodType<BlockObjectResponse> = z.discriminatedUnion(
  "type",
  [
    bookmarkBlockSchema,
    breadcrumbBlockSchema,
    bulletedListBlockSchema,
    calloutBlockSchema,
    childDatabaseBlockSchema,
    childPageBlockSchema,
    codeBlockSchema,
    columnListBlockSchema,
    columnBlockSchema,
    dividerBlockSchema,
    embedBlockSchema,
    equationBlockSchema,
    fileBlockSchema,
    heading1BlockSchema,
    heading2BlockSchema,
    heading3BlockSchema,
    imageBlockSchema,
    linkPreviewBlockSchema,
    numberedListItemBlockSchema,
    paragraphBlockSchema,
    pdfBlockSchema,
    quoteBlockSchema,
    syncedBlockBlockSchema,
    tableBlockSchema,
    tableRowBlockSchema,
    tableOfContentsBlockSchema,
    todoBlockSchema,
    toggleBlockSchema,
    videoBlockSchema,
  ],
) satisfies z.ZodType<BlockObjectResponse>;

const blockInfoSchema = z.object({
  block: z.union([pageSchema, blockSchema]),
  children: z.array(z.string()).optional(),
}) satisfies z.ZodType<BlockInfo>;

export const pageDataSchema = z.object({
  page: pageSchema,
  slug: z.string(),
  blockMap: z.map(z.string(), blockInfoSchema),
}) satisfies z.ZodType<PageInfo>;
