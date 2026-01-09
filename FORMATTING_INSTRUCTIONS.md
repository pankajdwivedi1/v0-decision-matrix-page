# Alternative solution: Manual steps to format your Word document

## **Option 1: Copy-Paste with Formatting Preservation**

### Steps to maintain formatting when copying from Markdown to Word:

1. **Open the Markdown file in VS Code**
2. **Install "Markdown Preview Enhanced" extension** (if not installed):
   - Press `Ctrl+Shift+X`
   - Search for "Markdown Preview Enhanced"
   - Click Install

3. **Generate HTML preview**:
   - Open `Decisionalgo_Research_Paper.md`
   - Press `Ctrl+K` then `V` (to open preview side-by-side)
   - Right-click in preview → "Open in Browser"

4. **Copy from browser to Word**:
   - Select all content in browser (`Ctrl+A`)
   - Copy (`Ctrl+C`)
   - Paste into Word (`Ctrl+V`)
   - Word will preserve most formatting!

---

## **Option 2: Use Online Converter**

1. **Visit**: https://www.markdowntoword.com/
2. **Upload** your `Decisionalgo_Research_Paper.md` file
3. **Download** the converted .docx file
4. **Apply two-column layout** in Word:
   - Select all text (`Ctrl+A`)
   - Layout tab → Columns → Two

---

## **Option 3: Use Pandoc Command (requires restart)**

After installing Pandoc, **restart your computer** or open a **new PowerShell window** and run:

```powershell
cd "C:\Users\PANKAJ DWIVEDI\Desktop\v0-decision-matrix-page"

pandoc Decisionalgo_Research_Paper.md -o Decisionalgo_Research_Paper.docx --standalone --toc --number-sections
```

Then in Word:
- Open the generated .docx file
- Select all (`Ctrl+A`)
- Go to Layout → Columns → Two
- Adjust margins: Layout → Margins → Narrow

---

## **Option 4: Direct Word Formatting (Recommended for now)**

1. **Open** your existing Word document with the correct formatting
2. **Copy** content from the Markdown file in VS Code
3. **Paste into Word** as plain text (`Ctrl+Shift+V` or use "Keep Text Only")
4. **Apply styles**:
   - Headings: Use Heading 1, Heading 2, etc.
   - Body text: Normal style
5. **Set two-column layout**:
   - Select the content area
   - Layout → Columns → Two
   - Apply Justify: Home → Paragraph → Justify

---

## **Immediate Solution (No tools required)**

### Step-by-step for your specific case:

1. Open your current Word document (the one with correct formatting)
2. Save it as a new file: `Decisionalgo_Research_Paper_FINAL.docx`
3. The formatting is already there - you're done!

If you need to make edits:
- Edit directly in the Word file
- OR edit the .md file and copy-paste sections as needed

---

## **Future Workflow**

For future papers, consider:

1. **Write in Word directly** with your formatting template
2. **Or use LaTeX** for academic papers (better for complex formatting)
3. **Or use Markdown** for simple documents without complex layouts

---

## **Your Current Status**

✅ **Markdown file created**: `Decisionalgo_Research_Paper.md`
✅ **Pandoc installed**: Ready to use (needs PowerShell restart)
❓ **Word file**: You already have the formatted version!

**Next step**: Just use your existing Word document - it already has all the content and formatting you need! 🎉
