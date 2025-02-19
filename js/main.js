class PDFMergerApp {
    constructor() {
        this.fileManager = new FileManager();
        this.pdfProcessor = new PDFProcessor();
        this.pageManager = new PageManager(document.getElementById('pagesGrid'));
        this.setupUI();
    }

    setupUI() {
        const fileInput = document.getElementById('fileInput');
        const mergeButton = document.getElementById('mergeButton');
        const downloadBtn = document.getElementById('downloadBtn');

        fileInput.addEventListener('change', (e) => this.fileManager.addFiles(e.target.files));
        mergeButton.addEventListener('click', () => {
            console.log('Display Documents clicked. Current file order:',
                this.fileManager.selectedFiles.map(f => f.name));
            this.displayDocuments();
        });
        downloadBtn.addEventListener('click', () => this.createPDF());

        this.fileManager.onFileChange(files => {
            mergeButton.disabled = files.length < 1;
            console.log('Files changed. Current order:', 
                files.map(f => f.name));
        });
    }

    async displayDocuments() {
        try {
            this.showProgress();
            const pagesGrid = document.getElementById('pagesGrid');
            pagesGrid.innerHTML = '';
            let pageCount = 0;

            // Log the order we'll process files in
            console.log('Processing files in order:', 
                this.fileManager.selectedFiles.map(f => f.name));

            for (let i = 0; i < this.fileManager.selectedFiles.length; i++) {
                const file = this.fileManager.selectedFiles[i];
                console.log(`Processing file ${i}: ${file.name}`);
                
                if (file.type === 'application/pdf') {
                    await this.processPDF(file, i, pageCount);
                } else if (file.type.startsWith('image/')) {
                    await this.processImage(file, i, pageCount);
                }
            }

            this.pageManager.updatePageOrder();
            document.getElementById('downloadBtn').style.display = 'inline-block';
        } catch (error) {
            console.error('Error processing files:', error);
            alert('Error processing files. Please try again.');
        } finally {
            this.hideProgress();
        }
    }

    async processPDF(file, fileIndex, pageCount) {
        const pdf = await this.pdfProcessor.loadPDF(file);
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const scale = 200 / page.getViewport({ scale: 1 }).width;
            const canvas = await this.pdfProcessor.renderPage(page, scale);
            this.addPageToGrid(canvas, fileIndex, pageNum - 1, ++pageCount, 'pdf');
        }
    }

    async processImage(file, fileIndex, pageCount) {
        const imageData = await ImageProcessor.processImage(file);
        this.addPageToGrid(imageData.canvas, fileIndex, 0, ++pageCount, 'image');
    }

    addPageToGrid(canvas, fileIndex, pageIndex, pageCount, type) {
        const pagesGrid = document.getElementById('pagesGrid');
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.dataset.fileIndex = fileIndex;
        pageDiv.dataset.pageIndex = pageIndex;
        pageDiv.dataset.type = type;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'page-delete';
        deleteButton.innerHTML = '×';
        deleteButton.title = 'Delete page';
        deleteButton.onclick = (e) => {
            e.stopPropagation();
            this.pageManager.deletePage(pageDiv);
        };

        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = `Page ${pageCount}`;

        pageDiv.appendChild(canvas);
        pageDiv.appendChild(deleteButton);
        pageDiv.appendChild(pageNumber);
        pagesGrid.appendChild(pageDiv);
    }

    showProgress() {
        document.getElementById('progress').style.display = 'block';
        document.getElementById('mergeButton').disabled = true;
    }

    hideProgress() {
        document.getElementById('progress').style.display = 'none';
        document.getElementById('mergeButton').disabled = false;
    }

    async createPDF() {
        try {
            this.showProgress();
            const newPdf = await PDFLib.PDFDocument.create();

            for (const { fileIndex, pageIndex } of this.pageManager.pageOrder) {
                const file = this.fileManager.selectedFiles[fileIndex];
                if (file.type === 'application/pdf') {
                    const fileData = await file.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(fileData);
                    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
                    newPdf.addPage(copiedPage);
                } else if (file.type.startsWith('image/')) {
                    const imageData = await ImageProcessor.processImage(file);
                    const img = await newPdf.embedJpg(await (await fetch(imageData.dataUrl)).arrayBuffer());
                    const page = newPdf.addPage([imageData.width, imageData.height]);
                    page.drawImage(img, { x: 0, y: 0, width: imageData.width, height: imageData.height });
                }
            }

            const pdfBytes = await newPdf.save();
            this.downloadPDF(pdfBytes);
        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('Error creating PDF. Please try again.');
        } finally {
            this.hideProgress();
        }
    }

    downloadPDF(pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'merged.pdf';
        link.click();
        URL.revokeObjectURL(url);
    }
}