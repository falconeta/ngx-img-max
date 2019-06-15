import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { take, finalize } from 'rxjs/operators';

import { NgxPicaService, NgxPicaResizeOptionsInterface } from 'ng-pica';
import { ImgExifService } from './img-exif.service';

export interface ImageData {
  img: HTMLImageElement;
  file: File;
  maxWidth: number;
  maxHeight: number;
  resizedFileSubject: Subject<File>;
  logExecutionTime: boolean;
}
@Injectable()
export class ImgMaxPXSizeService {
  timeAtStart: number;
  constructor(private ngxPicaService: NgxPicaService, private imageExifService: ImgExifService) {}
  public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<File> {
    const resizedFileSubject = new Subject<File>();
    this.timeAtStart = new Date().getTime();
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      // END OF RESIZE
      return throwError({ resizedFile: file, reason: 'The provided File is neither of type jpg nor of type png.', error: 'INVALID_EXTENSION' });
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
        resizedFileSubject.complete();
        this.logExecutionTime(logExecutionTime);
      } else {
        const options: NgxPicaResizeOptionsInterface = {
          alpha: true
        };
        this.ngxPicaService
          .resizeImage(file, newWidth, newHeight, options)
          .pipe(
            take(1),
            finalize(() => resizedFileSubject.complete())
          )
          .subscribe({
            next: result => {
              // all good, result is a file
              resizedFileSubject.next(result);
              this.logExecutionTime(logExecutionTime);
            },
            error: error => {
              // something went wrong
              resizedFileSubject.error({ resizedFile: file, reason: error, error: 'PICA_ERROR' });
              this.logExecutionTime(logExecutionTime);
            }
          });
      }
    });
  }

  private logExecutionTime(logExecutionTime: boolean): void {
    if (logExecutionTime) {
      // console.info('Execution time: ', new Date().getTime() - this.timeAtStart + 'ms');
    }
  }
}
