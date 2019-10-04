import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterDeskComponent } from './twitter-desk.component';

describe('TwitterDeskComponent', () => {
  let component: TwitterDeskComponent;
  let fixture: ComponentFixture<TwitterDeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitterDeskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitterDeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
