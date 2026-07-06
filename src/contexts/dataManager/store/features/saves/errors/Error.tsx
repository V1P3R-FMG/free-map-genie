import { ZodError } from "./ZodError";

export const Error = ({ error }: Error.Props) => {
  if (typeof error === "string") {
    return <div>Error: {error}</div>;
  }

  if (typeof error === "object") {
    switch (error?.type) {
      case "ZodError":
        return <ZodError error={error} />;
    }
  }

  return <div>Error: {String(error)}</div>;
};

namespace Error {
  export interface Props {
    error: any;
  }
}
