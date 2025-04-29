import { BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertCodeBlock, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, MDXEditor, UndoRedo, diffSourcePlugin, frontmatterPlugin, headingsPlugin, imagePlugin, linkDialogPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin, sandpackPlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin } from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import  '../toolbar.css' 
// import '../toolbar.css';
import React, { useState, useEffect } from 'react';

interface NoteEditorAttribute {
  defaultText: string;
  defaultTitle?: string;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
}

const NoteEditor: React.FC<NoteEditorAttribute> = (props) => {
  const [title, setTitle] = useState<string>(props.defaultTitle || '');
  const [markdown, setMarkdown] = useState<string>(props.defaultText);

  useEffect(() => {
    setMarkdown(props.defaultText);
  }, [props.defaultText]);

  useEffect(() => {
    setTitle(props.defaultTitle || '');
  }, [props.defaultTitle]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = event.target.value;
    setTitle(newTitle);
    props.onTitleChange(newTitle);
  };

  const handleContentChange = (newMarkdown: string) => {
    setMarkdown(newMarkdown);
    props.onContentChange(newMarkdown);
  };

  // Define plugins once to avoid duplication and improve readability
  const editorPlugins = [
    toolbarPlugin({
      toolbarContents: () => (
        <>
          <UndoRedo />
          <BoldItalicUnderlineToggles />
          <BlockTypeSelect />
          <ListsToggle />
          <CreateLink />
          <InsertImage />
          <InsertTable />
          <InsertThematicBreak />
          <InsertCodeBlock />
          <InsertFrontmatter />
        </>
      )
    }),
    headingsPlugin(),
    quotePlugin(),
    listsPlugin(), // Only include once
    thematicBreakPlugin(), // Only include once
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    frontmatterPlugin(),
    // Optional Plugins:
    markdownShortcutPlugin(),
    // Example diffSourcePlugin configuration (adjust as needed)
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: props.defaultText }),
    // sandpackPlugin(), // Include if you use Sandpack code blocks
  ];

  return (
    // Container with border, rounded corners, shadow, and white background
    <div className="border border-gray-300  rounded-md shadow-sm overflow-hidden bg-white ">
      {/* Title Input */}
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={handleTitleChange}
        aria-label="Note Title"
        // Styling for the title input using Tailwind
        className="w-full px-4 py-3 text-xl md:text-2xl font-semibold border-none focus:ring-0 focus:border-none outline-none placeholder-gray-400  bg-transparent border-b border-gray-200  mb-1 text-gray-900 "
      />

      {/* MDX Editor */}
      <MDXEditor
        markdown={markdown}
        onChange={handleContentChange}
        placeholder="Write your ideas here..."
        // Apply Tailwind's typography plugin class + ensure focus outline is removed
        // Use max-w-none to override prose's max-width for editor full width
        // Add padding within the content area using px-4 py-2
        contentEditableClassName='prose-base  max-w-none focus:outline-none px-4 py-2 min-h-[300px]'
        plugins={editorPlugins}
        // Ensure the editor component itself doesn't add conflicting background/text colors if possible
        // The toolbar styling comes from '@mdxeditor/editor/style.css' but we style the container
        className=" text-gray-100" // Apply dark theme class if needed by editor styles
      />
    </div>
  );
};


export default NoteEditor;