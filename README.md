# The CUHK Review of Philosophy

Website of The CUHK Review of Philosophy (中大哲學評論), a student-run journal of interviews with philosophers.
Static HTML, hosted on GitHub Pages at cuhkphilreview.com.

## Files
- index.html, issues.html, about.html, contribute.html  the English pages
- zh/  the Chinese pages, with the same file names
- issue-1.html, zh/issue-1.html  online page-turn viewer for Issue No. 1, English and Chinese
- flipbook.css  the title bar over the viewer (journal name, language button, PDF download)
- newbook/, js/  the page-turn viewer (FlipHTML5 engine) from e-print, used with e-print's permission by email
- images/issue-1/en/, images/issue-1/zh/  the page pictures shown in the viewer, one JPG per page
- images/  cover pictures
- pdf/  the issue PDFs for download
- conversation.html  old address, forwards to issue-1.html

## Adding a new issue
1. Put the PDFs in pdf/, for example pdf/The-CUHK-Review-of-Philosophy-Issue-2.pdf and pdf/The-CUHK-Review-of-Philosophy-Issue-2-Chinese.pdf.
2. Turn each PDF page into a JPG, 1452 x 2048 pixels, named p-01.jpg, p-02.jpg and so on. Put them in images/issue-2/en/ and images/issue-2/zh/.
3. Copy issue-1.html to issue-2.html. In the copy, change the title, the bookImg list of page pictures, the text in the title bar, the PDF links and the link to zh/issue-2.html.
4. Do the same for zh/issue-1.html, which links back to ../issue-2.html.
5. Make a cover picture in images/ and update index.html, issues.html, zh/index.html and zh/issues.html.
