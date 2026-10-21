# The CUHK Review of Philosophy

Website of The CUHK Review of Philosophy, a student-run journal of interviews with philosophers.
Static HTML, hosted on GitHub Pages at cuhkphilreview.com.

## Files
- index.html, issues.html, about.html, contribute.html  the site pages
- issue-1.html  online page-turn viewer for Issue No. 1
- viewer.js, viewer.css  the viewer code (our own code)
- assets/pdfjs/  PDF.js by Mozilla, Apache 2.0 licence (see LICENSE there), draws the PDF pages
- pdf/  the issue PDFs, used by both the viewer and the download links
- images/  cover pictures
- conversation.html  old address, forwards to issue-1.html

## Adding a new issue
1. Put the PDF in pdf/, for example pdf/The-CUHK-Review-of-Philosophy-Issue-2.pdf.
2. Copy issue-1.html to issue-2.html. Change the title, the fb-title text and the two PDF paths.
3. Make a cover picture in images/ and update index.html and issues.html.
