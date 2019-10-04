import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleTemplateComponent } from './sample-template.component';

describe('SampleTemplateComponent', () => {
  let component: SampleTemplateComponent;
  let fixture: ComponentFixture<SampleTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
