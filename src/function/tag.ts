import { Controller, Get, Provide } from '@midwayjs/decorator';
import res_obj from '../utils/res_obj';
import { Tag } from '../model/tag';

@Provide()
@Controller('/tag')
export class TagController {
  // 获取所有的tag
  @Get('/')
  async getTag() {
    const ret = await Tag.findAll();
    if (ret instanceof Error) {
      return res_obj('获取视频标签出错');
    }

    return res_obj('', ret);
  }
}
