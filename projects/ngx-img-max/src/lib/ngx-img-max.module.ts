import { NgModule } from '@angular/core';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgExifService } from './img-exif.service';
import { NgxImgMaxService } from '../public-api';
import { NgxPicaModule } from 'ng-pica';
import { ImgMaxQueueService } from './img-max-queue.service';

@NgModule({
  imports: [NgxPicaModule],
  providers: [ImgMaxPXSizeService, ImgMaxSizeService, ImgExifService, NgxImgMaxService, ImgMaxQueueService]
})
export class NgxImgMaxModule { }
