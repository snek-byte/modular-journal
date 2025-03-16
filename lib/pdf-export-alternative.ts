import type { Descendant } from "slate"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

export const exportToPdf = async (elementId: string, title: string, content: Descendant[]) => {
  if (!isBrowser) return

  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error("Element not found:", elementId)
      return
    }

    // Create a print-friendly version in a new window
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to export as PDF")
      return
    }

    const htmlContent = element.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20mm;
              color: #333;
            }
            h1 { font-size: 24pt; margin-bottom: 12pt; }
            h2 { font-size: 18pt; margin-bottom: 10pt; }
            h3 { font-size: 14pt; margin-bottom: 8pt; }
            p { margin-bottom: 8pt; }
            blockquote {
              border-left: 3px solid #ccc;
              padding-left: 10pt;
              margin-left: 10pt;
              font-style: italic;
            }
            ul, ol { margin-bottom: 10pt; }
            pre {
              background-color: #f5f5f5;
              padding: 10pt;
              border-radius: 5pt;
              font-family: monospace;
              overflow-x: auto;
            }
            @media print {
              body { margin: 15mm; }
              @page { size: A4; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${htmlContent}
          <script>
            // Print automatically when content is loaded
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 500);
              }, 300);
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  } catch (error) {
    console.error("Error exporting to PDF:", error)
    alert("There was an error exporting to PDF. Please try again.")
  }
}

