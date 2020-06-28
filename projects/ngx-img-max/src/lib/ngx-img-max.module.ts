import { NgModule } from '@angular/core';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgExifService } from './img-exif.service';
import { ImgMaxQueueService } from './img-max-queue.service';
import { NgxImgMaxService } from './ngx-img-max.service';
import { NgxPicaModule } from 'ngx-pica-wrapper';

@NgModule({
  imports: [NgxPicaModule],
  providers: [
    ImgMaxPXSizeService,
    ImgMaxSizeService,
    ImgExifService,
    NgxImgMaxService,
    ImgMaxQueueService
  ]
})
export class NgxImgMaxModule { }
