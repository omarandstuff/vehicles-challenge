import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { VehicleMakeService } from './services/vehicle-make.service';
import { AppModule } from './app.module';

describe('main', () => {
  let app: INestApplication;
  let vehicleMakeService: VehicleMakeService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    vehicleMakeService = module.get<VehicleMakeService>(VehicleMakeService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated vehicle makes', async () => {
    const query = `
      query {
        getVehicleMakes(first: 10, after: "") {
          edges {
            cursor
            node {
              makeId
              makeName
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const spy = jest
      .spyOn(vehicleMakeService, 'findAllPaginated')
      .mockResolvedValue({
        edges: [
          {
            cursor: '1',
            node: { makeId: '1', makeName: 'Toyota', vehicleTypes: [] },
          },
          {
            cursor: '2',
            node: { makeId: '2', makeName: 'Honda', vehicleTypes: [] },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: '2',
        },
      });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      getVehicleMakes: {
        edges: [
          {
            cursor: '1',
            node: { makeId: '1', makeName: 'Toyota' },
          },
          {
            cursor: '2',
            node: { makeId: '2', makeName: 'Honda' },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: '2',
        },
      },
    });

    expect(spy).toHaveBeenCalledWith(10, '');
    spy.mockRestore();
  });
});
