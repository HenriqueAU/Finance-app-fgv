import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Intentions } from './intentions';

describe('Intentions', () => {
  let component: Intentions;
  let fixture: ComponentFixture<Intentions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Intentions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Intentions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
