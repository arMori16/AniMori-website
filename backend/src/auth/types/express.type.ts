import { JwtPayload } from './jwtPayload.type'; // Путь к вашему типу JwtPayload

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Добавляем свойство user
    }
  }
}