import { BlockTypeSelect, BoldItalicUnderlineToggles, CreateLink, InsertCodeBlock, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, ListsToggle, MDXEditor, UndoRedo, diffSourcePlugin, frontmatterPlugin, headingsPlugin, imagePlugin, linkDialogPlugin, listsPlugin, markdownShortcutPlugin, quotePlugin, sandpackPlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import '../toolbar.css'




const NoteEditor = () => {
  return (

      <MDXEditor
        markdown=""
        
        placeholder="Write your ideas here..."
        contentEditableClassName='prose-base'
        plugins={[
          toolbarPlugin({ 
            toolbarContents: () => (
              <>
                <BoldItalicUnderlineToggles />
                <UndoRedo />
                <BlockTypeSelect/>
                <ListsToggle/>
                <CreateLink/>
                <InsertCodeBlock/>
                <InsertFrontmatter/>
                <InsertImage/>
                <InsertTable/>
                <InsertThematicBreak/>   
                
              </>
            )
          }),
        
          markdownShortcutPlugin(),
          headingsPlugin(),
          quotePlugin(),
          listsPlugin(),
          thematicBreakPlugin(),
          linkDialogPlugin(),
          frontmatterPlugin(),
          diffSourcePlugin(),
          imagePlugin(),
          sandpackPlugin(),
          tablePlugin(),
          thematicBreakPlugin(),
          listsPlugin(),
          
        ]}
      />
    

  )
}

export default NoteEditor