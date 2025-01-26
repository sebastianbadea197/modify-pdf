class FileManager {
    constructor() {
        this.selectedFiles = [];
        this.fileChangeCallbacks = [];
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