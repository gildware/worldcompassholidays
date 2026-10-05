"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Autoformat,
  AutoImage,
  BlockQuote,
  Bold,
  ClassicEditor,
  type EditorConfig,
  Essentials,
  Font,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageInsertViaUrl,
  ImageStyle,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

const editorConfig: EditorConfig = {
  licenseKey: "GPL",
  plugins: [
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Font,
    Alignment,
    Link,
    List,
    Indent,
    IndentBlock,
    BlockQuote,
    HorizontalLine,
    Image,
    ImageCaption,
    ImageStyle,
    ImageToolbar,
    ImageInsertViaUrl,
    AutoImage,
    Table,
    TableToolbar,
    PasteFromOffice,
    Autoformat,
    RemoveFormat,
    GeneralHtmlSupport,
    SourceEditing,
    HtmlEmbed,
  ],
  toolbar: {
    items: [
      "undo",
      "redo",
      "|",
      "sourceEditing",
      "|",
      "heading",
      "|",
      "fontSize",
      "fontFamily",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "alignment",
      "|",
      "link",
      "insertImage",
      "insertTable",
      "blockQuote",
      "horizontalLine",
      "htmlEmbed",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "removeFormat",
    ],
    shouldNotGroupWhenFull: false,
  },
  image: {
    toolbar: [
      "imageTextAlternative",
      "|",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
    ],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  fontFamily: {
    options: [
      { title: "Jost", model: undefined },
      "Arial, Helvetica, sans-serif",
      "Courier New, Courier, monospace",
      "Georgia, serif",
      "Tahoma, Geneva, sans-serif",
      "Times New Roman, Times, serif",
      "Verdana, Geneva, sans-serif",
    ],
    supportAllValues: true,
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
  },
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
    disallow: [{ name: "script" }, { name: "iframe" }, { name: "object" }, { name: "embed" }],
  },
  placeholder: "Write the tour story, or paste HTML with styles.",
};

export default function CkContentEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  return (
    <div className="tour-html-editor">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={editorConfig}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
