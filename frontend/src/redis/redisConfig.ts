import {Redis} from 'ioredis';

const redis = new Redis({
    host: 'localhost', // или '127.0.0.1', если вы работаете локально
    port: 6379,
    password:'bodazopa2020' // Стандартный порт Redis
    // Вы также можете добавить другие параметры, такие как пароль, если настроили аутентификацию
  });
redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

export default redis;