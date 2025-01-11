import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePageCoverComponent } from './home-page-cover.component';

describe('HomePageCoverComponent', () => {
  let component: HomePageCoverComponent;
  let fixture: ComponentFixture<HomePageCoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageCoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePageCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
