import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwitterCheckComponent } from './twitter-check.component';

describe('TwitterCheckComponent', () => {
  let component: TwitterCheckComponent;
  let fixture: ComponentFixture<TwitterCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwitterCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwitterCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
