class FileManager {
    constructor() {
        this.selectedFiles = [];
        this.fileChangeCallbacks = [];
        this.setupDragDrop();
        
        // Instead of using Sortable events, implement our own reordering
        this.implementManualReordering();
    }

    implementManualReordering() {
        const fileList = document.getElementById('fileList');
        
        // Initialize Sortable but don't rely on its events
        Sortable.create(fileList, {
            animation: 150,
            handle: '.drag-handle',
            ghostClass: 'sortable-ghost'
        });
        
        // Add a manual reorder button for each file
        fileList.addEventListener('click', (e) => {
            // Handle move up button
            if (e.target.classList.contains('move-up')) {
                const fileItem = e.target.closest('.file-item');
                const index = parseInt(fileItem.dataset.index);
                if (index > 0) {
                    // Swap with previous file
                    [this.selectedFiles[index], this.selectedFiles[index-1]] = 
                    [this.selectedFiles[index-1], this.selectedFiles[index]];
                    this.updateFileList();
                    this.notifyFileChange();
                }
            }
            // Handle move down button
            else if (e.target.classList.contains('move-down')) {
                const fileItem = e.target.closest('.file-item');
                const index = parseInt(fileItem.dataset.index);
                if (index < this.selectedFiles.length - 1) {
                    // Swap with next file
                    [this.selectedFiles[index], this.selectedFiles[index+1]] = 
                    [this.selectedFiles[index+1], this.selectedFiles[index]];
                    this.updateFileList();
                    this.notifyFileChange();
                }
            }
        });
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
            fileItem.dataset.index = index;
            
            fileItem.innerHTML = `
                <div class="file-item-content">
                    <span class="drag-handle">☰</span>
                    <span class="file-name">${file.name}</span>
                    <div class="file-controls">
                        <button class="move-up" type="button" ${index === 0 ? 'disabled' : ''}>▲</button>
                        <button class="move-down" type="button" ${index === this.selectedFiles.length - 1 ? 'disabled' : ''}>▼</button>
                        <button class="remove-file" type="button" data-index="${index}">×</button>
                    </div>
                </div>
            `;

            // Add click handler to the remove button
            const removeButton = fileItem.querySelector('.remove-file');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(parseInt(e.target.dataset.index));
            });

            fileList.appendChild(fileItem);
        });
        
        // Log the current order
        console.log('Current file order:', this.selectedFiles.map(f => f.name));
    }

    onFileChange(callback) {
        this.fileChangeCallbacks.push(callback);
    }

    notifyFileChange() {
        this.fileChangeCallbacks.forEach(callback => callback(this.selectedFiles));
    }
}