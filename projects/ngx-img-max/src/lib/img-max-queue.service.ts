import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';
import { ConversionProgress } from '../public-api';
import { ImageQueueItem } from './img-queue-item.model';
import { ImageConfig } from './img-max.interfaces';
import { finalize } from 'rxjs/operators';

@Injectable()
export class ImgMaxQueueService {
  private imageQueue: ImageQueueItem[];
  private resizeInProgress: boolean;
  private conversionProgress: BehaviorSubject<ConversionProgress>;
  private imagesToConvert: number;

  constructor(private imgMaxPXSizeService: ImgMaxPXSizeService) {
    this.imageQueue = [];
    this.resizeInProgress = false;
    this.imagesToConvert = 0;
    this.conversionProgress = new BehaviorSubject({
      isActive: this.resizeInProgress,
      percent: 0
    });
  }

  public addImageToResizeInQueue(file: File, maxWidth: number, maxHeight: number, logExecutionTime: boolean): Observable<File> {
    this.imagesToConvert++;
    const imageConfig: ImageConfig = {
      maxHeight,
      maxWidth,
      logExecutionTime
    };
    const imageQueueItem = new ImageQueueItem(file, imageConfig);
    this.imageQueue.push(imageQueueItem);

    if (!this.resizeInProgress) {
      this.resizeInProgress = true;
      this.startConversion();
    }
    return imageQueueItem.resizeObservable;
  }

  public getConversionProgress(): Observable<ConversionProgress> {
    return this.conversionProgress.asObservable();
  }

  private emitProgress() {
    const conversionProgress: ConversionProgress = {
      isActive: this.resizeInProgress,
      percent: ((this.imagesToConvert - this.imageQueue.length) * 100) / this.imagesToConvert || 0
    };
    this.conversionProgress.next(conversionProgress);
  }

  private startConversion() {
    this.emitProgress();
    const imageQueueItem = this.imageQueue.pop();
    const { maxHeight, maxWidth, logExecutionTime } = imageQueueItem.imageConfiguration;
    this.imgMaxPXSizeService
      .resizeImage(imageQueueItem.imageToResize, maxWidth, maxHeight, logExecutionTime)
      .pipe(
        finalize(() => {
          if (this.imageQueue.length) {
            this.startConversion();
          } else {
            this.resizeInProgress = false;
            this.emitProgress();
            this.imagesToConvert = 0;
          }
        })
      )
      .subscribe({
        next: imageResized => (imageQueueItem.resizeSub = imageResized),
        error: error => (imageQueueItem.resizeSubError = error)
      });
  }
}
