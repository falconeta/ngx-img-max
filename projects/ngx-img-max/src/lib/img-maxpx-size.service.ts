import { Injectable, Inject, forwardRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { ImgExifService } from './img-exif.service';
import { NgxPicaService } from 'ng-pica';

export interface ImageData {
  img: HTMLImageElement;
  file: File;
  maxWidth: number;
  maxHeight: number;
  resizedFileSubject: Subject<any>;
  logExecutionTime: boolean;
}
@Injectable()
export class ImgMaxPXSizeService {
  timeAtStart: number;
  constructor(
    @Inject(forwardRef(() => NgxPicaService)) private ngxPicaService: NgxPicaService,
    @Inject(forwardRef(() => ImgExifService)) private imageExifService: ImgExifService
  ) {}
  public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<any> {
    const resizedFileSubject = new Subject<any>();
    this.timeAtStart = new Date().getTime();
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      // END OF RESIZE
      setTimeout(() => {
        resizedFileSubject.error({ resizedFile: file, reason: 'The provided File is neither of type jpg nor of type png.', error: 'INVALID_EXTENSION' });
      }, 0);
      return resizedFileSubject.asObservable();
    }
    const img = new Image();
    // let self = this;

    const imageData: ImageData = {
      img,
      file,
      maxWidth,
      maxHeight,
      resizedFileSubject,
      logExecutionTime
    };

    img.onload = this.imgLoaded.bind(this, imageData);
    img.src = window.URL.createObjectURL(file);

    return resizedFileSubject.asObservable();
  }

  private imgLoaded(imageData: ImageData) {
    const { img, maxHeight, maxWidth, resizedFileSubject, file, logExecutionTime } = imageData;
    this.imageExifService.getOrientedImage(img).then(orientedImg => {
      window.URL.revokeObjectURL(img.src);
      const currentWidth = orientedImg.width;
      let currentHeight = orientedImg.height;
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        // resize height proportionally
        const ratio = maxWidth / currentWidth; // is gonna be <1
        newHeight = newHeight * ratio;
      }
      currentHeight = newHeight;
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        // resize width proportionally
        const ratio = maxHeight / currentHeight; // is gonna be <1
        newWidth = newWidth * ratio;
      }
      if (newHeight === orientedImg.height && newWidth === orientedImg.width) {
        // no resizing necessary
        resizedFileSubject.next(file);
        this.logExecutionTime(logExecutionTime);
      } else {
        this.ngxPicaService.resizeImages([file], newWidth, newHeight).subscribe(
          result => {
            // all good, result is a file
            resizedFileSubject.next(result);
            this.logExecutionTime(logExecutionTime);
          },
          error => {
            // something went wrong
            resizedFileSubject.error({ resizedFile: file, reason: error, error: 'PICA_ERROR' });
            this.logExecutionTime(logExecutionTime);
          }
        );
      }
    });
  }

  private logExecutionTime(logExecutionTime: boolean): void {
    if (logExecutionTime) {
      // console.info('Execution time: ', new Date().getTime() - this.timeAtStart + 'ms');
    }
  }
}
