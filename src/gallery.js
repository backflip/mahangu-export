import A11yDialog from "a11y-dialog";
import "./a11y-dialog.css";
import "./gallery.css";

class Gallery {
  constructor(options = {}) {
    this.options = { ...options };

    this.init();
  }

  init() {
    this.dialogContainer = document.querySelector("#dialog");
    this.title = this.dialogContainer.querySelector("[data-gallery-title]");
    this.content = this.dialogContainer.querySelector("[data-gallery-content]");

    if (!(this.dialogContainer && this.title && this.content)) {
      return;
    }

    // Init dialog
    this.dialog = new A11yDialog(this.dialogContainer);

    // Extract photos
    this.photos = [].map.call(
      document.querySelectorAll(".photos a"),
      (element) => {
        const src = element.href;
        const img = element.querySelector("img");
        const title = img.title;

        return { element, src, title };
      }
    );

    // Open dialog when clicking photo
    this.photos.forEach((photo, index) => {
      photo.element.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          this.show(index);
        },
        false
      );
    });

    // Show prev/next image when using arrow keys
    document.addEventListener(
      "keydown",
      (event) => {
        if (this.dialog.shown) {
          if (event.key === "ArrowLeft") {
            event.preventDefault();

            this.prev();
          } else if (event.key === "ArrowRight") {
            event.preventDefault();

            this.next();
          }
        }
      },
      false
    );

    // Prev/next buttons
    this.prevButton = this.dialogContainer.querySelector("[data-gallery-prev]");

    if (this.prevButton) {
      this.prevButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          this.prev();
        },
        false
      );
    }

    this.nextButton = this.dialogContainer.querySelector("[data-gallery-next]");

    if (this.nextButton) {
      this.nextButton.addEventListener(
        "click",
        (event) => {
          event.preventDefault();

          this.next();
        },
        false
      );
    }
  }

  show(index) {
    const photo = this.photos[index];

    if (!photo) {
      return;
    }

    const { src, title } = photo;

    this.dialog.show();

    this.title.innerHTML = title;
    this.content.innerHTML = `<img src="${src}" alt="${title}" />`;

    if (this.prevButton) {
      this.prevButton.disabled = index === 0;
    }
    if (this.nextButton) {
      this.nextButton.disabled = index === this.photos.length;
    }

    this.current = index;
  }

  prev() {
    this.show(this.current - 1);
  }

  next() {
    this.show(this.current + 1);
  }
}

export default Gallery;
