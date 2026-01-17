interface ImageWithFallback {
  url: string;
  fallback: string;
}

export type ImageUrl = string | ImageWithFallback;

export const Image = ({
  src,
  alt,
  title,
  className,
  hideOnFail,
  draggable,
}: Image.Props) => {
  const [success, setSuccess] = React.useState(true);
  const [url, setUrl] = React.useState(typeof src === "string" ? src : src.url);

  if (!success && hideOnFail) {
    return null;
  }

  const onError = () => {
    if (typeof src === "string") {
      setSuccess(false);
      return;
    }

    if (url !== src.fallback) {
      setUrl(src.fallback);
    } else {
      setSuccess(false);
    }
  };

  return (
    <img
      className={className}
      src={url}
      alt={alt}
      title={title}
      onError={onError}
      draggable={draggable}
    />
  );
};

export namespace Image {
  export interface Props {
    src: ImageUrl;
    alt?: string;
    title?: string;
    className?: string;
    hideOnFail?: boolean;
    draggable?: boolean;
  }
}
