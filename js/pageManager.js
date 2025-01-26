class PageManager {
    constructor(container) {
        this.container = container;
        this.pageOrder = [];
        this.selectedPages = new Set();
        this.lastSelectedPage = null;
        this.setupEventListeners();
        this.setupSortable();
    }

    setupEventListeners() {
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('keydown', this.handleKeydown.bind(this));
        this.container.tabIndex = 0;
    }

    setupSortable() {
        new Sortable(this.container, {
            animation: 150,
            onEnd: () => this.updatePageOrder()
        });
    }

    handleClick(e) {
        const pageDiv = e.target.closest('.page');
        if (!pageDiv) return;

        if (e.ctrlKey || e.metaKey) {
            this.toggleSelection(pageDiv);
        } else if (e.shiftKey && this.lastSelectedPage) {
            this.selectRange(pageDiv);
        } else {
            this.selectSingle(pageDiv);
        }
    }

    toggleSelection(pageDiv) {
        if (this.selectedPages.has(pageDiv)) {
            pageDiv.classList.remove('selected');
            this.selectedPages.delete(pageDiv);
        } else {
            pageDiv.classList.add('selected');
            this.selectedPages.add(pageDiv);
            this.lastSelectedPage = pageDiv;
        }
    }

    selectRange(pageDiv) {
        const pages = Array.from(this.container.querySelectorAll('.page'));
        const start = pages.indexOf(this.lastSelectedPage);
        const end = pages.indexOf(pageDiv);
        const range = pages.slice(Math.min(start, end), Math.max(start, end) + 1);

        this.selectedPages.forEach(p => p.classList.remove('selected'));
        this.selectedPages.clear();
        range.forEach(p => {
            p.classList.add('selected');
            this.selectedPages.add(p);
        });
    }

    selectSingle(pageDiv) {
        this.selectedPages.forEach(p => p.classList.remove('selected'));
        this.selectedPages.clear();
        pageDiv.classList.add('selected');
        this.selectedPages.add(pageDiv);
        this.lastSelectedPage = pageDiv;
    }

    handleKeydown(e) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedPages.size > 0) {
            this.deleteSelectedPages();
        }
    }

    deleteSelectedPages() {
        this.selectedPages.forEach(page => page.remove());
        this.selectedPages.clear();
        this.updatePageOrder();
        this.updatePageNumbers();
    }

    updatePageNumbers() {
        this.container.querySelectorAll('.page-number').forEach((numDiv, idx) => {
            numDiv.textContent = `Page ${idx + 1}`;
        });
    }

    updatePageOrder() {
        const pages = this.container.querySelectorAll('.page');
        this.pageOrder = Array.from(pages).map(page => ({
            fileIndex: parseInt(page.dataset.fileIndex),
            pageIndex: parseInt(page.dataset.pageIndex)
        }));
    }
}