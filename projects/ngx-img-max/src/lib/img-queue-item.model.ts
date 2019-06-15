import { Subject, Observable } from 'rxjs';
import { ImageConfig } from './img-max.interfaces';

export class ImageQueueItem {
  private resizeSubject: Subject<File>;

  constructor(private image: File, private imageConfig: ImageConfig) {
    this.resizeSubject = new Subject();
  }

  public get imageToResize(): File {
    return this.image;
  }

  public get imageConfiguration(): ImageConfig {
    return this.imageConfig;
  }

  public get resizeObservable(): Observable<File> {
    return this.resizeSubject.asObservable();
  }

  public set resizeSub(imageResized: File) {
    this.resizeSubject.next(imageResized);
    this.resizeSubject.complete();
  }
}
