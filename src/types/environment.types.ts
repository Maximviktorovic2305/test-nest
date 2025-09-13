export interface Environment {
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  redisHost: string;
  redisPort: number;
  port: number;
}
