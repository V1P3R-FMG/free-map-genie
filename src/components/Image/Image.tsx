interface ImageWithFallback {
  url: string;
  fallback: string;
}

export type ImageUrl = string | ImageWithFallback;

const getUrl = (url: ImageUrl) => {
  if (typeof url === "string") {
    return url;
  } else {
    return url.url;
  }
};

export const Image = ({ src, alt, title, className }: Image.Props) => {
  const [url, setUrl] = React.useState<string>(getUrl(src));

  const onError = () => {
    if (typeof src === "string") return;

    if (url === src.url) {
      setUrl(src.fallback);
    } else if (url === src.fallback) {
      setUrl(src.fallback);
    }
  };

  return (
    <img
      src={url}
      alt={alt}
      title={title}
      className={className}
      onError={onError}
    />
  );
};

export namespace Image {
  export interface Props {
    src: ImageUrl;
    alt?: string;
    title?: string;
    className?: string;
  }
}
