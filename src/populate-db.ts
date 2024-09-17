import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './services/seed.service';

async function populateDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  console.log('Populating the database...');

  await seedService.seedVehicleMakes();

  console.log('Database population completed.');

  await app.close();
}

populateDatabase().catch((err) => {
  console.error('Failed to populate database', err);
  process.exit(1);
});
