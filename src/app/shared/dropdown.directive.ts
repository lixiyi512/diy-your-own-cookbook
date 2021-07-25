import { Directive, HostListener, HostBinding, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appDropdown]'
})
export class DropdownDirective implements AfterViewInit {
  @HostBinding('class.open') isOpen = false;

  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  // el: ElementRef;

  // constructor(el: ElementRef) {
  //   this.el = el;
  // }

  ngAfterViewInit() {
    // console.log(this.el.nativeElement.children[1]);
  }
}
