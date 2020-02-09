import { Injectable } from '@angular/core';
let EXIF = require('exif-js');

@Injectable()
export class ImgExifService {
  public getOrientedImage(image: HTMLImageElement): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      let img: any;

      if (!EXIF) {
        EXIF = {};
        EXIF.getData = (img, callback) => {
          callback.call(image);
          return true;
        };
        EXIF.getTag = () => false;
      }
      EXIF.getData(image, () => {
        const orientation = EXIF.getTag(image, 'Orientation');

        if (orientation != 1) {
          const canvas: HTMLCanvasElement = document.createElement('canvas');
          const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
          let cw: number = image.width;
          let ch: number = image.height;
          let cx = 0;
          let cy = 0;
          let deg = 0;
          switch (orientation) {
            case 3:
            case 4:
              cx = -image.width;
              cy = -image.height;
              deg = 180;
              break;
            case 5:
            case 6:
              cw = image.height;
              ch = image.width;
              cy = -image.height;
              deg = 90;
              break;
            case 7:
            case 8:
              cw = image.height;
              ch = image.width;
              cx = -image.width;
              deg = 270;
              break;
            default:
              break;
          }

          canvas.width = cw;
          canvas.height = ch;
          if ([2, 4, 5, 7].indexOf(orientation) > -1) {
            // flip image
            ctx.translate(cw, 0);
            ctx.scale(-1, 1);
          }
          ctx.rotate((deg * Math.PI) / 180);
          ctx.drawImage(image, cx, cy);
          img = document.createElement('img');
          img.width = cw;
          img.height = ch;
          img.addEventListener('load', () => {
            resolve(img);
          });
          img.src = canvas.toDataURL('image/png');
        } else {
          resolve(image);
        }
      });
    });
  }
}
