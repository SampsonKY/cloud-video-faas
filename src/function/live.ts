import {
  Inject,
  Controller,
  Get,
  Post,
  Provide,
  Query,
  Param,
  Body,
  ALL,
} from '@midwayjs/decorator';
import { OSSService } from '@midwayjs/oss';
import { LiveComment } from '../model/live_comment';
import { LiveHome } from '../model/live_home';
import { User } from '../model/user';
import { getLiveUrl } from '../utils/getUrl';
import res_obj from '../utils/res_obj';

@Provide()
@Controller('/live')
export class LiveController {
  @Inject()
  ossService: OSSService;

  // 推荐直播列表
  @Get('/recommend')
  async getRecommendLive(@Query('pn') pn = 0) {
    const limit = 10;
    const ret = await LiveHome.findAll({
      where: {
        active: 1,
      },
      limit,
      offset: pn * limit,
      raw: true,
    });
    if (ret instanceof Error) {
      return res_obj('获取直播失败');
    }

    const res = [];

    for (let i = 0; i < ret.length; i++) {
      const { avatar } = await User.findOne({
        attributes: ['avatar'],
        where: {
          username: ret[i].username,
        },
      });

      res[i] = {
        avatar,
        ...ret[i],
      };
    }

    return res_obj('', res);
  }

  // 通过直播间id获取直播间
  @Get('/:liveId')
  async getLiveById(@Param('liveId') liveId) {
    const ret = await LiveHome.findOne({
      where: {
        id: liveId,
      },
    });

    if (ret instanceof Error) {
      return res_obj('获取房间失败');
    }

    return res_obj('', ret);
  }

  // 判断用户是否开通直播间
  @Get('/exist')
  async hasLiveRoom(@Query('username') username) {
    const ret = await LiveHome.findOne({
      attributes: ['id'],
      where: {
        username,
      },
    });

    if (ret instanceof Error) {
      return res_obj('获取直播间失败');
    }

    return res_obj('', {
      liveId: ret?.id || 0,
    });
  }

  // 创建直播间
  @Post('/create')
  async createLiveRoom(@Body(ALL) body) {
    const { title, description, active = 0, username, playback = 0 } = body;
    const ret = await LiveHome.create({
      username,
      title,
      active,
      playback,
      description,
    });

    if (ret instanceof Error) {
      return res_obj('直播间创建失败');
    }

    return res_obj('', {
      liveId: ret.id,
    });
  }

  // 修改直播间信息
  @Post('/update')
  async updateLiveRoom(
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('liveId') liveId: number
  ) {
    const res = await LiveHome.update(
      {
        title,
        description,
      },
      {
        where: {
          id: liveId,
        },
      }
    );
    if (res instanceof Error) {
      return res_obj('修改直播间信息失败');
    }
    return res_obj('');
  }

  // 开始直播
  @Post('/start')
  async startLive(@Body(ALL) body) {
    const { active = 1, playback = 0, liveId } = body;

    const pushUrl = getLiveUrl(liveId, false);
    const pullUrl = getLiveUrl(liveId, true);

    const ret = await LiveHome.update(
      {
        active,
        playback,
        pushUrl,
        pullUrl,
      },
      {
        where: {
          id: liveId,
        },
      }
    );

    if (ret instanceof Error) {
      return res_obj('直播开启失败');
    }

    return res_obj('', {
      pushUrl,
    });
  }

  // 关闭直播
  @Post('/stop')
  async stopLive(@Body('liveId') liveId: number) {
    const res = await LiveHome.update(
      {
        active: 0,
      },
      {
        where: {
          id: liveId,
        },
      }
    );
    if (res instanceof Error) {
      return res_obj('关闭直播失败');
    }
    return res_obj('');
  }

  // 获取根据liveId直播评论
  @Get('/:liveId/comment')
  async getCommentByLiveId(@Param('liveId') liveId) {
    const res = await LiveComment.findAll({
      where: {
        liveId,
      },
    });
    if (res instanceof Error) {
      return res_obj('获取直播评论失败');
    }
    return res_obj('', res);
  }

  // 进行直播评论
  @Post('/:liveId/make_comment')
  async makeCommment(@Param('liveId') liveId, @Body(ALL) body) {
    const { username, content } = body;
    const ret = await LiveComment.create({
      liveId,
      username,
      content,
    });
    if (ret instanceof Error) {
      return res_obj('评论失败');
    }
    return res_obj('');
  }
}
