import { Body, Controller, Post, Provide } from '@midwayjs/decorator';
import res_obj from '../utils/res_obj';
import { Op } from 'sequelize';
import { Video } from '../model/video';
import { User } from '../model/user';

@Provide()
@Controller('/search')
export class SearchController {
  // 获取所有的tag
  @Post('/')
  async search(@Body('param') param: string) {
    // 搜索视频
    const res = await Video.findAll({
      where: {
        status: 1,
        title: {
          [Op.like]: `%${param}%`,
        },
      },
    });
    if (res instanceof Error) {
      return res_obj('获取视频列表失败');
    }

    // 搜索用户
    const ret = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'signature'],
      where: {
        username: {
          [Op.like]: `%${param}%`,
        },
      },
    });
    if (ret instanceof Error) {
      return res_obj('获取用户列表失败');
    }

    return res_obj('', {
      videos: res,
      users: ret,
    });
  }
}
