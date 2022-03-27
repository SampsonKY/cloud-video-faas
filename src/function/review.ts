import { Body, Controller, Get, Post, Provide } from '@midwayjs/decorator';
import res_obj from '../utils/res_obj';
import { Video } from '../model/video';
import { Review } from '../model/review';

@Provide()
@Controller('/review')
export class ReviewController {
  // 视频审核
  @Post('/')
  async review(
    @Body('videoId') videoId: number,
    @Body('recall') recall = '',
    @Body('result') result: number
  ) {
    // 修改视频状态
    const ret = await Video.update(
      {
        status: result,
      },
      {
        where: {
          id: videoId,
        },
      }
    );
    if (ret instanceof Error) {
      return res_obj('视频审核异常');
    }

    // 修改审核记录
    const res = await Review.update(
      {
        result,
        recall,
      },
      {
        where: {
          videoId,
        },
      }
    );
    if (res instanceof Error) {
      return res_obj('视频审核异常');
    }
    return res_obj('');
  }

  // 待审核列表
  @Get('/list')
  async reviewList() {
    const res = await Review.findAll({
      where: {
        result: 0,
      },
    });
    if (res instanceof Error) {
      return res_obj('查询审核列表失败');
    }

    const ret = [];
    for (let i = 0; i < res.length; i++) {
      const item = res[i];
      const tmp = await Video.findOne({
        attributes: ['url', 'author', 'title', 'description', 'cover'],
        where: {
          id: item.videoId,
        },
      });
      ret[i] = {
        ...item.toJSON(),
        ...tmp.toJSON(),
      };
    }

    return res_obj('', ret);
  }
}
