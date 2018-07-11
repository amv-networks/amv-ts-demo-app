import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main-faq',
  templateUrl: './main-faq.component.html',
  styleUrls: ['./main-faq.component.scss']
})

export class MainFaqComponent implements OnInit, AfterViewInit {

  private fragment: string;
  faqs: any[];

  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });

    this.faqs = [{
      title: 'Lorem ipsum dolor sit amet?',
      anchorTag: 'faq-test',
      text: 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut ' +
        'labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ' +
        'ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. ' +
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore ' +
        'et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. ' +
        'Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'
    }
    ];
  }

  ngAfterViewInit(): void {
    try {
      document.querySelector('#' + this.fragment).scrollIntoView({ block: 'end', behavior: 'smooth' });
    } catch (e) { }

    this.route.fragment.subscribe(fragment => {
      try {
        document.querySelector('#' + fragment).scrollIntoView({ block: 'end', behavior: 'smooth' });
      } catch (e) { }
    });
  }

}
