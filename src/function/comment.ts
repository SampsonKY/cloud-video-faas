import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import res_obj from '../utils/res_obj';
import { Reply } from '../model/reply';
import { User } from '../model/user';
import { Comment } from '../model/comment';
import { VerifyMiddleware } from '../middleware/verify';
import format from '../utils/format';

@Provide()
@Controller('/comment')
export class CommentController {
  // 获取子评论
  @Get('/:commentId/subComment')
  async getSubComment(
    @Param('commentId') commentId,
    @Query('pn') pn: number,
    @Query('username') username
  ) {
    // const limit = 10;
    const result = await Reply.findAll({
      where: {
        commentId,
      },
      // offset: limit * pn,
      // limit: 10,
      raw: true,
      order: [['id', 'DESC']],
    });
    if (result instanceof Error) {
      return res_obj('评论获取失败');
    }

    const { like_reply } = await User.findOne({
      attributes: ['like_reply'],
      where: {
        username,
      },
    });

    const results = [];

    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      const { avatar } = await User.findOne({
        attributes: ['avatar'],
        where: {
          username: item.username,
        },
      });
      results[i] = {
        avatar,
        userLike: format(like_reply).includes(`${item.id}`),
        ...result[i],
      };
    }

    return res_obj('', {
      replies: results,
    });
  }

  // 点赞评论
  @Post('/:commentId/like', { middleware: [VerifyMiddleware] })
  async likeComment(
    @Param('commentId') commentId: string,
    @Body('username') username
  ) {
    const ret = await Comment.sequelize.query(
      `UPDATE comment SET likes=likes+1 WHERE id=${commentId}`
    );
    if (ret instanceof Error) {
      return res_obj('点赞失败');
    }

    const f_commentId = commentId + ',';
    const res = await User.sequelize.query(
      `UPDATE user SET like_comment=CONCAT('${f_commentId}', like_comment) WHERE username='${username}'`
    );
    if (res instanceof Error) {
      return res_obj('点赞失败');
    }

    return res_obj('', {
      succees: true,
    });
  }

  // 对评论进行回复
  @Post('/:commentId/reply', { middleware: [VerifyMiddleware] })
  async replyComment(@Param('commentId') commentId, @Body() p) {
    const { username, toUser, content, type } = p;
    const ret = await Reply.create({
      commentId,
      username,
      toUser,
      content,
      type,
    });
    if (ret instanceof Error) {
      return res_obj('评论失败');
    }

    // 将 replyId 加入comment表
    const replyId = ret.toJSON().id + ',';
    const res = await Comment.sequelize.query(
      `UPDATE comment SET replys=CONCAT('${replyId}', replys) WHERE id=${commentId}`
    );
    if (res instanceof Error) {
      return res_obj('评论异常');
    }

    return res_obj('', {
      success: true,
    });
  }
}
