import { constants } from "node:buffer";

class ImageFile {
    filename: string;
    sizes: Object = {
        "LARGE": 3000,
        "MEDIUM": 640,
        "THUMBNAIL": 120
    };

    constructor(filename) {
        this.filename = filename;
    }

    constraintForSize(size) {
        if (size in this.sizes) {
            return this.sizes[size];
        } else {
            console.error("Invalid image size: " + size);
            return 1;
        }
    }

    async derivative(size) {
        var deriv = this.derivativePath(size);
        var Jimp = require('jimp');
        var image = await Jimp.read(this.filename);
        var constraint = this.constraintForSize(size);

        console.log(constraint);

        if (image.bitmap.width > constraint || image.bitmap.height > constraint) {
            try {
                image.scaleToFit(constraint, constraint); // resize to pixel sizes?
                image.quality(90); // set JPEG quality
                //image.greyscale(); // set greyscale
                await image.writeAsync(deriv); // save
                console.log("resize", constraint, deriv);
            } catch (error) {
                console.error(error);
            };
        } else {
            // Image source smaller than derivative size
            await image.writeAsync(deriv); // save
        }
        return deriv;
     }

    derivativePath(size, extension = "jpg") {
        var path = require('path');
        var dir = path.dirname(this.filename);
        var filename = this.basename(this.filename);
        return dir + "/" + filename + "." + size + "." + extension.toLowerCase();
    }

    ocr() {
        var txt = this.derivativePath('OCR-DIRTY', 'txt');
        let fs = require('fs');
        var tesseract = require("node-tesseract-ocr");
        if (fs.existsSync(txt)){
            var path = this.basename(txt);
        }

    }

    ocrDerivative() {

    }

    ocrProperties() {

    }

    delete() {

    }

    basename(path) {
        return path.replace(/\/$/, "").split('/').reverse()[0];
    }
}

export default ImageFile;