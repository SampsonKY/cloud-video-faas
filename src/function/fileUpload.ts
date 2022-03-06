import { Inject, Controller, Post, Provide, Files } from '@midwayjs/decorator';
import { OSSService } from '@midwayjs/oss';
import res_obj from '../utils/res_obj';

@Provide()
@Controller('/upload')
export class FileUploadController {
  @Inject()
  ossService: OSSService;

  @Post('/image')
  async uploadImg(@Files() files) {
    const { filename, data } = files[0];
    const result = await this.ossService.put(`/images/${filename}`, data);
    if (result instanceof Error) {
      return res_obj('上传失败');
    }
    return {
      success: true,
      url: result.url,
      imgURL: '',
    };
  }

  @Post('/video')
  async uploadVideo(@Files() files) {
    const { filename, data } = files[0];
    const result = await this.ossService.put(`/videos/${filename}`, data);
    if (result instanceof Error) {
      return res_obj('上传失败');
    }
    console.log(result);
    return {
      success: true,
      url: result.url,
    };
  }
}
