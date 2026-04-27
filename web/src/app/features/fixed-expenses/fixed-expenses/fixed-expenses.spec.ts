import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedExpenses } from './fixed-expenses';

describe('FixedExpenses', () => {
  let component: FixedExpenses;
  let fixture: ComponentFixture<FixedExpenses>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedExpenses]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedExpenses);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
