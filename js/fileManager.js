class FileManager {
    constructor() {
        this.selectedFiles = [];
        this.fileChangeCallbacks = [];
        this.setupDragDrop();
    }

    setupDragDrop() {
        const fileList = document.getElementById('fileList');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileList.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        fileList.addEventListener('dragenter', () => fileList.classList.add('drag-over'));
        fileList.addEventListener('dragover', () => fileList.classList.add('drag-over'));
        fileList.addEventListener('dragleave', () => fileList.classList.remove('drag-over'));
        fileList.addEventListener('drop', (e) => {
            fileList.classList.remove('drag-over');
            const droppedFiles = e.dataTransfer.files;
            this.addFiles(droppedFiles);
        });

        // Prevent defaults for the document
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    addFiles(files) {
        const validTypes = ['application/pdf', 'image/'];
        const newFiles = Array.from(files).filter(file => 
            validTypes.some(type => file.type.toLowerCase().startsWith(type))
        );
        this.selectedFiles = [...this.selectedFiles, ...newFiles];
        this.notifyFileChange();
        this.updateFileList();
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.notifyFileChange();
        this.updateFileList();
        const fileInput = document.getElementById('fileInput');
        fileInput.value = '';
    }

    updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name}</span>
                <span class="remove-file" data-index="${index}">×</span>
            `;
            fileList.appendChild(fileItem);
        });
        
        this.attachRemoveListeners();
    }

    attachRemoveListeners() {
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeFile(index);
            });
        });
    }

    onFileChange(callback) {
        this.fileChangeCallbacks.push(callback);
    }

    notifyFileChange() {
        this.fileChangeCallbacks.forEach(callback => callback(this.selectedFiles));
    }
}