
const $: any = ((document, s_querySelectorAll, $?: any) => {
  return <any>($ = (s: any, context: any, bala = Object.create($.fn)): any => (
    s && bala.push( // if s is truly then push the following
      ...(s.dispatchEvent // if arg is node or window,
        ? [s] // then pass [s]
        : "" + s === s // else if arg is a string
          ? /</.test(s) // if the string contains "<" (if HTML code is passed)
            // then parse it and return node.children
            // use 'undefined' (HTMLUnknownElement) if context is not presented
            ? ((context = document.createElement(context)).innerHTML = s
              , context.children)
            : context // else if context is truly
              ? ((context = $(context)[0]) // if context element is found
                ? context.querySelectorAll(s) // then select element from context
                : bala) // else pass [] (context isn't found)
              : <any>document.querySelectorAll(s) // else select elements globally
          : s)), // else guessing that s variable is array-like Object
    bala
  )),
    ($.fn = []),
    ($.one = (s: any, context: any) => $(s, context)[0]),
    $

}


)(document, 'querySelectorAll');



interface options {

  el: String

}


class Popup {



  el: any = null;


  constructor(opts: options) {

    // this.el = ;


    console.log($(opts.el))


    const closer: HTMLElement = document.createElement("div");


    const $el = $(opts.el)[0];

    this.el = $el


    $el.appendChild(closer)




    $el.style.display = 'none'

    closer.classList.add("close");

    closer.innerHTML = '<div class="close-text">CLOSE</div'
    closer.addEventListener("click", e => {
      this.close()
    })







    const open = () => this.open($el);

    return <any>{
      open
    }











  }

  open(el: HTMLElement) {


    // console.log(this.el)


    // this.el.style.display = 'block'

  }
  close() {

    console.log(12121212)


  }


}


export default Popup