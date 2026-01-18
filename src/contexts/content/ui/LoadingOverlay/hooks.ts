export const useScrollLock = () => {
  React.useEffect(() => {
    const { overflow, paddingRight } = document.body.style;

    const offsetWidth = window.innerWidth;

    // Get current computed padding right in pixels
    const currentPaddingRight =
      parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;

    const scrollbarWidth = offsetWidth - document.body.scrollWidth;
    document.body.style.paddingRight = `${scrollbarWidth + currentPaddingRight}px`;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);
};
