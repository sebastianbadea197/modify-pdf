class FileManager {
    constructor() {
        this.selectedFiles = [];
        this.fileChangeCallbacks = [];
        this.sortableInstance = null;
        this.dragging = false;
        
        this.setupDragDrop();
        
        if (document.readyState === 'complete') {
            this.initSortable();
        } else {
            window.addEventListener('load', () => {
                this.initSortable();
            });
        }
    }

    initSortable() {
        const fileList = document.getElementById('fileList');
        
        if (!fileList || this.dragging) {
            return;
        }
        
        try {
            if (this.sortableInstance) {
                this.sortableInstance.destroy();
                this.sortableInstance = null;
            }
            
            this.sortableInstance = Sortable.create(fileList, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                delay: 150,
                delayOnTouchOnly: true,
                chosenClass: 'sortable-chosen',
                onStart: () => {
                    this.dragging = true;
                },
                onEnd: (evt) => {
                    if (typeof evt.oldIndex === 'number' && 
                        typeof evt.newIndex === 'number' &&
                        evt.oldIndex !== evt.newIndex &&
                        evt.oldIndex >= 0 && 
                        evt.newIndex >= 0 &&
                        evt.oldIndex < this.selectedFiles.length &&
                        evt.newIndex < this.selectedFiles.length) {
                        
                        setTimeout(() => {
                            this.handleSortableReorder(evt.oldIndex, evt.newIndex);
                            this.dragging = false;
                        }, 50);
                    } else {
                        this.dragging = false;
                    }
                }
            });
        } catch (error) {
            this.dragging = false;
        }
    }
    
    handleSortableReorder(oldIndex, newIndex) {
        try {
            const files = [...this.selectedFiles];
            const movedItem = files[oldIndex];
            
            if (!movedItem) {
                return;
            }
            
            files.splice(oldIndex, 1);
            files.splice(newIndex, 0, movedItem);
            this.selectedFiles = files;
            this.updateFileListNoDrag();
            this.notifyFileChange();
        } catch (error) {
            console.error("Error during reordering:", error);
        }
    }

    updateFileListNoDrag() {
        const fileList = document.getElementById('fileList');
        
        if (!fileList) {
            return;
        }
        
        fileList.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.index = index;
            
            fileItem.innerHTML = `
                <div class="file-item-content">
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" type="button" data-index="${index}">×</button>
                </div>
            `;

            const removeButton = fileItem.querySelector('.remove-file');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(parseInt(e.target.dataset.index));
            });

            fileList.appendChild(fileItem);
        });
    }

    setupDragDrop() {
        const fileList = document.getElementById('fileList');
        
        if (!fileList) {
            return;
        }
        
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
        if (this.dragging) {
            return;
        }
        
        this.selectedFiles.splice(index, 1);
        this.notifyFileChange();
        this.updateFileList();
        const fileInput = document.getElementById('fileInput');
        fileInput.value = '';
    }

    updateFileList() {
        if (this.dragging) {
            return;
        }
        
        const fileList = document.getElementById('fileList');
        
        if (!fileList) {
            return;
        }
        
        if (this.sortableInstance) {
            try {
                this.sortableInstance.destroy();
            } catch (error) {
                console.error("Error destroying Sortable:", error);
            }
            this.sortableInstance = null;
        }
        
        fileList.innerHTML = '';
        
        this.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.index = index;
            
            fileItem.innerHTML = `
                <div class="file-item-content">
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" type="button" data-index="${index}">×</button>
                </div>
            `;

            const removeButton = fileItem.querySelector('.remove-file');
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFile(parseInt(e.target.dataset.index));
            });

            fileList.appendChild(fileItem);
        });
        
        setTimeout(() => {
            this.initSortable();
        }, 100);
    }

    onFileChange(callback) {
        this.fileChangeCallbacks.push(callback);
    }

    notifyFileChange() {
        this.fileChangeCallbacks.forEach(callback => callback(this.selectedFiles));
    }
}