import { IMiddleware } from '@midwayjs/core';
import { Middleware, Config } from '@midwayjs/decorator';
import { NextFunction, Context } from '@midwayjs/koa';
import res_obj from '../utils/res_obj';
const jwt = require('jsonwebtoken');

@Middleware()
export class VerifyMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('jwt')
  jwtConfig;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const token =
        ctx.headers.authorization && ctx.headers.authorization.split(' ').pop();
      try {
        const user = jwt.verify(token, this.jwtConfig.secret);
        console.log('user', user);
        if (user) await next();
      } catch (error) {
        console.log('error', error);
        return res_obj('身份认证失败', {
          code: 1001,
        });
      }
    };
  }
}
