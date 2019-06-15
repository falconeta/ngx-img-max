import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgExifService } from './img-exif.service';
import { ImgMaxQueueService } from './img-max-queue.service';

export interface ConversionProgress {
  percent: number;
  isActive: boolean;
}
@Injectable()
export class NgxImgMaxService {
  constructor(private imgMaxSizeService: ImgMaxSizeService, private imageExifService: ImgExifService, private imgMaxQueueService: ImgMaxQueueService) {
    console.log('NGX-IMG-MAX started... version 0.0.8');
  }

  public compress(files: File[], maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
    const compressedFileSubject = new Subject<any>();
    files.forEach(file => {
      this.compressImage(file, maxSizeInMB, ignoreAlpha, logExecutionTime).subscribe(
        value => {
          compressedFileSubject.next(value);
        },
        error => {
          compressedFileSubject.error(error);
        }
      );
    });
    return compressedFileSubject.asObservable();
  }

  public getConversionProgress(): Observable<ConversionProgress> {
    return this.imgMaxQueueService.getConversionProgress();
  }

  public compressImage(file: File, maxSizeInMB: number, ignoreAlpha: boolean = false, logExecutionTime: boolean = false): Observable<any> {
    return this.imgMaxSizeService.compressImage(file, maxSizeInMB, ignoreAlpha, logExecutionTime);
  }

  public resizeImage(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean = false): Observable<File> {
    return this.imgMaxQueueService.addImageToResizeInQueue(file, maxWidth, maxHeight, logExecutionTime);
  }

  public getEXIFOrientedImage(image: HTMLImageElement): Promise<HTMLImageElement> {
    return this.imageExifService.getOrientedImage(image);
  }
}
