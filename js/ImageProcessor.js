class ImageProcessor {
    static async processImage(file, maxDim = 2000) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const { width, height } = this.calculateDimensions(img, maxDim);
                        const canvas = this.createCanvas(img, width, height);
                        resolve({
                            canvas,
                            width,
                            height,
                            dataUrl: canvas.toDataURL('image/jpeg', 0.9)
                        });
                    } catch (error) {
                        reject(new Error('Failed to process image.'));
                    }
                };
                img.onerror = () => reject(new Error('Failed to load image.'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsDataURL(file);
        });
    }

    static calculateDimensions(img, maxDim) {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
            if (width > height) {
                height = (height / width) * maxDim;
                width = maxDim;
            } else {
                width = (width / height) * maxDim;
                height = maxDim;
            }
        }
        return { width, height };
    }

    static createCanvas(img, width, height) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas;
    }
}