import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { LikesModule } from './likes/likes.module';
import { RedisModule } from './redis/redis.module';
import { RegionsModule } from './regions/regions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SearchModule } from './search/search.module';
import { SlotsModule } from './slots/slots.module';
import { StoresModule } from './stores/stores.module';
import { ThemesModule } from './themes/themes.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    RegionsModule,
    StoresModule,
    ThemesModule,
    ReviewsModule,
    LikesModule,
    BookmarksModule,
    SlotsModule,
    SearchModule,
    UploadModule,
  ],
})
export class AppModule {}
