import { TestBed } from '@angular/core/testing';

import { Projection } from './projection';

describe('Projection', () => {
  let service: Projection;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Projection);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
