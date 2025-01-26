class PDFProcessor {
    constructor() {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async loadPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            return await pdfjsLib.getDocument(arrayBuffer).promise;
        } catch (error) {
            console.error('Failed to load PDF:', error);
            throw new Error('Failed to load PDF.');
        }
    }

    async renderPage(page, scale = 1) {
        try {
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport
            }).promise;

            return canvas;
        } catch (error) {
            console.error('Failed to render PDF page:', error);
            throw new Error('Failed to render PDF page.');
        }
    }
}