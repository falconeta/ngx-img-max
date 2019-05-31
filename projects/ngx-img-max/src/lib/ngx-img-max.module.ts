import { NgModule } from '@angular/core';
import { ImgMaxPXSizeService } from './img-maxpx-size.service';
import { ImgMaxSizeService } from './img-max-size.service';
import { ImgExifService } from './img-exif.service';
import { NgxImgMaxService } from '../public-api';
import { Ng2PicaModule } from 'ng2-pica';

@NgModule({
  declarations: [],
  imports: [
    Ng2PicaModule
  ],
  exports: [],
  providers: [
    { provide: ImgMaxPXSizeService, useClass: ImgMaxPXSizeService },
    { provide: ImgMaxSizeService, useClass: ImgMaxSizeService },
    { provide: ImgExifService, useClass: ImgExifService },
    { provide: NgxImgMaxService, useClass: NgxImgMaxService }
  ]
})
export class NgxImgMaxModule {}
