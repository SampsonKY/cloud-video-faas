import { Body, Controller, Param, Post, Provide } from '@midwayjs/decorator';
import res_obj from '../utils/res_obj';
import { Reply } from '../model/reply';
import { VerifyMiddleware } from '../middleware/verify';
import { User } from '../model/user';

@Provide()
@Controller('/reply')
export class ReplyController {
  // 点赞评论回复
  @Post('/:replyId/like', { middleware: [VerifyMiddleware] })
  async likeReply(
    @Param('replyId') replyId: string,
    @Body('username') username
  ) {
    const ret = await Reply.sequelize.query(
      `UPDATE reply SET likes=likes+1 WHERE id=${replyId}`
    );
    if (ret instanceof Error) {
      return res_obj('点赞失败');
    }

    const f_replyId = replyId + ',';
    const res = await User.sequelize.query(
      `UPDATE user SET like_reply=CONCAT('${f_replyId}', like_reply) WHERE username='${username}'`
    );
    if (res instanceof Error) {
      return res_obj('点赞失败');
    }

    return res_obj('', {
      succees: true,
    });
  }
}
